from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Payment
from app.security.auth import get_current_merchant
router=APIRouter(prefix="/api/payments",tags=["Payments"])
@router.get("")
def list_payments(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(Payment).filter_by(merchant_id=merchant["merchant_id"]).order_by(Payment.created_at.desc()).limit(200).all()
@router.get("/{payment_id}")
def get_payment(payment_id:str,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    p=db.query(Payment).filter_by(payment_id=payment_id,merchant_id=merchant["merchant_id"]).first()
    if not p: raise HTTPException(404,"Payment not found")
    return p
