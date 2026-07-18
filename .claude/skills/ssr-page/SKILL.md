---
name: ssr-page
description: The page pattern for new/changed routes — server prefetch + hydration, streaming groups, auth gating, metadata, 404s. Use when touching anything under frontend/src/app/.
---

# Adding or changing a route

**Next 16 warning:** APIs differ from training data. Check
`frontend/node_modules/next/dist/docs/` before using App Router / proxy /
caching APIs. Known: middleware is `src/proxy.ts` (`export function proxy`);
`cookies()`, `params`, `searchParams` are async/Promises; `fetch` is uncached
by default and `cacheComponents` stays OFF (per-user, request-time data).

## The page pattern

Pages are thin async server components; views stay `"use client"` (MUI):

```tsx
export default async function XxxPage() {
  const queryClient = getQueryClient(); // per-request on server
  await queryClient.prefetchQuery({
    queryKey: recipeKeys.list(), // SAME factory as the hook
    queryFn: () => fetchRecipeList(), // server client fetcher
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <XxxView />
    </HydrationBoundary>
  );
}
```

- `prefetchQuery` swallows errors → fine for feeds (client retries with its
  own error UI). When you need 404 handling, fetch explicitly
  (`React.cache`'d), call `notFound()` on null, then `setQueryData`.
- `generateMetadata` shares the page's fetch via `React.cache` — Next's fetch
  memoization is unreliable when openapi-fetch passes a `Request` object.

## Streaming vs status codes (deliberate split)

- `(feed)/` route group has `loading.tsx` → `/` and `/search` stream skeleton
  shells. Streamed responses are always HTTP 200 (Next injects
  `noindex` for streamed 404s).
- `/recipes/[slug]` deliberately has NO `loading.tsx` → missing recipes get a
  true HTTP 404 + the segment `not-found.tsx`.
- Put a route needing its own shell in a route group so its `loading.tsx`
  doesn't wrap unrelated segments. A root `app/loading.tsx` wraps EVERYTHING.

## Auth gating (two layers)

1. `src/proxy.ts` — optimistic: redirects to `/login?next=<path>` when the
   `sessionid` cookie is absent. Add protected paths to `config.matcher`.
2. The page — authoritative: `const user = await fetchMe();` then
   `if (!user) redirect("/login?next=/xxx");` and hydrate
   `sessionKeys.me()` with the result. Stale cookies pass the proxy but
   bounce here.

`?next=` consumers must keep the open-redirect guard (same-origin paths
only: starts with `/`, not `//`). After login/signup/logout, call
`router.refresh()` so server-rendered output tied to the cookie re-renders.

## Traps hit before (don't rediscover)

- Server components can't pass component props (e.g. `component={Link}`) into
  MUI client components — make the page/component `"use client"` instead.
- A view using `useSearchParams` must be wrapped in `<Suspense>` by its page.
- curl can't see UI text that lives in lazy JS chunks (e.g. not-found UI) —
  verify rendered behavior with Playwright (see the verify skill).
- MUI v9 removed composite styleOverride keys (`containedPrimary`) — use the
  `variants` API — and pruned icon variants (`DeleteOutline` → `Delete`).
