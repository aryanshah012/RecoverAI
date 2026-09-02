from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Subscription
from app.security.auth import get_current_merchant
router=APIRouter(prefix="/api/subscriptions",tags=["Subscriptions"])
class SubscriptionEvent(BaseModel):
    subscription_id:str; customer_id:str; amount_paise:int=Field(gt=0); status:str; payment_method:str|None=None; failed_attempts:int=0; billing_cycle:str|None="monthly"
@router.post("/events")
def event(payload:SubscriptionEvent,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    s=db.query(Subscription).filter_by(subscription_id=payload.subscription_id).first()
    if not s: s=Subscription(merchant_id=merchant["merchant_id"],**payload.model_dump()); db.add(s)
    else:
        for k,v in payload.model_dump().items(): setattr(s,k,v)
    db.commit(); db.refresh(s); return s
@router.get("")
def list_subscriptions(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(Subscription).filter_by(merchant_id=merchant["merchant_id"]).order_by(Subscription.created_at.desc()).all()
