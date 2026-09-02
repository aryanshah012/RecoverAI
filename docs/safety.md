# Safety

RecoverAI uses deterministic guardrails around automated actions.

- Maximum retries enforced.
- High-value cases require human review.
- Already-recovered, opted-out, duplicate, and expired cases stop.
- Merchant-approved incentives only.
- Budget checks before action.
- Webhook signatures validated in Razorpay Test Mode.
- Webhook payloads persisted idempotently.
- LLM tools are read-only analytics tools.
- No refunds, payouts, or transfers are implemented.
