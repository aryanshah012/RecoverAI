import hashlib, hmac
from app.config import settings

def verify_razorpay_signature(raw_body:bytes, signature:str)->bool:
    if not settings.razorpay_enabled: return True
    if not settings.razorpay_webhook_secret: return False
    expected=hmac.new(settings.razorpay_webhook_secret.encode(),raw_body,hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
