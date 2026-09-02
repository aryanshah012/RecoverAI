import re
from app.services.analytics_service import leakage_by_method, leakage_summary, strategy_performance
from app.models import RecoveryCase

def detect_intent(q:str):
    t=q.lower()
    if "payment method" in t and ("leak" in t or "loss" in t): return "leakage_by_method"
    if "recovered" in t and ("revenue" in t or "money" in t): return "recovered_revenue"
    if "strategy" in t and ("best" in t or "perform" in t): return "strategy_performance"
    if "why" in t and ("stop" in t or "stopped" in t): return "case_explanation"
    return "unsupported"

def answer(db, question:str, merchant_id="merchant_demo"):
    intent=detect_intent(question)
    if intent=="leakage_by_method":
        data=leakage_by_method(db,merchant_id); top=max(data,key=lambda x:x["revenue_at_risk_paise"]) if data else None
        msg=(f"{top['payment_method'].upper()} has the highest failed-payment revenue at risk in the current dataset: ₹{top['revenue_at_risk_paise']/100:,.2f}.") if top else "No failed-payment leakage data is available."
    elif intent=="recovered_revenue":
        data=leakage_summary(db,merchant_id); msg=f"RecoverAI has recorded ₹{data['recovered_revenue_paise']/100:,.2f} in recovered revenue."
    elif intent=="strategy_performance":
        data=strategy_performance(db,merchant_id); top=max(data,key=lambda x:x["recovered_revenue_paise"]) if data else None; msg=(f"{top['strategy']} has recovered the most revenue: ₹{top['recovered_revenue_paise']/100:,.2f}.") if top else "No strategy performance data is available."
    elif intent=="case_explanation":
        m=re.search(r"\b(\d+)\b",question); case=db.query(RecoveryCase).filter_by(id=int(m.group(1)),merchant_id=merchant_id).first() if m else None
        data={"case_id":case.id,"status":case.status,"policy_status":case.policy_status,"policy_reason":case.policy_reason,"selected_action":case.selected_action} if case else None
        msg=f"Case {case.id} is {case.status}. Policy: {case.policy_status}. Reason: {case.policy_reason}" if case else "I could not identify a valid recovery case from that question."
    else: data=None; msg="I do not have an approved analytics tool for that question yet."
    return {"answer":msg,"intent":intent,"data":data}
