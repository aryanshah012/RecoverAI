from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import SimulationRun, SimulationResult
from app.services.simulation_service import execute_simulation
from app.security.auth import get_current_merchant
router=APIRouter(prefix="/api/simulation",tags=["Simulation"])
class Req(BaseModel): transaction_count:int=Field(default=10000,ge=1000,le=100000); seed:int=42
@router.post("/run")
def run(req:Req,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)): return execute_simulation(db,req.transaction_count,req.seed)
@router.get("/{simulation_id}")
def get(simulation_id:int,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    r=db.query(SimulationRun).get(simulation_id)
    if not r: raise HTTPException(404,"Simulation not found")
    return {"run":r,"results":db.query(SimulationResult).filter_by(simulation_run_id=simulation_id).all()}
