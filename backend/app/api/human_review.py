from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import HumanReview, RecoveryCase
from app.security.auth import get_current_merchant
from app.services.audit_service import audit
router=APIRouter(prefix="/api/human-review",tags=["Human Review"])
class Decision(BaseModel):
    decision: Literal["approve", "reject", "stop"]
    note: str | None = Field(default=None, max_length=1000)


def apply_decision(review: HumanReview, case: RecoveryCase, payload: Decision) -> None:
    if review.status != "pending":
        raise HTTPException(409, "Review has already been decided")
    if case.status != "waiting_human_review":
        raise HTTPException(409, f"Case is not awaiting review (current status: {case.status})")

    review.status = payload.decision
    review.reviewer_note = payload.note
    review.decided_at = datetime.utcnow()
    case.status = "approved" if payload.decision == "approve" else "stopped"
@router.get("")
def queue(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(HumanReview).join(RecoveryCase,RecoveryCase.id==HumanReview.recovery_case_id).filter(RecoveryCase.merchant_id==merchant["merchant_id"],HumanReview.status=="pending").all()
@router.post("/{review_id}")
def decide(review_id:int,payload:Decision,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    r=db.query(HumanReview).join(RecoveryCase).filter(HumanReview.id==review_id,RecoveryCase.merchant_id==merchant["merchant_id"]).first()
    if not r: raise HTTPException(404,"Review not found")
    c=db.get(RecoveryCase,r.recovery_case_id)
    if not c: raise HTTPException(404,"Recovery case not found")
    apply_decision(r,c,payload)
    db.commit(); audit(db,"human_review_decision",f"Human review: {payload.decision}",c.id,{"note":payload.note},merchant["merchant_id"]); return {"ok":True}
