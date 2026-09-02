from datetime import datetime
import random, numpy as np, pandas as pd
from app.models import SimulationRun, SimulationResult

METHODS=["upi","card","netbanking","wallet"]
REASONS=["network_error","bank_decline","authentication_failed","insufficient_funds","expired_card"]

def generate_simulation_data(n:int, seed:int=42):
    random.seed(seed); np.random.seed(seed); rows=[]
    for i in range(n):
        amount_paise=int(min(np.random.lognormal(8.0,.75),100000)*100)
        method=random.choice(METHODS); csr=float(np.random.beta(8,2)); attempt=random.choices([1,2,3],[.72,.20,.08])[0]
        failp=max(.01,min(.04+(1-csr)*.25+(.015 if method=="card" else -.005 if method=="wallet" else 0),.45))
        failed=np.random.random()<failp; reason=random.choice(REASONS) if failed else None
        rows.append({"transaction_id":f"sim_{i}","customer_id":f"cust_{random.randint(1,max(100,n//8))}","amount_paise":amount_paise,"payment_method":method,"failed":bool(failed),"failure_reason":reason,"attempt_number":attempt,"customer_success_rate":csr,"previous_recovery_success":float(np.random.beta(3,3))})
    return pd.DataFrame(rows)

def hidden_recovery_probability(r):
    p=.40+r.customer_success_rate*.22+r.previous_recovery_success*.18
    p+={"network_error":.18,"authentication_failed":.10,"bank_decline":.04,"insufficient_funds":-.08,"expired_card":-.12}.get(r.failure_reason,0)
    if r.attempt_number>=3:p-=.15
    if r.amount_paise>3_000_000:p-=.05
    return max(.03,min(p,.95))

def run_baseline(df, seed):
    np.random.seed(seed+100); failed=df[df.failed].copy(); rec=0; rev=0; cost=0; nonconv=0
    for r in failed.itertuples():
        p=.32*(.35 if r.failure_reason=="expired_card" else 1); cost+=100
        if np.random.random()<p: rec+=1; rev+=r.amount_paise
        else: nonconv+=1
    return {"strategy":"baseline","total_transactions":len(df),"failed_transactions":len(failed),"revenue_at_risk_paise":int(failed.amount_paise.sum()),"recovered_transactions":rec,"recovered_revenue_paise":int(rev),"recovery_rate":rec/len(failed) if len(failed) else 0,"interventions":len(failed),"non_converting_interventions":nonconv,"intervention_cost_paise":cost,"net_recovered_revenue_paise":int(rev-cost)}

def run_recoverai(df, seed):
    np.random.seed(seed+200); failed=df[df.failed].copy(); rec=rev=cost=nonconv=interventions=0
    for r in failed.itertuples():
        truep=hidden_recovery_probability(r)
        actionp={"network_error":.82,"authentication_failed":.84,"expired_card":.80,"insufficient_funds":.56}.get(r.failure_reason,.72)
        modelp=max(.03,min(.55*(.40+r.customer_success_rate*.20+r.previous_recovery_success*.15)+.25*r.customer_success_rate+.20*r.previous_recovery_success,.97))
        action={"network_error":"retry_payment","authentication_failed":"send_payment_link","expired_card":"suggest_alternate_method","insufficient_funds":"retry_later"}.get(r.failure_reason,"send_payment_link")
        c={"retry_payment":100,"retry_later":100,"send_payment_link":500,"suggest_alternate_method":300}[action]
        if modelp<.35 or r.amount_paise*modelp-c<=0 or r.amount_paise>2_500_000: continue
        interventions+=1; cost+=c; effective=max(.02,min(truep*.70+actionp*.30,.96))
        if np.random.random()<effective: rec+=1; rev+=r.amount_paise
        else: nonconv+=1
    return {"strategy":"recoverai","total_transactions":len(df),"failed_transactions":len(failed),"revenue_at_risk_paise":int(failed.amount_paise.sum()),"recovered_transactions":rec,"recovered_revenue_paise":int(rev),"recovery_rate":rec/len(failed) if len(failed) else 0,"interventions":interventions,"non_converting_interventions":nonconv,"intervention_cost_paise":cost,"net_recovered_revenue_paise":int(rev-cost)}

def execute_simulation(db, transaction_count:int, seed:int=42):
    run=SimulationRun(name=f"RecoverAI Simulation {transaction_count:,}",transaction_count=transaction_count,seed=seed,status="running",config={"synthetic":True,"baseline":"generic_retry"}); db.add(run); db.commit(); db.refresh(run)
    df=generate_simulation_data(transaction_count,seed); base=run_baseline(df,seed); rai=run_recoverai(df,seed)
    comp={"additional_recovered_revenue_paise":rai["recovered_revenue_paise"]-base["recovered_revenue_paise"],"additional_net_revenue_paise":rai["net_recovered_revenue_paise"]-base["net_recovered_revenue_paise"],"recovery_rate_lift":rai["recovery_rate"]-base["recovery_rate"]}
    for result in (base,rai):
        db.add(SimulationResult(simulation_run_id=run.id, strategy=result["strategy"], total_transactions=result["total_transactions"], failed_transactions=result["failed_transactions"], revenue_at_risk_paise=result["revenue_at_risk_paise"], recovered_transactions=result["recovered_transactions"], recovered_revenue_paise=result["recovered_revenue_paise"], recovery_rate=result["recovery_rate"], interventions=result["interventions"], non_converting_interventions=result["non_converting_interventions"], intervention_cost_paise=result["intervention_cost_paise"], net_recovered_revenue_paise=result["net_recovered_revenue_paise"], metrics=result))
    run.status="completed"; run.completed_at=datetime.utcnow(); run.config={**run.config,"comparison":comp}; db.commit()
    return {"simulation_id":run.id,"transaction_count":transaction_count,"baseline":base,"recoverai":rai,"comparison":comp}
