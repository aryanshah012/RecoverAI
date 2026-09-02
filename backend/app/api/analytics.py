from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import PaymentDegradationEvent
from app.security.auth import get_current_merchant
from app.services.analytics_service import leakage_summary, leakage_by_method, strategy_performance, failure_reason_breakdown, leakage_timeline
from app.services.degradation_service import scan_payment_health
router=APIRouter(prefix="/api/analytics",tags=["Analytics"])
@router.get("/leakage")
def leakage(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    m=merchant["merchant_id"]
    return {
        "summary": leakage_summary(db,m),
        "by_payment_method": leakage_by_method(db,m),
        "strategy_performance": strategy_performance(db,m),
        "reasons": failure_reason_breakdown(db,m),
        "timeline": leakage_timeline(db,m),
    }
@router.get("/degradation")
def degradation(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(PaymentDegradationEvent).filter_by(merchant_id=merchant["merchant_id"]).order_by(PaymentDegradationEvent.detected_at.desc()).all()
@router.post("/degradation/scan")
def scan(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    e=scan_payment_health(db,merchant["merchant_id"]); return {"detected":len(e),"events":e}
