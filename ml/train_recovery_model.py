import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    brier_score_loss,
)

def feature_engineering(df, encoders=None, scaler=None, is_training=False):
    """Transform raw transaction failure data into ML feature matrix."""
    if encoders is None:
        encoders = {}

    feat = pd.DataFrame(index=df.index)
    feat["amount"] = df["amount"].astype(float)
    feat["amount_log"] = np.log1p(feat["amount"])
    feat["attempt_number"] = df["attempt_number"].fillna(1).astype(int)
    feat["is_high_value"] = (feat["amount"] > 25000).astype(int)

    # Encode categoricals
    cat_cols = ["payment_method", "failure_reason"]
    for col in cat_cols:
        if col not in encoders:
            encoders[col] = LabelEncoder()
            if is_training:
                encoders[col].fit(df[col].astype(str).fillna("unknown"))

        feat[col] = encoders[col].transform(df[col].astype(str).fillna("unknown"))

    # Synthesize customer behavioral priors
    # e.g. Customer prior reliability inferred from transactions
    cust_stats = df.groupby("customer_id")["status"].apply(lambda s: (s == "success").mean()).to_dict()
    feat["customer_prior_success_rate"] = df["customer_id"].map(cust_stats).fillna(0.75)

    cust_counts = df.groupby("customer_id")["amount"].count().to_dict()
    feat["customer_frequency"] = df["customer_id"].map(cust_counts).fillna(1)

    # Scale numeric features
    numeric_cols = ["amount", "amount_log", "attempt_number", "customer_prior_success_rate", "customer_frequency"]
    if scaler is None:
        scaler = StandardScaler()
        if is_training:
            feat[numeric_cols] = scaler.fit_transform(feat[numeric_cols])
    else:
        feat[numeric_cols] = scaler.transform(feat[numeric_cols])

    return feat, encoders, scaler

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "..", "data", "synthetic", "transactions.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading synthetic transactions from {csv_path}...")
    df = pd.read_csv(csv_path)

    # Focus exclusively on failed transactions (The RecoverAI core intelligence target)
    failed_df = df[df["status"] == "failed"].copy()
    print(f"Total failed transactions to evaluate: {len(failed_df)}")

    # Target: Can this failed payment be recovered?
    y = failed_df["recovered"].astype(int)

    X, encoders, scaler = feature_engineering(failed_df, is_training=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print("Training GradientBoosting Recovery Probability Model...")
    recovery_model = GradientBoostingClassifier(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=4,
        random_state=42
    )
    recovery_model.fit(X_train, y_train)

    # Model Evaluation
    y_pred_proba = recovery_model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.50).astype(int)

    roc_auc = float(roc_auc_score(y_test, y_pred_proba))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    brier_score = float(brier_score_loss(y_test, y_pred_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Train Best Action Classifier on recovered instances
    recovered_subset = failed_df[failed_df["recovered"] == True].copy()
    action_encoder = LabelEncoder()
    y_action = action_encoder.fit_transform(recovered_subset["recovery_action"].fillna("send_payment_link"))
    X_action, _, _ = feature_engineering(recovered_subset, encoders=encoders, scaler=scaler, is_training=False)

    action_model = RandomForestClassifier(n_estimators=60, max_depth=5, random_state=42)
    action_model.fit(X_action, y_action)

    metrics = {
        "model_type": "GradientBoostingClassifier",
        "dataset_size": len(failed_df),
        "test_split_size": len(X_test),
        "roc_auc": round(roc_auc, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "brier_score_calibration": round(brier_score, 4),
        "confusion_matrix": cm,
        "feature_importances": {
            col: round(float(imp), 4)
            for col, imp in zip(X.columns, recovery_model.feature_importances_)
        },
        "supported_actions": list(action_encoder.classes_),
    }

    # Save artifacts
    joblib.dump(recovery_model, os.path.join(models_dir, "recovery_model.joblib"))
    joblib.dump(action_model, os.path.join(models_dir, "action_model.joblib"))
    joblib.dump(encoders, os.path.join(models_dir, "encoders.joblib"))
    joblib.dump(scaler, os.path.join(models_dir, "scaler.joblib"))
    joblib.dump(action_encoder, os.path.join(models_dir, "action_encoder.joblib"))

    metrics_path = os.path.join(models_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print("\nModel Training Complete! Evaluation Metrics:")
    print(json.dumps(metrics, indent=2))
    return metrics

if __name__ == "__main__":
    train_and_evaluate()
