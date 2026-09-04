# RecoverAI

**AI Revenue Recovery OS for merchants.**

RecoverAI detects revenue at risk across failed payments, abandoned checkouts, and failed subscriptions; predicts recoverability; chooses bounded recovery actions; applies deterministic safety policies; and measures recovered revenue.

> **Demo note:** synthetic data and Razorpay Test/Mock mode only. Do not present simulation results as real Razorpay merchant performance.

## Core flow

Detect → Predict → Diagnose → Decide → Safely Act → Monitor → Recover → Learn

## Features

- Failed-payment recovery orchestration
- Checkout abandonment recovery
- Subscription recovery
- Recovery probability model with synthetic training data
- Customer recovery memory
- Best-time recommendation
- Payment degradation detection
- Revenue leakage analytics
- Unified opportunity ranking
- Deterministic policy engine and human review
- Razorpay Test Mode / mock Payment Link integration
- Signed/idempotent webhook ingestion
- Simulation: baseline vs RecoverAI
- Merchant Copilot over verified analytics
- Recovery budget optimizer and merchant-approved incentives
- Audit trail

## Quick start

```bash
cp .env.example backend/.env
docker compose up -d postgres redis
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.lock
alembic upgrade head
python scripts/seed_demo.py
uvicorn app.main:app --reload
```

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:8000  
Swagger: http://localhost:8000/docs

## Train ML model

```bash
python ml/generate_recovery_data.py
python ml/train_recovery_model.py
python ml/evaluate_recovery_model.py
```

## Test

```bash
cd backend
pytest -q
```

## Demo API key

Set `DEMO_API_KEY` in `backend/.env`, then send it as the `X-API-Key` header for protected endpoints.

## Important safety decisions

- LLM never controls payment movement.
- Refunds, payouts, transfers, arbitrary SQL, and arbitrary shell execution are not exposed as Copilot tools.
- High-value cases require human review.
- Retry limits and duplicate-recovery checks are deterministic.
- Incentives must come from merchant-approved policy records.
- Razorpay webhook signatures are verified when Test Mode is enabled.

See `docs/architecture.md`, `docs/safety.md`, and `docs/evaluation.md`.
