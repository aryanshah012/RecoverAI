from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.session import Base
from app.models import Payment, RecoveryCase
from app.services.copilot_service import answer


def make_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


def test_answer_is_grounded_and_tenant_scoped():
    db = make_db()
    db.add_all([
        Payment(merchant_id="m1", payment_id="p1", customer_id="c1", amount_paise=125_000, status="failed", payment_method="upi", created_at=datetime.utcnow()),
        Payment(merchant_id="m2", payment_id="p2", customer_id="c2", amount_paise=900_000, status="failed", payment_method="card", created_at=datetime.utcnow()),
    ])
    db.commit()

    result = answer(db, "Which payment method leaks the most revenue?", "m1", "test-trace")

    assert result["retrieval"] == {"status": "ok", "item_count": 1}
    assert result["grounding"]["grounded"] is True
    assert result["grounding"]["evidence"][0]["value"] == 125_000
    assert "UPI" in result["answer"]
    assert "CARD" not in result["answer"]


def test_empty_retrieval_returns_explicit_no_data_response():
    result = answer(make_db(), "Which strategy performs best?", "m1")

    assert result["retrieval"] == {"status": "empty", "item_count": 0}
    assert result["data"] == []
    assert "No strategy performance data" in result["answer"]


def test_cross_tenant_case_does_not_leak_data():
    db = make_db()
    case = RecoveryCase(merchant_id="m2", customer_id="secret-customer", amount_paise=100_000, status="stopped", policy_reason="private")
    db.add(case)
    db.commit()

    result = answer(db, f"Why did case {case.id} stop?", "m1")

    assert result["retrieval"]["status"] == "empty"
    assert result["data"] is None
    assert "private" not in result["answer"]


def test_unsupported_query_never_claims_grounding():
    result = answer(make_db(), "Predict next year's revenue", "m1")

    assert result["intent"] == "unsupported"
    assert result["retrieval"]["status"] == "unsupported"
    assert result["grounding"]["grounded"] is False
    assert result["grounding"]["evidence"] == []
