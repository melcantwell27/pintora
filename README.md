# Pintora

Mobile-first recipe platform for sharing Ninja Creami recipes.

## Project layout

```
pintora/
├── README.md                 ← you are here (setup & daily dev reference)
├── docker-compose.yml        ← Postgres (Docker)
├── .env.example              ← Docker Postgres credentials (repo root)
├── scripts/
│   └── setup.sh              ← one-time initialization (venv, npm, migrate)
├── frontend/                 ← Next.js + MUI + TypeScript
│   ├── .env.local.example
│   └── src/
├── backend/                  ← Django + DRF
│   ├── .venv/                ← Python virtualenv (gitignored, created by setup)
│   ├── .env.example
│   ├── manage.py
│   ├── config/               ← Django project (settings, urls)
│   ├── users/                ← auth & profiles
│   └── recipes/              ← recipes, favorites, follows
└── .cursor/                  ← agent skills & rules for this repo
```

## Prerequisites

- **Node.js 20.9+** (Next.js 16 requirement) — check with `node -v`
- **Python 3.11+**
- **Docker** (for Postgres only)
- **npm**

## First-time setup

Run once on a new machine or fresh clone:

```bash
cd ~/pintora
bash scripts/setup.sh
```

This script:

1. Copies `.env.example` → `.env` (Docker)
2. Copies `backend/.env.example` → `backend/.env` (Django)
3. Copies `frontend/.env.local.example` → `frontend/.env.local` (Next.js)
4. Creates `backend/.venv` and installs Python packages
5. Runs `npm install` in `frontend/`
6. Starts Postgres via `docker compose up -d db`
7. Runs `makemigrations` + `migrate`

Then create an admin user:

```bash
cd backend
source .venv/bin/activate
python manage.py createsuperuser
```

## Daily development

Open **three terminals** (or use a process manager):

### 1. Postgres (if not already running)

```bash
cd ~/pintora
docker compose up -d db
```

### 2. Backend (Django) — port 8001

```bash
cd ~/pintora/backend
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8001
# → API:     http://localhost:8001/api/
# → Admin:   http://localhost:8001/admin
# → Health:  http://localhost:8001/api/health/
# → Docs:    http://localhost:8001/api/docs/   (Swagger UI)
# → Schema:  http://localhost:8001/api/schema/ (OpenAPI)
```

### 3. Frontend (Next.js) — port 3001

```bash
cd ~/pintora/frontend
npm run dev
# → http://localhost:3001
```

> **Ports:** Pintora uses **8001** (API) and **3001** (web) so it can run alongside
> other local projects that occupy 8000/3000. Postgres is on **5434** (see below).

## Where initialization lives

| What | Where | Command |
|------|-------|---------|
| **One-time full setup** | `scripts/setup.sh` | `bash scripts/setup.sh` |
| **Python virtualenv** | `backend/.venv/` | Created by setup script |
| **Python packages** | `backend/requirements.txt` | `pip install -r requirements.txt` |
| **Node packages** | `frontend/package.json` | `npm install` |
| **Database** | Docker volume `pintora_postgres_data` | `docker compose up -d db` |
| **Django migrations** | `backend/users/migrations/`, `backend/recipes/migrations/` | `python manage.py makemigrations` / `migrate` |
| **Env vars (Docker)** | `.env` | Copy from `.env.example` |
| **Env vars (Django)** | `backend/.env` | Copy from `backend/.env.example` |
| **Env vars (Next.js)** | `frontend/.env.local` | Copy from `frontend/.env.local.example` |

## Environment variables

### Repo root `.env` (Docker Compose)

Used by `docker-compose.yml` for the Postgres container.

> **Postgres host port is `5434`** (not the default 5432) to avoid clashing
> with other local Postgres instances. The container still listens on 5432
> internally; only the host mapping is 5434. Django connects to `localhost:5434`.

### `backend/.env` (Django)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DJANGO_SECRET_KEY` | — | Required in production |
| `DJANGO_DEBUG` | `True` | Set `False` in production |
| `POSTGRES_*` | `pintora` | DB connection (must match Docker) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3001` | Next.js dev origin |
| `FRONTEND_ORIGIN` | `http://localhost:3001` | SPA links in allauth emails |
| `GOOGLE_OAUTH_CLIENT_ID` | — | Google sign-in (optional locally) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | — | Google sign-in (optional locally) |

### `frontend/.env.local` (Next.js)

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8001` | Django API origin (schema paths include `/api`) |

## Stack

- **Frontend:** Next.js 16 (App Router), MUI v9, TanStack Query, Zustand, TypeScript
- **Backend:** Django, Django REST Framework, drf-spectacular, django-allauth
- **Database:** PostgreSQL 16 (Docker)
- **API contract:** OpenAPI schema (drf-spectacular) → typed client (`openapi-typescript` + `openapi-fetch`)
- **Auth:** Django + allauth (email); social providers can be added later

## Frontend architecture (layer-based)

```
frontend/src/
├── app/          # THIN routing: routes + layouts only (server components)
├── views/        # FAT views: wire hooks + stores + components ("use client")
├── components/   # presentational UI (layout/, recipe/)
├── hooks/        # data + side-effect hooks (TanStack Query)
├── store/        # global CLIENT state only (Zustand)
├── lib/api/      # generated typed client (schema.d.ts, client.ts)
├── constants/  utils/  types/  theme/
```

State model: **server state → TanStack Query**, **global client state → Zustand**,
**URL → search/filters**, **local → useState**.

## API types (codegen)

Frontend types come from the backend OpenAPI schema — never hand-written:

```bash
# 1. Backend regenerates the schema when models/serializers change
cd backend && source .venv/bin/activate
python manage.py spectacular --file schema.yml

# 2. Frontend regenerates TS types + client
cd frontend && npm run gen:api
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health/` | Health check |
| GET/POST | `/api/recipes/` | List / create recipes (paginated, `?search=`) |
| GET/PUT/PATCH/DELETE | `/api/recipes/{slug}/` | Recipe detail / edit |
| GET | `/api/users/{username}/` | Public profile |
| GET/PATCH | `/api/me/` , `/api/me/profile/` | Current user (auth) |
| GET | `/api/docs/` | Swagger UI |

## Sample data

```bash
cd backend && source .venv/bin/activate
python manage.py seed_recipes          # add test recipes
python manage.py seed_recipes --clear  # remove them
```

## Frontend performance practices

See `.cursor/skills/mui-nextjs-performance/SKILL.md` for MUI + Next.js conventions used in this repo.

## Common commands

```bash
# Stop Postgres
docker compose down

# Reset database (destructive — deletes all data)
docker compose down -v && docker compose up -d db
cd backend && source .venv/bin/activate && python manage.py migrate

# Add a Python dependency
source backend/.venv/bin/activate
pip install <package>
pip freeze > backend/requirements.txt

# New Django migration after model changes
cd backend && source .venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

## Node version note

If `npm run dev` fails with an engine error, upgrade Node:

```bash
# using nvm
nvm install 20
nvm use 20
```
