# Copilot retrieval evaluation

The merchant Copilot uses deterministic, tenant-scoped SQL retrieval and templates. It does not use an LLM or vector store, so it must never synthesize facts beyond returned query evidence.

## Required checks

- Every successful factual answer includes structured evidence and a retrieval item count.
- Empty retrieval produces an explicit no-data answer rather than a guess.
- Unsupported questions are marked ungrounded and direct users to verified prompts.
- Case lookup is scoped by both case ID and merchant ID.
- Logs and metrics contain intent, status, item count, groundedness, latency, and trace ID—never question text, merchant ID, customer data, or retrieved values.

Run the regression suite with `pytest -q tests/test_copilot.py`. The fixtures cover supported retrieval, empty datasets, unsupported questions, groundedness metadata, and cross-tenant isolation.
