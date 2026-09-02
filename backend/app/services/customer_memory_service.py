from datetime import datetime
from app.models import CustomerRecoveryMemory

def get_or_create_memory(db, customer_id, merchant_id="merchant_demo"):
    m=db.query(CustomerRecoveryMemory).filter_by(merchant_id=merchant_id,customer_id=customer_id).first()
    if not m:
        m=CustomerRecoveryMemory(merchant_id=merchant_id,customer_id=customer_id,action_performance={},recovery_history=[])
        db.add(m); db.commit(); db.refresh(m)
    return m

def record_recovery_outcome(db, customer_id, action, amount_paise, success, source_type="payment", recovery_hour=None, merchant_id="merchant_demo"):
    m=get_or_create_memory(db, customer_id, merchant_id)
    m.total_recovery_attempts += 1
    if success: m.successful_recoveries += 1
    m.recovery_success_rate = m.successful_recoveries/max(m.total_recovery_attempts,1)
    perf=dict(m.action_performance or {})
    key=f"{source_type}:{action}"
    stat=dict(perf.get(key,{"attempts":0,"successes":0,"recovered_amount_paise":0}))
    stat["attempts"]+=1
    if success:
        stat["successes"]+=1; stat["recovered_amount_paise"]+=amount_paise
    stat["success_rate"]=stat["successes"]/stat["attempts"]
    perf[key]=stat; m.action_performance=perf
    hist=list(m.recovery_history or [])
    hist.append({"source_type":source_type,"action":action,"amount_paise":amount_paise,"success":success,"hour":recovery_hour,"timestamp":datetime.utcnow().isoformat()})
    m.recovery_history=hist[-100:]
    if perf:
        m.best_recovery_action=max(perf,key=lambda k:perf[k].get("success_rate",0))
    successful_hours=[x.get("hour") for x in hist if x.get("success") and x.get("hour") is not None]
    if successful_hours: m.best_recovery_hour=max(set(successful_hours),key=successful_hours.count)
    m.recovery_score=round((m.recovery_success_rate*.75 + min(m.total_transactions/50,1)*.25)*100,2)
    db.commit(); db.refresh(m); return m
