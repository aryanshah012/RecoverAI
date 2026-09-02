from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from app.database.session import Base

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), default="merchant_demo", index=True, nullable=False)
    payment_id = Column(String(120), unique=True, index=True, nullable=False)
    customer_id = Column(String(120), index=True, nullable=False)
    amount_paise = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(50), nullable=True, index=True)
    bank = Column(String(100), nullable=True)
    status = Column(String(40), nullable=False, index=True)
    failure_reason = Column(String(120), nullable=True)
    attempt_number = Column(Integer, default=1)
    customer_email = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class RecoveryCase(Base):
    __tablename__ = "recovery_cases"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), default="merchant_demo", index=True, nullable=False)
    payment_id = Column(String(120), index=True, nullable=True)
    source_type = Column(String(40), default="payment", index=True)
    source_id = Column(String(120), index=True, nullable=True)
    customer_id = Column(String(120), index=True, nullable=False)
    amount_paise = Column(Integer, nullable=False)
    status = Column(String(50), default="created", index=True)
    diagnosis = Column(String(120), nullable=True)
    recovery_probability = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    selected_action = Column(String(120), nullable=True)
    expected_recovery_paise = Column(Integer, default=0)
    intervention_cost_paise = Column(Integer, default=0)
    expected_net_recovery_paise = Column(Integer, default=0)
    recovered_amount_paise = Column(Integer, default=0)
    priority = Column(String(30), nullable=True)
    priority_score = Column(Float, default=0)
    policy_status = Column(String(50), nullable=True)
    policy_reason = Column(String(255), nullable=True)
    recovery_reference = Column(String(160), unique=True, nullable=True)
    external_id = Column(String(160), nullable=True)
    external_url = Column(Text, nullable=True)
    provider = Column(String(50), nullable=True)
    execution_mode = Column(String(50), nullable=True)
    recommended_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RecoveryAction(Base):
    __tablename__ = "recovery_actions"
    id = Column(Integer, primary_key=True)
    recovery_case_id = Column(Integer, ForeignKey("recovery_cases.id", ondelete="CASCADE"), index=True)
    action_type = Column(String(120), nullable=False)
    status = Column(String(50), default="created")
    external_id = Column(String(160), nullable=True)
    external_url = Column(Text, nullable=True)
    provider = Column(String(50), nullable=True)
    execution_mode = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), default="merchant_demo", index=True)
    recovery_case_id = Column(Integer, ForeignKey("recovery_cases.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(120), nullable=False, index=True)
    message = Column(Text, nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class HumanReview(Base):
    __tablename__ = "human_reviews"
    id = Column(Integer, primary_key=True)
    recovery_case_id = Column(Integer, ForeignKey("recovery_cases.id", ondelete="CASCADE"), unique=True, index=True)
    status = Column(String(40), default="pending", index=True)
    reason = Column(String(255), nullable=True)
    reviewer_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)

class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    id = Column(Integer, primary_key=True)
    provider = Column(String(50), default="razorpay")
    event_id = Column(String(128), unique=True, index=True, nullable=False)
    event_type = Column(String(120), index=True)
    signature_valid = Column(Boolean, default=False)
    processed = Column(Boolean, default=False)
    processing_error = Column(Text, nullable=True)
    payload = Column(JSON, default=dict)
    received_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

class CustomerRecoveryMemory(Base):
    __tablename__ = "customer_recovery_memory"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), default="merchant_demo", index=True)
    customer_id = Column(String(120), index=True, nullable=False)
    total_transactions = Column(Integer, default=0)
    successful_transactions = Column(Integer, default=0)
    failed_transactions = Column(Integer, default=0)
    total_recovery_attempts = Column(Integer, default=0)
    successful_recoveries = Column(Integer, default=0)
    recovery_success_rate = Column(Float, default=0)
    average_transaction_value_paise = Column(Integer, default=0)
    preferred_payment_method = Column(String(50), nullable=True)
    best_recovery_hour = Column(Integer, nullable=True)
    best_recovery_action = Column(String(120), nullable=True)
    action_performance = Column(JSON, default=dict)
    recovery_history = Column(JSON, default=list)
    recovery_score = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__ = (UniqueConstraint("merchant_id", "customer_id", name="uq_memory_merchant_customer"),)

class PaymentDegradationEvent(Base):
    __tablename__ = "payment_degradation_events"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), default="merchant_demo", index=True)
    payment_method = Column(String(50), index=True, nullable=False)
    baseline_failure_rate = Column(Float, nullable=False)
    current_failure_rate = Column(Float, nullable=False)
    failure_rate_increase = Column(Float, nullable=False)
    revenue_at_risk_paise = Column(Integer, default=0)
    severity = Column(String(30), nullable=False)
    status = Column(String(30), default="active")
    details = Column(JSON, default=dict)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class Checkout(Base):
    __tablename__ = "checkouts"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), default="merchant_demo", index=True)
    checkout_id = Column(String(120), unique=True, index=True, nullable=False)
    customer_id = Column(String(120), index=True, nullable=False)
    amount_paise = Column(Integer, nullable=False)
    status = Column(String(50), default="started", index=True)
    payment_method = Column(String(50), nullable=True)
    device = Column(String(50), nullable=True)
    checkout_duration_seconds = Column(Integer, default=0)
    abandoned_reason = Column(String(255), nullable=True)
    recovered_amount_paise = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), default="merchant_demo", index=True)
    subscription_id = Column(String(120), unique=True, index=True, nullable=False)
    customer_id = Column(String(120), index=True, nullable=False)
    amount_paise = Column(Integer, nullable=False)
    status = Column(String(50), index=True, nullable=False)
    billing_cycle = Column(String(50), nullable=True)
    payment_method = Column(String(50), nullable=True)
    failed_attempts = Column(Integer, default=0)
    grace_period_days = Column(Integer, default=3)
    next_retry_at = Column(DateTime, nullable=True)
    recovered_amount_paise = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    transaction_count = Column(Integer, nullable=False)
    seed = Column(Integer, default=42)
    status = Column(String(50), default="running", index=True)
    config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class SimulationResult(Base):
    __tablename__ = "simulation_results"
    id = Column(Integer, primary_key=True)
    simulation_run_id = Column(Integer, ForeignKey("simulation_runs.id", ondelete="CASCADE"), index=True)
    strategy = Column(String(50), nullable=False)
    total_transactions = Column(Integer, default=0)
    failed_transactions = Column(Integer, default=0)
    revenue_at_risk_paise = Column(Integer, default=0)
    recovered_transactions = Column(Integer, default=0)
    recovered_revenue_paise = Column(Integer, default=0)
    recovery_rate = Column(Float, default=0)
    interventions = Column(Integer, default=0)
    non_converting_interventions = Column(Integer, default=0)
    intervention_cost_paise = Column(Integer, default=0)
    net_recovered_revenue_paise = Column(Integer, default=0)
    metrics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class MerchantSettings(Base):
    __tablename__ = "merchant_settings"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), unique=True, index=True)
    daily_recovery_budget_paise = Column(Integer, default=500000)
    monthly_recovery_budget_paise = Column(Integer, default=10000000)
    max_automated_amount_paise = Column(Integer, default=2500000)
    max_retries = Column(Integer, default=3)
    incentives_enabled = Column(Boolean, default=False)
    experiments_enabled = Column(Boolean, default=True)
    copilot_enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class IncentivePolicy(Base):
    __tablename__ = "incentive_policies"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), index=True)
    name = Column(String(100), nullable=False)
    incentive_type = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    minimum_order_value_paise = Column(Integer, default=0)
    maximum_discount_paise = Column(Integer, nullable=True)
    source_type = Column(String(50), nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Experiment(Base):
    __tablename__ = "experiments"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(String(100), index=True)
    name = Column(String(150), nullable=False)
    source_type = Column(String(50), nullable=False)
    status = Column(String(30), default="draft", index=True)
    variant_a = Column(JSON, nullable=False)
    variant_b = Column(JSON, nullable=False)
    traffic_split = Column(JSON, default=lambda: {"A": .5, "B": .5})
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class ExperimentResult(Base):
    __tablename__ = "experiment_results"
    id = Column(Integer, primary_key=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id", ondelete="CASCADE"), index=True)
    variant = Column(String(10), nullable=False)
    opportunities = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    recovered_revenue_paise = Column(Integer, default=0)
    intervention_cost_paise = Column(Integer, default=0)
    net_recovered_revenue_paise = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
