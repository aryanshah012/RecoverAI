up:
	docker compose up -d postgres redis

backend:
	cd backend && uvicorn app.main:app --reload

frontend:
	cd frontend && npm run dev

test:
	cd backend && pytest -q

seed:
	cd backend && python scripts/seed_demo.py

ml:
	python ml/generate_recovery_data.py && python ml/train_recovery_model.py && python ml/evaluate_recovery_model.py

benchmark:
	cd backend && python scripts/run_benchmark.py
