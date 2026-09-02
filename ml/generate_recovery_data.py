from pathlib import Path
import numpy as np, pandas as pd
OUT=Path(__file__).parent/"data"/"recovery_training.csv"; OUT.parent.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(42); n=30000
methods=rng.choice(["upi","card","netbanking","wallet"],n); reasons=rng.choice(["network_error","bank_decline","authentication_failed","insufficient_funds","expired_card"],n)
amount=rng.lognormal(8,.75,n).clip(100,100000); attempt=rng.choice([1,2,3],n,p=[.72,.20,.08]); success_rate=rng.beta(8,2,n); previous=rng.beta(3,3,n); hour=rng.integers(0,24,n)
score=-.8+1.8*success_rate+1.2*previous-.35*(attempt-1)+np.where(reasons=="network_error",.6,0)+np.where(reasons=="expired_card",-.7,0)-.000004*amount
p=1/(1+np.exp(-score)); y=rng.binomial(1,p)
pd.DataFrame({"amount":amount,"payment_method":methods,"failure_reason":reasons,"attempt_number":attempt,"customer_success_rate":success_rate,"previous_recovery_success":previous,"hour":hour,"recovered":y}).to_csv(OUT,index=False)
print(f"Wrote synthetic data to {OUT}")
