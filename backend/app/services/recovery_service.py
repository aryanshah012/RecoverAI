import uuid
from sqlalchemy.orm import Session
from app.agents.diagnosis import diagnose
from app.agents.strategy import candidate_actions
from app.agents.optimizer import choose_best_action
from app.models import RecoveryCase, Payment, HumanReview, RecoveryAction, PaymentDegradationEvent, MerchantSettings
from app.policies.recovery_policy import evaluate_policy
from app.services.customer_memory_service import get_or_create_memory
from app.services.timing_service import choose_best_recovery_time
from app.services.razorpay_service import razorpay_service
from app.services.audit_service import audit

def fallback_probability(payment:Payment):
    p=.55
    p += {"network_error":.15,"authentication_failed":.08,"bank_decline":.02,"insufficient_funds":-.08,"expired_card":-.10}.get(payment.failure_reason,0)
    p += max(min((1-payment.attempt_number)*.03,.06),-.08)
    return max(.05,min(p,.95))

def run_recovery(db:Session, payment:Payment, recovery_probability:float|None=None):
    duplicate=db.query(RecoveryCase).filter(RecoveryCase.merchant_id==payment.merchant_id,RecoveryCase.payment_id==payment.payment_id,RecoveryCase.status.in_(["created","approved","executing","paused","waiting_human_review"])).first()
    if duplicate: return duplicate
    memory=get_or_create_memory(db,payment.customer_id,payment.merchant_id)
    diag=diagnose(payment.failure_reason); p=recovery_probability if recovery_probability is not None else fallback_probability(payment)
    active_degradation=db.query(PaymentDegradationEvent).filter_by(merchant_id=payment.merchant_id,payment_method=payment.payment_method,status="active").first()
    best=choose_best_action(payment.amount_paise,p,candidate_actions(diag["diagnosis"]),memory.best_recovery_action,(memory.action_performance or {}).get(memory.best_recovery_action,{}).get("success_rate",0) if memory.best_recovery_action else 0,bool(active_degradation))
    settings=db.query(MerchantSettings).filter_by(merchant_id=payment.merchant_id).first()
    max_retries=settings.max_retries if settings else 3; max_auto=settings.max_automated_amount_paise if settings else 2_500_000
    decision=evaluate_policy(amount_paise=payment.amount_paise,attempt_number=payment.attempt_number,recovery_probability=p,max_retries=max_retries,max_automated_amount_paise=max_auto,duplicate_active=False,intervention_cost_paise=best["cost_paise"])
    case=RecoveryCase(merchant_id=payment.merchant_id,payment_id=payment.payment_id,source_type="payment",source_id=payment.payment_id,customer_id=payment.customer_id,amount_paise=payment.amount_paise,status="created",diagnosis=diag["diagnosis"],confidence=diag["confidence"],recovery_probability=p,selected_action=best["action"],expected_recovery_paise=best["expected_recovery_paise"],intervention_cost_paise=best["cost_paise"],expected_net_recovery_paise=best["expected_net_recovery_paise"],policy_status=decision.status,policy_reason=decision.reason,recovery_reference=f"recovery_{uuid.uuid4().hex}",recommended_time=choose_best_recovery_time(memory.best_recovery_hour,payment.failure_reason or ""))
    db.add(case); db.commit(); db.refresh(case); audit(db,"recovery_case_created","Recovery case created",case.id,{"policy":decision.status,"action":case.selected_action},payment.merchant_id)
    if decision.status=="HUMAN_REVIEW_REQUIRED":
        case.status="waiting_human_review"; db.add(HumanReview(recovery_case_id=case.id,status="pending",reason=decision.reason)); db.commit(); return case
    if decision.status!="APPROVED": case.status="stopped"; db.commit(); return case
    case.status="approved"
    if case.selected_action=="send_payment_link":
        out=razorpay_service.create_payment_link(payment.amount_paise,customer_email=payment.customer_email,customer_phone=payment.customer_phone,reference_id=case.recovery_reference)
        case.external_id=out["id"]; case.external_url=out["short_url"]; case.provider="razorpay"; case.execution_mode=out["mode"]
        db.add(RecoveryAction(recovery_case_id=case.id,action_type=case.selected_action,status="created",external_id=out["id"],external_url=out["short_url"],provider="razorpay",execution_mode=out["mode"]))
    else:
        db.add(RecoveryAction(recovery_case_id=case.id,action_type=case.selected_action,status="simulated",provider="recoverai",execution_mode="simulation"))
    db.commit(); db.refresh(case); audit(db,"recovery_action_selected",f"Selected {case.selected_action}",case.id,{"expected_net_paise":case.expected_net_recovery_paise},payment.merchant_id); return case
