from app.workers.celery_app import celery_app
from app.database.session import SessionLocal
from app.services.degradation_service import scan_payment_health
@celery_app.task(name="scan_payment_degradation")
def scan_payment_degradation(merchant_id="merchant_demo"):
    db=SessionLocal()
    try: return len(scan_payment_health(db,merchant_id))
    finally: db.close()
