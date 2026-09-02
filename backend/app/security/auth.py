from fastapi import Header, HTTPException, status
from app.config import settings

def get_current_merchant(x_api_key: str | None = Header(default=None)):
    if not x_api_key or x_api_key != settings.demo_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    return {"merchant_id": "merchant_demo"}
