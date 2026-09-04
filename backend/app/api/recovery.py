from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Payment, RecoveryCase, RecoveryAction, AuditLog, HumanReview
from app.services.audit_service import audit
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
    payment=db.query(Payment).filter_by(payment_id=c.payment_id,merchant_id=merchant["merchant_id"]).first() if c.payment_id else None
    actions=db.query(RecoveryAction).filter_by(recovery_case_id=c.id).order_by(RecoveryAction.created_at.asc()).all()
    events=db.query(AuditLog).filter_by(recovery_case_id=c.id,merchant_id=merchant["merchant_id"]).order_by(AuditLog.created_at.asc()).all()
    review=db.query(HumanReview).filter_by(recovery_case_id=c.id).first()
    return {"case":case_dict(c),"payment":payment,"actions":actions,"events":events,"review":review}

class CaseCommand(BaseModel):
    action: str
    note: str | None = Field(default=None,max_length=1000)

@router.post("/cases/{case_id}/command")
def command_case(case_id:int,payload:CaseCommand,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    c=db.query(RecoveryCase).filter_by(id=case_id,merchant_id=merchant["merchant_id"]).first()
    if not c: raise HTTPException(404,"Recovery case not found")
    transitions={"pause":({"created","approved","executing"},"paused"),"resume":({"paused"},"approved"),"stop":({"created","approved","executing","paused","waiting_human_review"},"stopped"),"retry":({"stopped","failed"},"approved")}
    if payload.action=="note":
        if not payload.note: raise HTTPException(400,"A note is required")
        audit(db,"case_note_added",payload.note,c.id,{},merchant["merchant_id"]); return {"ok":True,"case":case_dict(c)}
    if payload.action not in transitions: raise HTTPException(400,"Unsupported case command")
    allowed,target=transitions[payload.action]
    if c.status not in allowed: raise HTTPException(409,f"Cannot {payload.action} a case in {c.status} status")
    previous=c.status; c.status=target; db.commit(); db.refresh(c)
    audit(db,f"case_{payload.action}",payload.note or f"Case {payload.action} requested",c.id,{"from":previous,"to":target},merchant["merchant_id"])
    return {"ok":True,"case":case_dict(c)}
@router.get("/by-reference/{reference}")
def get_by_reference(reference:str,db:Session=Depends(get_db)):
    c=db.query(RecoveryCase).filter_by(recovery_reference=reference).first()
    if not c: raise HTTPException(404,"Recovery case not found")
    return case_dict(c)
