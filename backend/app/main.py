from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.logging_config import configure_logging
from app.middleware.correlation import CorrelationIdMiddleware
from app.middleware.metrics import MetricsMiddleware
from app.security.rate_limit import limiter
from app.api import health,dashboard,payments,recovery,human_review,analytics,customers,checkout,subscriptions,opportunities,simulation,copilot,audit,webhooks,ml
configure_logging()
app=FastAPI(title="RecoverAI API",version="1.0.0",description="AI Revenue Recovery OS - synthetic demo + Razorpay Test/Mock mode")
app.state.limiter=limiter
app.add_exception_handler(RateLimitExceeded,_rate_limit_exceeded_handler)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(MetricsMiddleware)
app.add_middleware(CORSMiddleware,allow_origins=[settings.frontend_url],allow_credentials=True,allow_methods=["GET","POST","PUT","DELETE"],allow_headers=["*"])
for r in [health.router,dashboard.router,payments.router,recovery.router,human_review.router,analytics.router,customers.router,checkout.router,subscriptions.router,opportunities.router,simulation.router,copilot.router,audit.router,webhooks.router,ml.router]: app.include_router(r)
@app.get("/")
def root(): return {"name":"RecoverAI","tagline":"Turn revenue that is slipping away into recovered revenue."}
