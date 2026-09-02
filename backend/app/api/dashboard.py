from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import RecoveryCase, Payment
from app.security.auth import get_current_merchant

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def dashboard(db: Session = Depends(get_db), merchant = Depends(get_current_merchant)):
    mid = merchant["merchant_id"]
    rows = db.query(RecoveryCase).filter_by(merchant_id=mid).all()
    
    risk_paise = sum(x.amount_paise for x in rows if x.status != "recovered")
    recovered_paise = sum(x.recovered_amount_paise for x in rows if x.recovered_amount_paise)
    total_cases = len(rows)
    recovered_cases = sum(1 for x in rows if x.status == "recovered")
    
    payments = db.query(Payment).filter_by(merchant_id=mid).all()
    total_payments = len(payments) if payments else total_cases
    failed_payments = sum(1 for p in payments if p.status == "failed") if payments else total_cases
    recovered_payments = recovered_cases
    
    return {
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
    }
