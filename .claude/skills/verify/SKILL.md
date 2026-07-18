---
name: verify
description: How to run and drive Pintora locally to verify changes end-to-end.
---

# Verifying Pintora changes

## Launch

The user's dev servers are often already running — probe before starting:
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/api/recipes/` (backend)
and `http://localhost:3001/` (frontend). If they're up, use them: Django's
StatReloader picks up backend edits, Next.js dev has HMR. Otherwise:

```bash
docker compose up -d db                                   # Postgres :5434
cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8001
cd frontend && npm run dev                                # :3001
```

**⚠️ The frontend dev server on :3001 may run inside a container** (process
path `/app/...`) — NEVER `pkill -f next` or similar broad kills; you'll take
down the user's environment. To test a production build, use a separate port:

```bash
cd frontend && npm run build && PORT=3002 npm run start   # your own server
# stop it by port, not by name:
kill $(ss -tlnp | grep 3002 | grep -oE 'pid=[0-9]+' | cut -d= -f2)
```

## Verifying SSR behavior

Dev mode can serve stale route modules — production builds are authoritative.
On the :3002 prod server:

- **Server-rendered content**: `curl -s localhost:3002/ | grep <recipe-title>`
  — titles must appear in raw HTML (no JS).
- **Metadata**: `curl -s localhost:3002/recipes/<slug> | grep -oE '<title>[^<]*</title>'`
  plus `og:` tags.
- **404s**: bogus slug → HTTP 404 (`/recipes/[slug]` is non-streamed by
  design). Streamed routes (feed group) always return 200 — that's expected;
  Next injects `noindex` for streamed not-founds.
- **curl lies about lazy UI**: text rendered from lazy JS chunks (e.g. the
  custom not-found page) is NOT in the HTML — assert it with Playwright,
  not curl.
- **Auth gating**: `curl -s -o /dev/null -w '%{http_code} → %{redirect_url}' localhost:3002/create`
  → 307 to `/login?next=%2Fcreate`; with `-H 'Cookie: sessionid=garbage'` it
  must STILL bounce (page-level check); with a real session (signup via
  `scripts/auth-smoke.sh` pattern) → 200 with the form server-rendered.

## Browser driving

No Playwright in the repo, but browser binaries are cached. Set up in scratchpad:

```bash
npm i playwright-core@1.55   # matches cached chromium-1187
```

Launch with `executablePath: ~/.cache/ms-playwright/chromium-1187/chrome-linux/chrome`.
Use a mobile viewport (390x844) — the app is mobile-first.

## Test users

Auth is django-allauth headless (email login). Users created via
`User.objects.create_user()` can NOT log in until you also create an
`allauth.account.models.EmailAddress` row (verified=True, primary=True) for them.
Login form fields are labeled "Email" / "Password"; button "Log in".

API auth flow for curl: GET `/_allauth/browser/v1/auth/session` to mint the
csrftoken cookie, then POST `/auth/login` with `X-CSRFToken` header
(see `scripts/auth-smoke.sh` for the pattern).

Name test users `verify_*` and delete them when done
(`User.objects.filter(username__startswith='verify').delete()` cascades recipes).

## Gotchas

- Writes to `/api/recipes/` need the CSRF cookie + header; the frontend handles
  this via the session GET on load.
- Non-creator PATCH returns 404 (queryset-scoped), not 403 — expected.
