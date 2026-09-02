import sys, os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from datetime import datetime, timedelta
from app.database.session import Base, engine, SessionLocal
from app.models import *
Base.metadata.create_all(bind=engine)
db=SessionLocal()
for model in [AuditLog,HumanReview,RecoveryAction,RecoveryCase,PaymentDegradationEvent,CustomerRecoveryMemory,Checkout,Subscription,Payment,MerchantSettings]: db.query(model).delete()
db.commit()
mid="merchant_demo"
db.add(MerchantSettings(merchant_id=mid,daily_recovery_budget_paise=500000,monthly_recovery_budget_paise=10000000,max_automated_amount_paise=2500000,max_retries=3,incentives_enabled=True))
reasons=["network_error","authentication_failed","bank_decline","insufficient_funds","expired_card"]
methods=["upi","card","netbanking","wallet"]
for i in range(1,31):
    failed=i<=18
    db.add(Payment(merchant_id=mid,payment_id=f"pay_demo_{i:03d}",customer_id=f"cust_demo_{(i%6)+1:02d}",amount_paise=(799+i*237)*100,payment_method=methods[i%4],status="failed" if failed else "captured",failure_reason=reasons[i%5] if failed else None,attempt_number=1 if i%5 else 2,customer_email=f"demo{i}@example.com",created_at=datetime.utcnow()-timedelta(minutes=i*11)))
for i in range(1,7):
    db.add(CustomerRecoveryMemory(merchant_id=mid,customer_id=f"cust_demo_{i:02d}",total_transactions=20+i*4,successful_transactions=18+i*3,failed_transactions=2+i,total_recovery_attempts=4,successful_recoveries=3,recovery_success_rate=.75,average_transaction_value_paise=450000,preferred_payment_method="upi" if i%2 else "card",best_recovery_hour=20,best_recovery_action="payment:send_payment_link",action_performance={"payment:send_payment_link":{"attempts":4,"successes":3,"success_rate":.75}},recovery_history=[],recovery_score=82+i))
for i in range(1,6): db.add(Checkout(merchant_id=mid,checkout_id=f"checkout_{i}",customer_id=f"cust_demo_{i:02d}",amount_paise=(2500+i*500)*100,status="abandoned",payment_method="upi",checkout_duration_seconds=140+i*20,created_at=datetime.utcnow()-timedelta(minutes=30+i*5)))
for i in range(1,5): db.add(Subscription(merchant_id=mid,subscription_id=f"sub_{i}",customer_id=f"cust_demo_{i:02d}",amount_paise=(999+i*500)*100,status="failed",billing_cycle="monthly",payment_method="card",failed_attempts=1))
db.add(PaymentDegradationEvent(merchant_id=mid,payment_method="upi",baseline_failure_rate=.03,current_failure_rate=.09,failure_rate_increase=.06,revenue_at_risk_paise=3800000,severity="high",details={"synthetic_demo":True}))
db.commit(); print("Seeded RecoverAI demo data")
