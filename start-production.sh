#!/usr/bin/env bash
set -e

# Port assigned by Render / Railway / Cloud host (defaults to 3000 if not set)
PORT="${PORT:-3000}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$SCRIPT_DIR}"

echo "=========================================================="
echo "⚡ Starting RecoverAI Unified Production Stack"
echo "👉 Public Facing Port: $PORT"
echo "👉 Application Directory: $APP_DIR"
echo "=========================================================="

cleanup() {
    echo "Stopping RecoverAI production processes..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# 1. Initialize SQLite demo database if not yet present
cd "$APP_DIR/backend"
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

if [ ! -f "recoverai.db" ]; then
    echo "Seeding initial demo database..."
    python scripts/seed_demo.py || true
fi

# 2. Start FastAPI Backend on internal port 8000
echo "🚀 [Backend] Launching FastAPI on 127.0.0.1:8000..."
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait for backend health check
RETRIES=0
until curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; do
    sleep 0.5
    RETRIES=$((RETRIES+1))
    if [ $RETRIES -gt 30 ]; then
        echo "❌ Backend failed to start in 15 seconds"
        exit 1
    fi
done
echo "✅ [Backend] Live & healthy on 127.0.0.1:8000"

# 3. Start Next.js Frontend on the public facing $PORT
cd "$APP_DIR/frontend"
if [ ! -d ".next" ]; then
    echo "📦 [.next build directory missing] Building Next.js frontend..."
    npm run build
fi

echo "🚀 [Frontend] Launching Next.js UI on 0.0.0.0:$PORT..."
exec npm start -- -p "$PORT" -H 0.0.0.0
