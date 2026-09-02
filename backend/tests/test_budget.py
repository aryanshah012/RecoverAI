from app.services.budget_optimizer import optimize_recovery_budget
def test_budget_never_exceeded():
    o=[{"intervention_cost_paise":500,"expected_net_recovery_paise":500000},{"intervention_cost_paise":400,"expected_net_recovery_paise":300000},{"intervention_cost_paise":800,"expected_net_recovery_paise":700000}]
    r=optimize_recovery_budget(o,1000)
    assert r["budget_used_paise"]<=1000
