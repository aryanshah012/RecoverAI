import sys, os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from statistics import mean, pstdev
from app.database.session import SessionLocal
from app.services.simulation_service import execute_simulation
SIZES=[10000,50000,100000]; SEEDS=[42,101,202,303,404]
db=SessionLocal()
for size in SIZES:
    vals=[]
    for seed in SEEDS:
        r=execute_simulation(db,size,seed); vals.append(r["comparison"]["additional_net_revenue_paise"]/100)
    print(size, "mean additional net revenue ₹", round(mean(vals),2), "std", round(pstdev(vals),2))
db.close()
