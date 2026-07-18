# Pintora architecture

Mobile-first platform for sharing Ninja Creami recipes.
**Django (DRF) + Next.js 16 (App Router) + PostgreSQL 16 + MUI v9 + TanStack Query v5 + Zustand.**

This document explains _why_ the system is shaped the way it is. For _how to
do a specific task_, see the skills in `.claude/skills/` — they're written
for AI agents but read fine for humans.

## The type chain (the load-bearing convention)

```
Django models / serializers / views
        │  drf-spectacular (COMPONENT_SPLIT_REQUEST: True)
        ▼
backend/schema.yml                    ← committed; CI fails if stale
        │  openapi-typescript (npm run gen:api)
        ▼
frontend/src/lib/api/schema.d.ts      ← committed; never hand-edited
        ▼
frontend/src/types/index.ts           ← ergonomic aliases
```

Every API type the frontend uses is generated. There are no hand-written API
types and no `as` casts around them — if a generated type is wrong, the
backend schema is wrong and gets fixed there. `COMPONENT_SPLIT_REQUEST`
produces separate `XxxRequest` components (readOnly fields omitted) for
request bodies. Test fixtures `satisfies` these types, so contract drift is
a compile error, not a runtime surprise.

## Frontend layer model (`frontend/src/`)

```
app/        THIN — routes, layouts, server prefetch + HydrationBoundary only
views/      FAT  — "use client"; wire hooks + stores + components
components/ presentational UI (layout/, recipe/, auth/)
hooks/      thin wrappers over shared queryOptions / mutations
lib/        api clients, queryKeys, queries, schemas (zod), queryClient
store/      Zustand — client-only UI state (snackbar). Nothing else.
styles/     theme.ts (MUI), clay.ts (design tokens), accents.ts
test/       MSW handlers, typed fixtures, renderWithProviders
```

**State model:** server state → TanStack Query · client-only UI state →
Zustand (`useUiStore`) · URL → search params · ephemeral → `useState`.
There is deliberately **no session store**: `useSession()` reads the `["me"]`
query; the React Query cache is the single source of truth for "who am I".

## Data fetching / SSR model

Pages are thin async server components that prefetch into a per-request
QueryClient, dehydrate, and wrap the client view in `<HydrationBoundary>`.
Views stay `"use client"` (MUI) and call the same hooks as before — hydration
means their first render already has data.

- **Query keys** (`lib/queryKeys.ts`) are the hydration contract: the server
  prefetch and the browser hook must build identical keys. All keys come from
  the factory; none are written inline.
- **Two API clients**: the browser client (`lib/api/client.ts`) sends
  credentials and attaches Django's CSRF token to unsafe methods; the server
  client (`lib/api/server.ts`, `server-only`) forwards the incoming request's
  cookies and is **GET-only** — mutations always happen in the browser where
  CSRF works. Both late-bind `fetch` so MSW (tests) and Next (server) can
  patch it.
- **Streaming is a per-route decision**: the `(feed)` route group has a
  `loading.tsx`, so `/` and `/search` stream skeleton shells (HTTP 200
  always). `/recipes/[slug]` has no loading boundary on purpose: missing
  recipes return a real HTTP 404 with a custom `not-found.tsx`.
- `generateMetadata` and the recipe page share one API call via
  `React.cache`.
- `cacheComponents` stays **off**: everything is per-user, request-time data.

## Auth

Django session cookies (`SameSite=Lax`) + CSRF token cookie; django-allauth
headless for login/signup/logout/Google (hand-written `lib/api/authClient.ts`
— those endpoints are outside the OpenAPI schema).

Route protection is two-layered:

1. `src/proxy.ts` (Next 16's middleware) — _optimistic_: no `sessionid`
   cookie → redirect to `/login?next=<path>`. Cheap, no network.
2. The protected page — _authoritative_: `fetchMe()` through the
   cookie-forwarding server client; `null` → `redirect()`. Catches
   present-but-invalid cookies.

`?next=` is honored by Login/Signup with an open-redirect guard (same-origin
paths only). After any auth change, views call `router.refresh()` because
invalidating the React Query cache does not re-render dehydrated server
output. Production constraint: frontend and API must share a registrable
domain for the proxy to see the session cookie.

## Recipe capture

Recipes are captured as free-form `ingredients_text` plus structured
`RecipeIngredient` rows. `POST /api/recipes/parse-ingredients/` converts text
to draft rows via a deterministic parser (`backend/recipes/parsing.py`) —
a pure function behind a stable request/response contract, deliberately
swappable for an LLM later without touching the endpoint. `special_prep`
replaced classic instructions (Creami recipes are "blend and spin"; what
matters is what's in the pint and anything unusual about the method).

## Testing

- **Frontend**: Vitest + Testing Library + MSW v2. Tests render real views
  with real hooks against intercepted HTTP; `onUnhandledRequest: "error"`
  makes unmocked requests fail loudly. Fixtures are typed `satisfies` the
  generated API types.
- **Backend**: Django `APITestCase` incl. parser coverage.
- **CI** (`.github/workflows/ci.yml`): frontend prettier/lint/typecheck/
  test/build; backend tests against Postgres 16; schema-drift check.

## Known constraints / deliberate skips

- Next 16 differs from public docs in places — always check
  `frontend/node_modules/next/dist/docs/` (see `frontend/AGENTS.md`).
- MUI v9 removed composite styleOverride keys (use the `variants` API) and
  some icon variants.
- `@next/bundle-analyzer` is webpack-only; Next 16 builds with Turbopack —
  use the build-output route table as the size baseline.
- Optimistic updates: pattern documented in the `data-layer` skill; lands
  with the first edit/delete mutation.
- Storybook: skipped — ~10 views of themed stock MUI; MSW integration tests
  are the component documentation.
