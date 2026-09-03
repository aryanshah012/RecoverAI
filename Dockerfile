# =======================================================
# Stage 1: Build Next.js Frontend
# =======================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# =======================================================
# Stage 2: Unified Production Image (Python + Node Runtime)
# =======================================================
FROM python:3.12-slim AS runner
WORKDIR /app

# Install Node.js runtime and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend, ML models, and data
COPY backend/ ./backend/
COPY ml/ ./ml/
COPY data/ ./data/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend ./frontend/

# Pre-seed demo database
WORKDIR /app/backend
RUN python scripts/seed_demo.py || true

WORKDIR /app

# Setup production startup script
COPY start-production.sh ./
RUN chmod +x start-production.sh

EXPOSE 3000 8000 10000

CMD ["./start-production.sh"]
