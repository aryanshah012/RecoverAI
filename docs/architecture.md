# Architecture

RecoverAI is split into presentation, API/application, decision intelligence, policy, execution, persistence, background processing, and observability layers.

```text
Next.js UI
   ↓
FastAPI REST API
   ↓
ML predictor + customer memory + LangGraph-style recovery flow
   ↓
Expected-value optimizer
   ↓
Deterministic policy engine
   ↓
Razorpay Test/Mock executor
   ↓
PostgreSQL + audit log
   ↓
Redis/Celery jobs
```

The LLM/Copilot layer can explain only data returned by approved analytics tools. It is not permitted to issue refunds, transfers, arbitrary SQL, or shell commands.
