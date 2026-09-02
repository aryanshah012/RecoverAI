DIAGNOSIS = {
    "network_error": ("temporary_network_failure", .95),
    "bank_decline": ("temporary_bank_decline", .82),
    "authentication_failed": ("authentication_issue", .88),
    "insufficient_funds": ("temporary_funds_shortage", .80),
    "expired_card": ("invalid_payment_instrument", .98),
}

def diagnose(failure_reason: str | None):
    label, confidence = DIAGNOSIS.get(failure_reason or "", ("unknown_failure", .50))
    return {"diagnosis": label, "confidence": confidence}
