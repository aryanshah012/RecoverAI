def optimize_recovery_budget(opportunities:list[dict], budget_paise:int):
    ranked=sorted(opportunities,key=lambda x:x.get("expected_net_recovery_paise",0)/max(x.get("intervention_cost_paise",1),1),reverse=True)
    selected=[]; skipped=[]; used=0; expected=0
    for o in ranked:
        cost=int(o.get("intervention_cost_paise",0))
        if used+cost<=budget_paise:
            selected.append(o); used+=cost; expected+=int(o.get("expected_net_recovery_paise",0))
        else: skipped.append(o)
    return {"selected":selected,"skipped":skipped,"budget_used_paise":used,"expected_net_recovery_paise":expected}
