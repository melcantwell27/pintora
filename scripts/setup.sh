#!/usr/bin/env bash
# One-time (or fresh-machine) initialization for Pintora.
# Run from repo root:  bash scripts/setup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Pintora setup (repo root: $ROOT)"

# --- env files (never overwrite existing) ---
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
else
  echo ".env already exists — skipped"
fi

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from backend/.env.example"
else
  echo "backend/.env already exists — skipped"
fi

if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.local.example frontend/.env.local
  echo "Created frontend/.env.local from frontend/.env.local.example"
else
  echo "frontend/.env.local already exists — skipped"
fi

# --- Python venv (lives at backend/.venv) ---
if [ ! -d backend/.venv ]; then
  echo "==> Creating Python virtualenv at backend/.venv"
  python3 -m venv backend/.venv
else
  echo "backend/.venv already exists — skipped create"
fi

echo "==> Installing Python dependencies"
backend/.venv/bin/pip install --upgrade pip -q
backend/.venv/bin/pip install -r backend/requirements.txt -q

# --- Node ---
echo "==> Installing frontend dependencies"
cd frontend
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
  if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "WARNING: Node $(node -v) detected. Next.js 16 requires Node >= 20.9."
    echo "         Install Node 20+ (nvm recommended) before running npm run dev."
  fi
fi
npm install
cd "$ROOT"

# --- Postgres via Docker ---
echo "==> Starting Postgres (docker compose)"
docker compose up -d db

echo "==> Waiting for Postgres to be healthy..."
until docker compose exec -T db pg_isready -U pintora -d pintora >/dev/null 2>&1; do
  sleep 1
done
echo "Postgres is ready."

# --- Django migrations ---
echo "==> Running Django migrations"
cd backend
../backend/.venv/bin/python manage.py makemigrations users recipes
../backend/.venv/bin/python manage.py migrate

# --- Seed sample recipes (dev only) ---
echo "==> Seeding sample recipes"
../backend/.venv/bin/python manage.py seed_recipes || true

echo ""
echo "Setup complete."
echo ""
echo "Secrets go in the REAL env files (not the *.example templates):"
echo "  backend/.env          ← Django + Google OAuth"
echo "  frontend/.env.local   ← Next.js API URL"
echo "  .env                  ← Docker Postgres"
echo ""
echo "Next steps (Pintora uses dedicated ports 8001/3001 to avoid clashes):"
echo "  1. Create a superuser:  cd backend && source .venv/bin/activate && python manage.py createsuperuser"
echo "  2. Start backend (API): cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8001"
echo "  3. Start frontend (web): cd frontend && npm run dev    # serves on http://localhost:3001"
echo ""
echo "  API docs (Swagger): http://localhost:8001/api/docs/"
echo "  Regenerate API types after backend changes: cd frontend && npm run gen:api"
echo ""
echo "Note: Next.js 16 needs Node >= 20. If needed: nvm install 20 && nvm use 20"
echo "See README.md for full reference."
