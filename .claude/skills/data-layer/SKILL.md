---
name: data-layer
description: How to add a query or mutation to the frontend — query key factory, queryOptions, hooks, invalidation, optimistic updates. Use when adding/changing any TanStack Query usage.
---

# Adding queries and mutations

Server state lives in TanStack Query. Zustand (`useUiStore`) is for
client-only UI state (snackbar). There is deliberately NO session store —
`useSession()` reading the `["me"]` query is the single source of truth.

## Adding a query

1. **Key** in `src/lib/queryKeys.ts` — always via the factory, never inline:

   ```ts
   export const recipeKeys = {
     lists: ["recipes"] as const, // invalidation root
     list: (search?: string) => ["recipes", search ?? ""] as const,
     detail: (slug: string) => ["recipe", slug] as const,
   };
   ```

   Key shapes are the **SSR hydration contract**: the server prefetch in
   `app/*/page.tsx` and the browser hook must produce byte-identical keys or
   the client silently refetches everything.

2. **queryOptions** in `src/lib/queries.ts` (TanStack v5 pattern) using the
   browser `apiClient`.

3. **Hook** in `src/hooks/` — a thin `useQuery(xxxQuery(...))` wrapper.

4. **Server prefetch** (only if a page server-renders it): add a fetcher to
   `src/lib/api/server.ts` using `serverApiClient` (cookie-forwarding,
   GET-only) and prefetch in the page with the SAME key factory call.

## Mutations

- Browser `apiClient` only — Django CSRF works via the `X-CSRFToken`
  middleware in `src/lib/api/client.ts`. Never mutate from the server client.
- Request body type = `components["schemas"]["XxxRequest"]`.
- Invalidate via the factory, as narrowly as possible
  (`recipeKeys.lists`, `recipeKeys.detail(slug)` — not broad blasts).
- If server-rendered output depends on the mutated state (e.g. auth), also
  call `router.refresh()` — invalidating the RQ cache does not re-render
  dehydrated server output.

### Optimistic updates (pattern for when edit/delete mutations exist)

```ts
onMutate: async (input) => {
  await queryClient.cancelQueries({ queryKey: recipeKeys.detail(slug) });
  const previous = queryClient.getQueryData(recipeKeys.detail(slug));
  queryClient.setQueryData(recipeKeys.detail(slug), optimisticNext);
  return { previous };
},
onError: (_e, _v, ctx) =>
  queryClient.setQueryData(recipeKeys.detail(slug), ctx?.previous),
onSettled: () =>
  queryClient.invalidateQueries({ queryKey: recipeKeys.detail(slug) }),
```

## Gotchas

- `staleTime` defaults to 60s (`src/lib/queryClient.ts`) — required so
  hydrated server data isn't refetched on mount. Don't set it to 0 globally.
- The API clients late-bind `fetch` (`fetch: (req) => globalThis.fetch(req)`)
  so MSW (tests) and Next's server fetch patches are honored. Keep that when
  creating new clients.
