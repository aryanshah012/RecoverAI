from celery import Celery
from app.config import settings
celery_app=Celery("recoverai",broker=settings.redis_url,backend=settings.redis_url)
celery_app.conf.beat_schedule={"payment-health-scan":{"task":"scan_payment_degradation","schedule":15*60}}
