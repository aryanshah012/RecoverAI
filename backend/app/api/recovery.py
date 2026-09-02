from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Payment, RecoveryCase
from app.security.auth import get_current_merchant
from app.services.recovery_service import run_recovery
router=APIRouter(prefix="/api/recovery",tags=["Recovery"])
def case_dict(c: RecoveryCase):
    return {col.name: getattr(c, col.name) for col in c.__table__.columns}

@router.post("/batch-run")
def batch_run(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    mid = merchant["merchant_id"]
    failed_payments = db.query(Payment).filter_by(merchant_id=mid, status="failed").all()
    created_cases = []
    for p in failed_payments:
        c = run_recovery(db, p)
        created_cases.append(case_dict(c))
    return {"total_processed": len(failed_payments), "cases": created_cases}

@router.post("/{payment_id}/run")
def run(payment_id:str,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    p=db.query(Payment).filter_by(payment_id=payment_id,merchant_id=merchant["merchant_id"]).first()
    if not p: raise HTTPException(404,"Payment not found")
    c = run_recovery(db,p)
    return case_dict(c)
@router.get("/cases")
def cases(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(RecoveryCase).filter_by(merchant_id=merchant["merchant_id"]).order_by(RecoveryCase.created_at.desc()).all()
@router.get("/cases/{case_id}")
def case(case_id:int,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    c=db.query(RecoveryCase).filter_by(id=case_id,merchant_id=merchant["merchant_id"]).first()
    if not c: raise HTTPException(404,"Recovery case not found")
    return c
@router.get("/by-reference/{reference}")
def get_by_reference(reference:str,db:Session=Depends(get_db)):
    c=db.query(RecoveryCase).filter_by(recovery_reference=reference).first()
    if not c: raise HTTPException(404,"Recovery case not found")
    return case_dict(c)
