from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import HumanReview, RecoveryCase
from app.security.auth import get_current_merchant
from app.services.audit_service import audit
router=APIRouter(prefix="/api/human-review",tags=["Human Review"])
class Decision(BaseModel): decision:str; note:str|None=None
@router.get("")
def queue(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(HumanReview).join(RecoveryCase,RecoveryCase.id==HumanReview.recovery_case_id).filter(RecoveryCase.merchant_id==merchant["merchant_id"],HumanReview.status=="pending").all()
@router.post("/{review_id}")
def decide(review_id:int,payload:Decision,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    r=db.query(HumanReview).join(RecoveryCase).filter(HumanReview.id==review_id,RecoveryCase.merchant_id==merchant["merchant_id"]).first()
    if not r: raise HTTPException(404,"Review not found")
    if payload.decision not in {"approve","reject","stop"}: raise HTTPException(400,"Invalid decision")
    c=db.query(RecoveryCase).get(r.recovery_case_id); r.status=payload.decision; r.reviewer_note=payload.note; r.decided_at=datetime.utcnow(); c.status="approved" if payload.decision=="approve" else "stopped"; db.commit(); audit(db,"human_review_decision",f"Human review: {payload.decision}",c.id,{"note":payload.note},merchant["merchant_id"]); return {"ok":True}
