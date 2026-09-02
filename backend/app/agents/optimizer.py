def choose_best_action(amount_paise:int, base_probability:float, candidates:list[dict], historical_best_action:str|None=None, historical_success_rate:float=0.0, degraded:bool=False):
    best=None
    for item in candidates:
        p=.6*base_probability + .4*item["action_probability"]
        if historical_best_action == item["action"]:
            p=min(.98, .8*p + .2*historical_success_rate)
        if degraded and item["action"] in {"retry_payment","retry_later"}: p *= .65
        if degraded and item["action"] == "suggest_alternate_method": p=min(.98,p+.10)
        expected=int(amount_paise*p)
        net=expected-item["cost_paise"]
        row={**item,"combined_probability":round(p,4),"expected_recovery_paise":expected,"expected_net_recovery_paise":net}
        if best is None or row["expected_net_recovery_paise"] > best["expected_net_recovery_paise"]: best=row
    return best
