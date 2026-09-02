#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=============================================="
echo "⚡ Starting RecoverAI (Full-Stack Simultaneous)"
echo "=============================================="

cleanup() {
    echo ""
    echo "Stopping RecoverAI servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend FastAPI on Port 8000
echo "🚀 [Backend] Launching FastAPI on http://localhost:8000..."
cd "$DIR/backend"
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to be ready
until curl -s http://localhost:8000/health > /dev/null 2>&1; do
    sleep 0.5
done
echo "✅ [Backend] Live at http://localhost:8000"

# 2. Start Frontend Next.js on Port 3000
echo "🚀 [Frontend] Launching Next.js 15 on http://localhost:3000..."
cd "$DIR/frontend"
npm run dev -- -p 3000 -H 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "🎉 RecoverAI is running simultaneously!"
echo "👉 Frontend Web App:  http://localhost:3000"
echo "👉 Backend REST API:  http://localhost:8000"
echo "👉 API Documentation: http://localhost:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C anytime to stop both servers."
echo ""

wait
