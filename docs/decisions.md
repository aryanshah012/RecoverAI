# Technical Decisions

- FastAPI for typed, testable backend APIs.
- PostgreSQL for transactional persistence and auditability.
- Redis/Celery for scheduled and retryable jobs.
- Next.js for an enterprise merchant dashboard.
- Deterministic policies around money-adjacent actions.
- Razorpay Payment Links as a bounded recovery action in Test Mode.
- Synthetic simulation for reproducible evaluation without claiming access to production merchant data.
