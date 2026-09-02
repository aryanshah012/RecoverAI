import uuid
import razorpay
from app.config import settings

class RazorpayService:
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret)) if settings.razorpay_enabled and settings.razorpay_key_id and settings.razorpay_key_secret else None
    def create_payment_link(self, amount_paise:int, customer_name:str|None=None, customer_email:str|None=None, customer_phone:str|None=None, description:str="RecoverAI payment recovery", reference_id:str|None=None):
        reference_id=reference_id or f"recovery_{uuid.uuid4().hex}"
        if not self.client:
            return {"id":f"mock_plink_{uuid.uuid4().hex[:8]}","short_url":f"http://localhost:3000/mock-pay/{reference_id}","status":"created","mode":"mock","reference_id":reference_id}
        payload={"amount":amount_paise,"currency":"INR","accept_partial":False,"description":description,"reference_id":reference_id,"notify":{"sms":False,"email":False},"reminder_enable":False}
        customer={}
        if customer_name: customer["name"]=customer_name
        if customer_email: customer["email"]=customer_email
        if customer_phone: customer["contact"]=customer_phone
        if customer: payload["customer"]=customer
        out=self.client.payment_link.create(payload)
        return {"id":out.get("id"),"short_url":out.get("short_url"),"status":out.get("status"),"mode":"razorpay_test","reference_id":reference_id}

razorpay_service=RazorpayService()
