from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import CustomerRecoveryMemory
from app.security.auth import get_current_merchant
router=APIRouter(prefix="/api/customers",tags=["Customers"])
@router.get("")
def list_customers(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return db.query(CustomerRecoveryMemory).filter_by(merchant_id=merchant["merchant_id"]).order_by(CustomerRecoveryMemory.recovery_score.desc()).all()
@router.get("/{customer_id}")
def customer(customer_id:str,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    m=db.query(CustomerRecoveryMemory).filter_by(merchant_id=merchant["merchant_id"],customer_id=customer_id).first()
    if not m: raise HTTPException(404,"Customer recovery profile not found")
    return m
