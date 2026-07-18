# Contributing to Pintora

Applies to humans and AI agents alike. The conventions below are enforced by
CI and pre-commit hooks where possible; the rest live in `docs/architecture.md`
(the why) and `.claude/skills/` (the how).

## Setup & daily commands

```bash
bash scripts/setup.sh          # first clone: env files, venv, npm, migrate
docker compose up -d db        # Postgres :5434
cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8001
cd frontend && npm run dev     # :3001
```

Node version: `frontend/.nvmrc`. Python: 3.13.

## Workflow

- Short-lived branches: `feat/<name>`, `fix/<name>`, `chore/<name>` → PR into
  protected `main`; delete the branch after merge.
- Commits are phase-sized and focused; messages explain the _why_ in the body.
- Pre-commit (husky + lint-staged) auto-formats and lint-fixes staged files.

## The checks (run locally before pushing)

| Check         | Command (from `frontend/`)                                                          | CI job   |
| ------------- | ----------------------------------------------------------------------------------- | -------- |
| Format        | `npx prettier --check .`                                                            | frontend |
| Lint          | `npm run lint`                                                                      | frontend |
| Types         | `npm run typecheck`                                                                 | frontend |
| Tests         | `npm test`                                                                          | frontend |
| Build         | `npm run build`                                                                     | frontend |
| Backend tests | `python manage.py test` (from `backend/`, venv)                                     | backend  |
| Schema drift  | `python manage.py spectacular --file schema.yml && git diff --exit-code schema.yml` | backend  |

**Schema drift is the one that surprises people:** any backend change to
models/serializers/views must regenerate `backend/schema.yml` AND
`frontend/src/lib/api/schema.d.ts` (`npm run gen:api`) in the same commit.

## Hard rules

1. **Never hand-write or hand-edit frontend API types.** They flow from
   Django → OpenAPI → codegen. Wrong type = fix the backend schema.
2. **Query keys only via `src/lib/queryKeys.ts`.** They're the SSR hydration
   contract.
3. **Mutations from the browser client only** (CSRF); the server client is
   GET-only.
4. **No new Zustand stores for server state.** React Query owns it.
5. **Tests mock the network with MSW**, never `vi.mock` on data hooks.
6. **Check `frontend/node_modules/next/dist/docs/` before writing App
   Router/proxy code** — this Next version differs from public docs.
7. **Forms**: react-hook-form + zod schema in `src/lib/schemas/`, payload
   mappers returning the generated `XxxRequest` type.

## Where to look

- `docs/architecture.md` — system design and rationale
- `.claude/skills/schema-sync` — backend API changes
- `.claude/skills/data-layer` — queries/mutations
- `.claude/skills/ssr-page` — routes/pages/auth gating
- `.claude/skills/testing` — test conventions
- `.claude/skills/verify` — running and verifying end-to-end
