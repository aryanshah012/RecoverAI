from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.api.human_review import Decision, apply_decision


def test_apply_decision_approves_a_pending_review():
    review = SimpleNamespace(status="pending", reviewer_note=None, decided_at=None)
    case = SimpleNamespace(status="waiting_human_review")

    apply_decision(review, case, Decision(decision="approve", note="Checked manually"))

    assert review.status == "approve"
    assert review.reviewer_note == "Checked manually"
    assert review.decided_at is not None
    assert case.status == "approved"


def test_apply_decision_rejects_duplicate_decisions():
    review = SimpleNamespace(status="approve", reviewer_note=None, decided_at=None)
    case = SimpleNamespace(status="approved")

    with pytest.raises(HTTPException) as exc:
        apply_decision(review, case, Decision(decision="reject"))

    assert exc.value.status_code == 409


def test_decision_schema_rejects_unknown_actions_and_long_notes():
    with pytest.raises(ValidationError):
        Decision(decision="delete")
    with pytest.raises(ValidationError):
        Decision(decision="approve", note="x" * 1001)
