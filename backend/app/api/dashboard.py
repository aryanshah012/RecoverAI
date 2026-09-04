from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import RecoveryCase, Payment
from app.security.auth import get_current_merchant

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def dashboard(days:int=Query(30,ge=1,le=365),db: Session = Depends(get_db), merchant = Depends(get_current_merchant)):
    mid = merchant["merchant_id"]
    end=datetime.utcnow()+timedelta(days=1); start=end-timedelta(days=days); previous_start=start-timedelta(days=days)
    rows = db.query(RecoveryCase).filter(RecoveryCase.merchant_id==mid,RecoveryCase.created_at>=start,RecoveryCase.created_at<end).all()
    previous = db.query(RecoveryCase).filter(RecoveryCase.merchant_id==mid,RecoveryCase.created_at>=previous_start,RecoveryCase.created_at<start).all()
    
    risk_paise = sum(x.amount_paise for x in rows if x.status != "recovered")
    recovered_paise = sum(x.recovered_amount_paise for x in rows if x.recovered_amount_paise)
    total_cases = len(rows)
    recovered_cases = sum(1 for x in rows if x.status == "recovered")
    
    payments = db.query(Payment).filter(Payment.merchant_id==mid,Payment.created_at>=start,Payment.created_at<end).all()
    total_payments = len(payments) if payments else total_cases
    failed_payments = sum(1 for p in payments if p.status == "failed") if payments else total_cases
    recovered_payments = recovered_cases
    
    previous_risk=sum(x.amount_paise for x in previous if x.status!="recovered")
    previous_recovered=sum(x.recovered_amount_paise for x in previous if x.recovered_amount_paise)
    def change(current, prior): return round((current-prior)/prior*100,1) if prior else (100.0 if current else 0.0)
    return {
        "period":{"days":days,"start":start,"end":end},
        # Section 15 setup guide schema
        "total_payments": total_payments,
        "failed_payments": failed_payments,
        "recovered_payments": recovered_payments,
        "revenue_at_risk": round(risk_paise / 100, 2),
        "recovered_revenue": round(recovered_paise / 100, 2),
        # Platform high-precision fields
        "revenue_at_risk_paise": risk_paise,
        "recovered_revenue_paise": recovered_paise,
        "recovery_rate": round(recovered_cases / total_cases, 4) if total_cases else 0.0,
        "active_recoveries": sum(
            1 for x in rows if x.status in {"created", "approved", "executing", "waiting_human_review"}
        ),
        "trends":{"revenue_at_risk_pct":change(risk_paise,previous_risk),"recovered_revenue_pct":change(recovered_paise,previous_recovered),"recovery_rate_pct":change((recovered_cases/total_cases) if total_cases else 0,(sum(1 for x in previous if x.status=="recovered")/len(previous)) if previous else 0)},
    }
