import os
import random
import uuid
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

PAYMENT_METHODS = ["upi", "card", "netbanking", "wallet"]
METHOD_WEIGHTS = [0.45, 0.35, 0.15, 0.05]

FAILURE_REASONS = [
    "insufficient_funds",
    "bank_decline",
    "network_error",
    "authentication_failed",
    "expired_card",
]

RECOVERY_ACTIONS = [
    "send_payment_link",
    "delayed_retry",
    "switch_payment_method",
    "smart_dunning_sms",
    "human_agent_escalation",
]

def generate_transactions(n=10000, seed=42):
    random.seed(seed)
    np.random.seed(seed)
    rows = []
    start_date = datetime.now() - timedelta(days=90)

    # Pre-generate 2,500 customer profiles with intrinsic reliability
    customer_profiles = {}
    for i in range(1, 2501):
        cid = f"cust_{i}"
        # Some customers have higher reliability
        rel = np.random.beta(7, 2) # avg ~0.78
        customer_profiles[cid] = {
            "reliability": rel,
            "preferred_method": random.choices(PAYMENT_METHODS, weights=METHOD_WEIGHTS)[0],
            "avg_amount": round(float(np.random.lognormal(7.6, 0.7)), 2) # median ~₹2,000
        }

    for _ in range(n):
        customer_id = f"cust_{random.randint(1, 2500)}"
        c_prof = customer_profiles[customer_id]

        # Amount distribution (₹100 to ₹50,000)
        amount = round(float(np.clip(np.random.lognormal(7.8, 0.9), 100, 50000)), 2)

        # Method selection (weighted towards preference)
        if random.random() < 0.7:
            method = c_prof["preferred_method"]
        else:
            method = random.choices(PAYMENT_METHODS, weights=METHOD_WEIGHTS)[0]

        attempt_number = random.choices([1, 2, 3], weights=[0.75, 0.18, 0.07])[0]

        # Base success probability
        success_probability = c_prof["reliability"]

        if method == "upi":
            success_probability += 0.05
        elif method == "card":
            success_probability += 0.02

        if attempt_number > 1:
            success_probability -= (attempt_number - 1) * 0.12

        # High amounts have slight additional friction
        if amount > 25000:
            success_probability -= 0.08

        success_probability = max(0.1, min(0.96, success_probability))
        success = random.random() < success_probability

        created_at = start_date + timedelta(minutes=random.randint(0, 90 * 24 * 60))

        recovered = False
        recovered_amount = 0.0
        recovery_action = None
        recovery_time_hours = None
        failure_reason = None

        if success:
            status = "success"
        else:
            status = "failed"
            failure_reason = random.choice(FAILURE_REASONS)

            # Recovery likelihood modeling (Phase 2 intelligence target)
            # Network errors and auth failures are much more recoverable than insufficient funds
            recover_prob = 0.40
            if failure_reason in ["network_error", "authentication_failed"]:
                recover_prob += 0.35
            elif failure_reason == "insufficient_funds":
                recover_prob -= 0.15

            if method == "upi":
                recover_prob += 0.10

            recover_prob = max(0.05, min(0.92, recover_prob))

            if random.random() < recover_prob:
                recovered = True
                recovered_amount = amount
                recovery_action = random.choice(RECOVERY_ACTIONS)
                recovery_time_hours = round(random.uniform(0.5, 48.0), 1)

        rows.append({
            "payment_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "amount": amount,
            "currency": "INR",
            "payment_method": method,
            "status": status,
            "failure_reason": failure_reason,
            "attempt_number": attempt_number,
            "recovered": recovered,
            "recovered_amount": recovered_amount,
            "recovery_action": recovery_action,
            "recovery_time_hours": recovery_time_hours,
            "created_at": created_at.isoformat(),
        })

    return pd.DataFrame(rows)

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "..", "data", "synthetic")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "transactions.csv")

    print("Generating 10,000 synthetic transactions...")
    df = generate_transactions(10000)
    df.to_csv(output_path, index=False)

    print(f"Generated {len(df)} transactions -> {output_path}")
    print(f"Successful: {(df.status == 'success').sum()}")
    print(f"Failed: {(df.status == 'failed').sum()}")
    print(f"Recovered from Failures: {(df.recovered == True).sum()}")
    print(f"Total Revenue Volume: ₹{df.amount.sum():,.2f}")
