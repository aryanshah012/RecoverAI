from dataclasses import dataclass

@dataclass
class PolicyDecision:
    status: str
    reason: str

def evaluate_policy(*, amount_paise:int, attempt_number:int, recovery_probability:float, max_retries:int=3, max_automated_amount_paise:int=2_500_000, already_recovered:bool=False, opted_out:bool=False, duplicate_active:bool=False, budget_remaining_paise:int|None=None, intervention_cost_paise:int=0):
    if already_recovered: return PolicyDecision("REJECTED", "Payment is already recovered.")
    if opted_out: return PolicyDecision("REJECTED", "Customer opted out of recovery contact.")
    if duplicate_active: return PolicyDecision("REJECTED", "Duplicate active recovery exists.")
    if attempt_number >= max_retries: return PolicyDecision("REJECTED", "Retry limit reached.")
    if recovery_probability < .35: return PolicyDecision("REJECTED", "Recovery confidence below minimum threshold.")
    if budget_remaining_paise is not None and intervention_cost_paise > budget_remaining_paise:
        return PolicyDecision("REJECTED", "Recovery budget is exhausted.")
    if amount_paise > max_automated_amount_paise:
        return PolicyDecision("HUMAN_REVIEW_REQUIRED", "High-value case requires human approval.")
    return PolicyDecision("APPROVED", "Case is within automated recovery policy.")
