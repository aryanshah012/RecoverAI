from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.models import Payment, RecoveryCase
from app.services.analytics_service import leakage_summary, leakage_timeline, strategy_performance

def test_analytics_respect_date_window_and_use_real_timeline():
    engine=create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine); db=sessionmaker(bind=engine)()
    now=datetime.utcnow(); old=now-timedelta(days=60)
    db.add_all([
        Payment(merchant_id="m1",payment_id="p1",customer_id="c1",amount_paise=100_000,status="failed",payment_method="upi",created_at=now),
        Payment(merchant_id="m1",payment_id="p2",customer_id="c2",amount_paise=900_000,status="failed",payment_method="card",created_at=old),
        Payment(merchant_id="m2",payment_id="p3",customer_id="c3",amount_paise=800_000,status="failed",payment_method="card",created_at=now),
        RecoveryCase(merchant_id="m1",customer_id="c1",amount_paise=100_000,status="recovered",selected_action="send_payment_link",recovered_amount_paise=80_000,intervention_cost_paise=500,created_at=now,updated_at=now),
    ]); db.commit()
    start=now-timedelta(days=30); end=now+timedelta(days=1)
    summary=leakage_summary(db,"m1",start,end)
    assert summary["failed_revenue_paise"]==100_000
    assert summary["recovered_revenue_paise"]==80_000
    timeline=leakage_timeline(db,"m1",start,end)
    assert len(timeline)==1
    assert timeline[0]["failed_paise"]==100_000
    assert timeline[0]["recovered_paise"]==80_000
    strategy=strategy_performance(db,"m1",start,end)[0]
    assert strategy["net_recovered_revenue_paise"]==79_500
    db.close()
