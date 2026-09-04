import re
import time
from collections import Counter
from threading import Lock

from app.logging_config import logger
from app.models import RecoveryCase
from app.services.analytics_service import leakage_by_method, leakage_summary, strategy_performance


class CopilotMetrics:
    """Aggregate-only metrics: questions, merchant IDs, and retrieved rows are excluded."""

    def __init__(self):
        self._lock = Lock()
        self._requests = Counter()
        self._retrieved_items = Counter()
        self._latency_ms = Counter()

    def record(self, intent: str, status: str, items: int, latency_ms: float) -> None:
        key = f"{intent}:{status}"
        with self._lock:
            self._requests[key] += 1
            self._retrieved_items[key] += items
            self._latency_ms[key] += latency_ms

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "requests": sum(self._requests.values()),
                "results": [
                    {
                        "intent": key.split(":", 1)[0],
                        "retrieval_status": key.split(":", 1)[1],
                        "requests": count,
                        "average_retrieved_items": round(self._retrieved_items[key] / count, 2),
                        "average_latency_ms": round(self._latency_ms[key] / count, 2),
                    }
                    for key, count in sorted(self._requests.items())
                ],
            }


copilot_metrics = CopilotMetrics()


def detect_intent(question: str) -> str:
    text = question.casefold()
    if "payment method" in text and ("leak" in text or "loss" in text):
        return "leakage_by_method"
    if "recovered" in text and ("revenue" in text or "money" in text):
        return "recovered_revenue"
    if "strategy" in text and ("best" in text or "perform" in text):
        return "strategy_performance"
    if "why" in text and ("stop" in text or "stopped" in text):
        return "case_explanation"
    return "unsupported"


def _result(message: str, intent: str, data, evidence: list[dict], status: str) -> dict:
    return {
        "answer": message,
        "intent": intent,
        "data": data,
        "retrieval": {"status": status, "item_count": len(evidence)},
        "grounding": {
            "grounded": status in {"ok", "empty"},
            "method": "deterministic_template_from_verified_query",
            "evidence": evidence,
        },
    }


def answer(db, question: str, merchant_id: str = "merchant_demo", trace_id: str | None = None) -> dict:
    started = time.perf_counter()
    intent = detect_intent(question)
    data = None
    evidence: list[dict] = []
    status = "ok"

    if intent == "leakage_by_method":
        data = leakage_by_method(db, merchant_id)
        top = max(data, key=lambda item: item["revenue_at_risk_paise"]) if data else None
        if top:
            evidence = [{"source": "payments", "metric": "revenue_at_risk_paise", "value": top["revenue_at_risk_paise"], "group": top["payment_method"]}]
            message = f"{top['payment_method'].upper()} has the highest failed-payment revenue at risk in the current dataset: ₹{top['revenue_at_risk_paise']/100:,.2f}."
        else:
            status, message = "empty", "No failed-payment leakage data is available for this merchant."
    elif intent == "recovered_revenue":
        data = leakage_summary(db, merchant_id)
        value = data["recovered_revenue_paise"]
        evidence = [{"source": "recovery_cases", "metric": "recovered_revenue_paise", "value": value}]
        message = f"RecoverAI has recorded ₹{value/100:,.2f} in recovered revenue."
    elif intent == "strategy_performance":
        data = strategy_performance(db, merchant_id)
        top = max(data, key=lambda item: item["recovered_revenue_paise"]) if data else None
        if top:
            evidence = [{"source": "recovery_cases", "metric": "recovered_revenue_paise", "value": top["recovered_revenue_paise"], "group": top["strategy"]}]
            message = f"{top['strategy']} has recovered the most revenue: ₹{top['recovered_revenue_paise']/100:,.2f}."
        else:
            status, message = "empty", "No strategy performance data is available for this merchant."
    elif intent == "case_explanation":
        match = re.search(r"\b(\d+)\b", question)
        case = db.query(RecoveryCase).filter_by(id=int(match.group(1)), merchant_id=merchant_id).first() if match else None
        if case:
            data = {"case_id": case.id, "status": case.status, "policy_status": case.policy_status, "policy_reason": case.policy_reason, "selected_action": case.selected_action}
            evidence = [{"source": "recovery_cases", "record_id": case.id, "fields": ["status", "policy_status", "policy_reason", "selected_action"]}]
            message = f"Case {case.id} is {case.status}. Policy: {case.policy_status}. Reason: {case.policy_reason or 'No policy reason was recorded.'}"
        else:
            status, message = "empty", "I could not find that recovery case for this merchant. Check the case number and try again."
    else:
        status = "unsupported"
        message = "I cannot answer that from the approved data sources. Try one of the verified prompt presets."

    result = _result(message, intent, data, evidence, status)
    elapsed_ms = (time.perf_counter() - started) * 1000
    copilot_metrics.record(intent, status, len(evidence), elapsed_ms)
    logger.info("copilot_query_completed", trace_id=trace_id, intent=intent, retrieval_status=status, retrieved_items=len(evidence), grounded=result["grounding"]["grounded"], latency_ms=round(elapsed_ms, 2))
    return result
