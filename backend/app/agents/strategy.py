COSTS = {"retry_payment":100,"retry_later":100,"send_reminder":200,"suggest_alternate_method":300,"send_payment_link":500,"human_review":10000}

def candidate_actions(diagnosis: str):
    mapping = {
        "temporary_network_failure": [("retry_payment",.80),("send_payment_link",.74)],
        "temporary_bank_decline": [("retry_later",.68),("suggest_alternate_method",.72),("send_payment_link",.75)],
        "authentication_issue": [("send_payment_link",.78),("suggest_alternate_method",.67)],
        "temporary_funds_shortage": [("retry_later",.55),("send_reminder",.50)],
        "invalid_payment_instrument": [("suggest_alternate_method",.82),("send_payment_link",.77)],
    }
    rows = mapping.get(diagnosis, [("human_review",.50)])
    return [{"action": a, "action_probability": p, "cost_paise": COSTS[a]} for a,p in rows]
