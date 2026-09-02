from app.models import AuditLog

def audit(db, event_type, message, recovery_case_id=None, details=None, merchant_id="merchant_demo"):
    row=AuditLog(merchant_id=merchant_id,recovery_case_id=recovery_case_id,event_type=event_type,message=message,details=details or {})
    db.add(row); db.commit(); db.refresh(row); return row
