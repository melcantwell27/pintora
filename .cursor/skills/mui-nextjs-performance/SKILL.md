---
name: mui-nextjs-performance
description: >-
  MUI + Next.js App Router performance practices for the Pintora frontend.
  Use when building or reviewing frontend pages, MUI imports, images, feeds,
  or lazy-loading in the pintora/frontend project.
---

# MUI + Next.js Performance (Pintora)

## Performance (the real concern with MUI)

MUI can be heavier than Tailwind, but it's still production-grade if you're disciplined:

- Import components directly (`@mui/material/Button`, not barrel imports)
- Use Next.js App Router + MUI's official Next integration
- `next/image` for recipe photos (biggest win on mobile)
- Lazy-load heavy screens (create recipe, profile edit)
- Paginate feeds; don't load 500 recipes at once

## When implementing

1. Prefer path imports for every MUI component.
2. Use `@mui/material-nextjs/v16-appRouter` `AppRouterCacheProvider` (MUI v9 + Next 16) in a client `Providers` component, kept out of the server `layout.tsx`.
3. Recipe images: always `next/image` with explicit sizes; serve from CDN when available.
4. Feed/list pages: server or client pagination against the Django API — never unbounded lists.
5. Heavy routes (`/create`, `/profile/edit`): use `next/dynamic` with loading fallbacks.

## Project conventions (Pintora)

- **Structure is layer-based:** `app/` (thin routes) → `views/` (wire hooks/stores/components) → `components/` (presentational). Also `hooks/`, `store/` (Zustand, client state only), `lib/api/` (generated client), `constants/`, `utils/`, `types/`.
- **Server state = TanStack Query; global client state = Zustand; URL = search/filters; local = useState.** Never mirror server data into Zustand.
- **API types are generated** from the Django OpenAPI schema (drf-spectacular) via `npm run gen:api`. Don't hand-write API types; import from `@/types`.
- **Dev ports:** API on 8001, web on 3001.
