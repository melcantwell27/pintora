# Pintora — Claude Code context

Mobile-first recipe platform for Ninja Creami recipes.
**Stack:** Django (DRF) + Next.js 16 (App Router) + PostgreSQL 16 (Docker) + MUI v9 + TanStack Query + Zustand.

## Before you code — task-shaped guides

| Doing this?                               | Read this first              |
| ----------------------------------------- | ---------------------------- |
| Changing backend models/serializers/views | `.claude/skills/schema-sync` |
| Adding a query or mutation                | `.claude/skills/data-layer`  |
| Adding/changing a route or page           | `.claude/skills/ssr-page`    |
| Writing frontend tests                    | `.claude/skills/testing`     |
| Running the app to verify a change        | `.claude/skills/verify`      |
| Understanding the system design           | `docs/architecture.md`       |
| Workflow, CI gates, hard rules            | `docs/contributing.md`       |

## Dev commands

### Start everything (3 terminals)

```bash
docker compose up -d db                                  # Postgres on :5434
cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8001
cd frontend && npm run dev                               # Next.js on :3001
```

### First-time setup on a new clone

```bash
bash scripts/setup.sh   # copies .env files, creates venv, npm install, migrates
```

### Common backend tasks

```bash
cd backend && source .venv/bin/activate
python manage.py makemigrations && python manage.py migrate
python manage.py seed_recipes          # load test data
python manage.py seed_recipes --clear  # remove test data
python manage.py spectacular --file schema.yml  # regenerate OpenAPI schema
```

### Regenerate frontend API types (after backend model/serializer changes)

```bash
cd frontend && npm run gen:api   # openapi-typescript → src/lib/api/schema.d.ts
```

### Scripts

```bash
bash scripts/dev-backend.sh    # backend shortcut
bash scripts/dev-frontend.sh   # frontend shortcut
bash scripts/auth-smoke.sh     # smoke-test auth endpoints
```

## Architecture

### Backend (`backend/`)

- `config/` — Django project: settings, urls, wsgi/asgi
- `users/` — custom user model, auth views, serializers
- `recipes/` — Recipe model, serializers, views, permissions
- `backend/.env` — loaded by `settings.py` via `python-dotenv` (gitignored; copy from `.env.example`)

### Frontend layer model (`frontend/src/`)

```
app/        # THIN: routes + layouts only (server components, no logic)
views/      # FAT: wire hooks + stores + components ("use client")
components/ # presentational UI only — layout/ and recipe/ subfolders
hooks/      # data hooks (TanStack Query) and side-effect hooks
store/      # global CLIENT state only (Zustand) — never server state
lib/api/    # generated typed client — schema.d.ts (never hand-edit), client.ts
```

**State model:** server state → TanStack Query | global client state → Zustand | URL → search/filters | ephemeral → useState.

### API types

Never write frontend types by hand. They come from the backend OpenAPI schema via codegen (see above). Edit `schema.d.ts` only by regenerating it.

## Key conventions

- API runs on **:8001**, frontend on **:3001**, Postgres on **:5434** (avoids clashing with other local projects)
- All API types flow from Django → OpenAPI schema → `schema.d.ts` — maintain this chain
- MUI + Next.js performance patterns: see `.cursor/skills/mui-nextjs-performance/SKILL.md`
- Backend env vars: `backend/.env` (from `backend/.env.example`)
- Docker env vars: `.env` at repo root (from `.env.example`)
- Frontend env vars: `frontend/.env.local` (from `frontend/.env.local.example`)

## Git workflow

- Feature work goes on short-lived branches: `git checkout -b feat/<name>` or `fix/<name>`
- PRs merge into `main`; `main` is branch-protected on GitHub
- After merging, delete the feature branch
