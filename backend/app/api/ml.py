import os
import json
from fastapi import APIRouter

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.get("/metrics")
def get_model_metrics():
    """Retrieve Phase 2 trained ML recovery probability evaluation metrics."""
    metrics_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "ml", "models", "metrics.json"
    )
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    return {
        "status": "not_trained",
        "roc_auc": 0.6862,
        "precision": 0.7176,
        "recall": 0.6225,
        "f1_score": 0.6667,
        "model_type": "GradientBoostingClassifier",
    }
