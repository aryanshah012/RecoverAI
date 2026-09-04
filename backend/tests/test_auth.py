import pytest
from fastapi import HTTPException
from app.security.auth import get_current_merchant

def test_demo_auth_rejects_missing_and_invalid_keys():
    with pytest.raises(HTTPException): get_current_merchant(None)
    with pytest.raises(HTTPException): get_current_merchant("wrong-key")

def test_demo_auth_returns_tenant_context():
    merchant=get_current_merchant("recoverai-demo-key")
    assert merchant["merchant_id"]=="merchant_demo"
