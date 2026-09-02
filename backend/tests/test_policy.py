from app.policies.recovery_policy import evaluate_policy
def test_high_value_review(): assert evaluate_policy(amount_paise=7_500_000,attempt_number=1,recovery_probability=.8).status=="HUMAN_REVIEW_REQUIRED"
def test_retry_limit(): assert evaluate_policy(amount_paise=100000,attempt_number=3,recovery_probability=.8).status=="REJECTED"
def test_good_case(): assert evaluate_policy(amount_paise=899900,attempt_number=1,recovery_probability=.86).status=="APPROVED"
