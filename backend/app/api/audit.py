from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import AuditLog
from app.security.auth import get_current_merchant
router=APIRouter(prefix="/api/audit",tags=["Audit"])
@router.get("")
def logs(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(AuditLog).filter_by(merchant_id=merchant["merchant_id"]).order_by(AuditLog.created_at.desc()).limit(500).all()
