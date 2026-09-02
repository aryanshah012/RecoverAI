from datetime import datetime, timedelta
from sqlalchemy import func
from app.models import Payment, PaymentDegradationEvent

PAYMENT_METHODS=["upi","card","netbanking","wallet"]

def _stats(db, method, start, end):
    rows=db.query(Payment).filter(Payment.payment_method==method,Payment.created_at>=start,Payment.created_at<end).all()
    total=len(rows); failed=[p for p in rows if p.status=="failed"]
    return total, len(failed), sum(p.amount_paise for p in failed)

def detect_degradation(db, payment_method, merchant_id="merchant_demo"):
    now=datetime.utcnow(); recent=now-timedelta(hours=1); base_start=now-timedelta(days=7)
    bt,bf,_=_stats(db,payment_method,base_start,recent); rt,rf,risk=_stats(db,payment_method,recent,now)
    if bt<30 or rt<10: return None
    br=bf/bt if bt else 0; rr=rf/rt if rt else 0; delta=rr-br
    if not (delta>=.03 and rr>=max(br*1.5,.03)): return None
    sev="critical" if delta>=.10 else "high" if delta>=.05 else "medium"
    event=PaymentDegradationEvent(merchant_id=merchant_id,payment_method=payment_method,baseline_failure_rate=br,current_failure_rate=rr,failure_rate_increase=delta,revenue_at_risk_paise=risk,severity=sev,details={"baseline_count":bt,"recent_count":rt})
    db.add(event); db.commit(); db.refresh(event); return event

def scan_payment_health(db, merchant_id="merchant_demo"):
    return [e for m in PAYMENT_METHODS if (e:=detect_degradation(db,m,merchant_id))]
