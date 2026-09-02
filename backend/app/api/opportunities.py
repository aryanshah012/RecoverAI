from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import RecoveryCase, Checkout, Subscription
from app.security.auth import get_current_merchant
from app.services.budget_optimizer import optimize_recovery_budget
from pydantic import BaseModel
router=APIRouter(prefix="/api/opportunities",tags=["Opportunities"])

def build(db,mid):
    out=[]
    for c in db.query(RecoveryCase).filter(RecoveryCase.merchant_id==mid,RecoveryCase.status.notin_(["recovered","stopped"])).all():
        out.append({"source_type":c.source_type,"source_id":c.source_id or c.payment_id,"customer_id":c.customer_id,"amount_paise":c.amount_paise,"recovery_probability":c.recovery_probability or 0,"expected_net_recovery_paise":c.expected_net_recovery_paise,"intervention_cost_paise":c.intervention_cost_paise,"recommended_action":c.selected_action,"priority_score":c.priority_score})
    for c in db.query(Checkout).filter_by(merchant_id=mid,status="abandoned").all():
        p=max(.05,min(.40+.10*(c.checkout_duration_seconds<180),.95)); cost=500; net=int(c.amount_paise*p)-cost
        out.append({"source_type":"checkout","source_id":c.checkout_id,"customer_id":c.customer_id,"amount_paise":c.amount_paise,"recovery_probability":p,"expected_net_recovery_paise":net,"intervention_cost_paise":cost,"recommended_action":"send_payment_link","priority_score":round(min(net/2_500_000,1)*100,2)})
    for s in db.query(Subscription).filter(Subscription.merchant_id==mid,Subscription.status.in_(["failed","past_due"])).all():
        p=max(.05,min(.65-s.failed_attempts*.10,.95)); cost=100; net=int(s.amount_paise*p)-cost
        out.append({"source_type":"subscription","source_id":s.subscription_id,"customer_id":s.customer_id,"amount_paise":s.amount_paise,"recovery_probability":p,"expected_net_recovery_paise":net,"intervention_cost_paise":cost,"recommended_action":"retry_subscription","priority_score":round(min(net/2_500_000,1)*100,2)})
    return sorted(out,key=lambda x:x["expected_net_recovery_paise"],reverse=True)
@router.get("")
def opportunities(db:Session=Depends(get_db),merchant=Depends(get_current_merchant)): return build(db,merchant["merchant_id"])
class BudgetReq(BaseModel): budget_paise:int
@router.post("/optimize-budget")
def budget(req:BudgetReq,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)): return optimize_recovery_budget(build(db,merchant["merchant_id"]),req.budget_paise)
