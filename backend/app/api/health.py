from fastapi import APIRouter
from sqlalchemy import text
from app.database.session import SessionLocal
from app.config import settings
from app.middleware.metrics import api_metrics
router=APIRouter(tags=["Health"])
@router.get("/health")
def health():
    status="healthy"
    try:
        db=SessionLocal(); db.execute(text("SELECT 1")); db.close()
    except Exception: status="degraded"
    return {"status":status,"service":"recoverai-api","razorpay":{"enabled":settings.razorpay_enabled,"mode":"test" if settings.razorpay_enabled else "mock"}}
@router.get("/ready")
def ready(): return {"ready":True}
@router.get("/health/metrics")
def metrics(): return api_metrics.snapshot()
