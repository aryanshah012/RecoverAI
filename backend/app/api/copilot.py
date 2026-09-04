from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.security.auth import get_current_merchant
from app.security.rate_limit import limiter
from app.services.copilot_service import answer, copilot_metrics
router=APIRouter(prefix="/api/copilot",tags=["Copilot"])
class Query(BaseModel):
    question: str = Field(min_length=3, max_length=500)
@router.post("/query")
@limiter.limit("30/minute")
def query(request:Request,payload:Query,db:Session=Depends(get_db),merchant=Depends(get_current_merchant)):
    return answer(db,payload.question.strip(),merchant["merchant_id"],request.state.correlation_id)

@router.get("/metrics")
def metrics(merchant=Depends(get_current_merchant)):
    return copilot_metrics.snapshot()
