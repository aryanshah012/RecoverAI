from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import PaymentDegradationEvent
from app.security.auth import get_current_merchant
from app.services.analytics_service import leakage_summary, leakage_by_method, strategy_performance, failure_reason_breakdown, leakage_timeline
from app.services.degradation_service import scan_payment_health
router=APIRouter(prefix="/api/analytics",tags=["Analytics"])
@router.get("/leakage")
def leakage(days:int=Query(30,ge=1,le=365),db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    m=merchant["merchant_id"]
    end=datetime.utcnow()+timedelta(days=1); start=end-timedelta(days=days)
    return {
        "period":{"days":days,"start":start,"end":end},
        "summary": leakage_summary(db,m,start,end),
        "by_payment_method": leakage_by_method(db,m,start,end),
        "strategy_performance": strategy_performance(db,m,start,end),
        "reasons": failure_reason_breakdown(db,m,start,end),
        "timeline": leakage_timeline(db,m,start,end),
    }
@router.get("/degradation")
def degradation(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(PaymentDegradationEvent).filter_by(merchant_id=merchant["merchant_id"]).order_by(PaymentDegradationEvent.detected_at.desc()).all()
@router.post("/degradation/scan")
def scan(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    e=scan_payment_health(db,merchant["merchant_id"]); return {"detected":len(e),"events":e}
