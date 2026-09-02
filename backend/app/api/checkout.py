from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Checkout
from app.security.auth import get_current_merchant
router=APIRouter(prefix="/api/checkout",tags=["Checkout"])
class CheckoutEvent(BaseModel):
    checkout_id:str; customer_id:str; amount_paise:int=Field(gt=0); payment_method:str|None=None; device:str|None=None; checkout_duration_seconds:int=0; status:str="started"
@router.post("/events")
def event(payload:CheckoutEvent,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    c=db.query(Checkout).filter_by(checkout_id=payload.checkout_id).first()
    if not c:
        c=Checkout(merchant_id=merchant["merchant_id"],**payload.model_dump()); db.add(c)
    else:
        for k,v in payload.model_dump().items(): setattr(c,k,v)
    db.commit(); db.refresh(c); return c
@router.get("")
def list_checkout(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(Checkout).filter_by(merchant_id=merchant["merchant_id"]).order_by(Checkout.created_at.desc()).all()
