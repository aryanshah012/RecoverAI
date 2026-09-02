from app.models import IncentivePolicy

def eligible_incentives(db, merchant_id, source_type, amount_paise):
    rows=db.query(IncentivePolicy).filter(IncentivePolicy.merchant_id==merchant_id,IncentivePolicy.active==True).all()
    return [p for p in rows if (not p.source_type or p.source_type==source_type) and amount_paise>=p.minimum_order_value_paise]

def calculate_incentive_paise(policy, amount_paise):
    if policy.incentive_type=="percentage": value=int(amount_paise*policy.value/100)
    elif policy.incentive_type=="fixed": value=int(policy.value*100)
    else: return 0
    if policy.maximum_discount_paise is not None: value=min(value,policy.maximum_discount_paise)
    return value
