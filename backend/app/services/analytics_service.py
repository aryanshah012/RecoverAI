from datetime import datetime
from sqlalchemy import func
from app.models import Payment, RecoveryCase

def _between(query, column, start: datetime | None, end: datetime | None):
    if start: query = query.filter(column >= start)
    if end: query = query.filter(column < end)
    return query

def leakage_summary(db, merchant_id="merchant_demo", start=None, end=None):
    fq=db.query(func.coalesce(func.sum(Payment.amount_paise),0)).filter(Payment.merchant_id==merchant_id,Payment.status=="failed")
    rq=db.query(func.coalesce(func.sum(RecoveryCase.recovered_amount_paise),0)).filter(RecoveryCase.merchant_id==merchant_id)
    failed=_between(fq,Payment.created_at,start,end).scalar() or 0
    recovered=_between(rq,RecoveryCase.updated_at,start,end).scalar() or 0
    return {"failed_revenue_paise":int(failed),"recovered_revenue_paise":int(recovered),"unresolved_revenue_paise":max(int(failed)-int(recovered),0),"recovery_percentage":(float(recovered)/float(failed)*100) if failed else 0}

def leakage_by_method(db, merchant_id="merchant_demo", start=None, end=None):
    q=db.query(Payment.payment_method,func.count(Payment.id),func.sum(Payment.amount_paise)).filter(Payment.merchant_id==merchant_id,Payment.status=="failed")
    rows=_between(q,Payment.created_at,start,end).group_by(Payment.payment_method).all()
    return [{"payment_method":m or "unknown","failed_count":c,"revenue_at_risk_paise":int(v or 0)} for m,c,v in rows]

def strategy_performance(db, merchant_id="merchant_demo", start=None, end=None):
    q=db.query(RecoveryCase.selected_action,func.count(RecoveryCase.id),func.sum(RecoveryCase.recovered_amount_paise),func.sum(RecoveryCase.intervention_cost_paise)).filter(RecoveryCase.merchant_id==merchant_id,RecoveryCase.selected_action.isnot(None))
    rows=_between(q,RecoveryCase.created_at,start,end).group_by(RecoveryCase.selected_action).all()
    return [{"strategy":a,"cases":c,"attempts":c,"successes":0 if not v else c,"success_rate":1 if v else 0,"recovered_revenue_paise":int(v or 0),"intervention_cost_paise":int(cost or 0),"net_recovered_revenue_paise":max(int(v or 0)-int(cost or 0),0)} for a,c,v,cost in rows]

def failure_reason_breakdown(db, merchant_id="merchant_demo", start=None, end=None):
    q=db.query(Payment.failure_reason,func.count(Payment.id),func.sum(Payment.amount_paise)).filter(Payment.merchant_id==merchant_id,Payment.status=="failed")
    rows=_between(q,Payment.created_at,start,end).group_by(Payment.failure_reason).all()
    return [{"reason":(r or "unknown").replace("_"," ").title(),"code":r or "unknown","count":c,"revenue_at_risk_paise":int(v or 0)} for r,c,v in rows]

def leakage_timeline(db, merchant_id="merchant_demo", start=None, end=None):
    fq=db.query(func.date(Payment.created_at),func.sum(Payment.amount_paise)).filter(Payment.merchant_id==merchant_id,Payment.status=="failed")
    rq=db.query(func.date(RecoveryCase.updated_at),func.sum(RecoveryCase.recovered_amount_paise)).filter(RecoveryCase.merchant_id==merchant_id,RecoveryCase.recovered_amount_paise>0)
    failed={str(day):int(value or 0) for day,value in _between(fq,Payment.created_at,start,end).group_by(func.date(Payment.created_at)).all()}
    recovered={str(day):int(value or 0) for day,value in _between(rq,RecoveryCase.updated_at,start,end).group_by(func.date(RecoveryCase.updated_at)).all()}
    return [{"name":day,"failed_paise":failed.get(day,0),"recovered_paise":recovered.get(day,0)} for day in sorted(set(failed)|set(recovered))]
