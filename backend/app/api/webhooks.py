import hashlib, json
from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import WebhookEvent, RecoveryCase
from app.services.webhook_service import verify_razorpay_signature
from app.services.audit_service import audit
router=APIRouter(prefix="/api/webhooks",tags=["Webhooks"])
@router.post("/razorpay")
async def razorpay(request:Request,db:Session=Depends(get_db),x_razorpay_signature:str|None=Header(default=None)):
    raw=await request.body()
    if not x_razorpay_signature: raise HTTPException(400,"Missing Razorpay signature")
    if not verify_razorpay_signature(raw,x_razorpay_signature): raise HTTPException(401,"Invalid Razorpay signature")
    event_id=hashlib.sha256(raw).hexdigest()
    if db.query(WebhookEvent).filter_by(event_id=event_id).first(): return {"status":"already_processed"}
    try: payload=json.loads(raw.decode())
    except Exception: raise HTTPException(400,"Invalid JSON")
    event_type=payload.get("event","unknown"); row=WebhookEvent(event_id=event_id,event_type=event_type,signature_valid=True,payload=payload); db.add(row); db.commit(); db.refresh(row)
    try:
        if event_type=="payment_link.paid":
            entity=payload.get("payload",{}).get("payment_link",{}).get("entity",{}); ref=entity.get("reference_id")
            case=db.query(RecoveryCase).filter_by(recovery_reference=ref).first() if ref else None
            if case and case.status!="recovered":
                case.status="recovered"; case.recovered_amount_paise=case.amount_paise; audit(db,"recovery_completed","Payment Link paid and recovery confirmed",case.id,{"reference_id":ref},case.merchant_id)
        row.processed=True; row.processed_at=datetime.utcnow(); db.commit()
    except Exception as e:
        row.processing_error=str(e); db.commit(); raise
    return {"status":"processed","event":event_type}
