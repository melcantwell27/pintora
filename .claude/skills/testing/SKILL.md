---
name: testing
description: Frontend testing conventions — MSW network mocking, typed fixtures, renderWithProviders, next/navigation mocks. Use when writing or changing frontend tests.
---

# Frontend testing conventions

Vitest + Testing Library + **MSW v2**. Run: `cd frontend && npm test`.

## The rules

- **Never `vi.mock` the network or data hooks.** Tests render real views with
  real hooks and the real API client; MSW intercepts HTTP. The only allowed
  `vi.mock` is `next/navigation` (router/searchParams have no test renderer).
- `vitest.setup.ts` runs the MSW server with `onUnhandledRequest: "error"` —
  a request with no handler FAILS the test. That's the contract tripwire;
  add a handler, don't relax it.
- Default handlers live in `src/test/msw/handlers.ts` (anonymous session,
  2-recipe feed, one known detail slug). Override per-test with
  `server.use(...)` — resets automatically after each test.

## Fixtures

`src/test/fixtures.ts` builders are typed `satisfies` the GENERATED API types
(`buildRecipeDetail`, `buildUserMe`, `paginated`, …). If a backend schema
change breaks a fixture, that's the point — update the fixture to the new
contract.

## Rendering

```ts
renderWithProviders(<HomeView />)   // src/test/test-utils.tsx
```

Fresh retry-free QueryClient + MUI theme per test. Assert with
`await screen.findByText(...)` for anything that loads.

## next/navigation mock pattern

```ts
const { pushMock, searchParamsRef } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => searchParamsRef.current,
}));
beforeEach(() => {
  pushMock.mockClear(); // mocks LEAK across tests otherwise
  searchParamsRef.current = new URLSearchParams();
});
```

## Asserting request bodies

Spy inside a handler override:

```ts
let requestBody: unknown;
server.use(
  http.post(api("/api/recipes/"), async ({ request }) => {
    requestBody = await request.json();
    return HttpResponse.json(buildRecipeWrite(), { status: 201 });
  }),
);
// ...submit... then expect(requestBody).toEqual({...})
```

## Backend tests

Plain Django `APITestCase` (`python manage.py test`, Postgres required).
`force_authenticate` for auth; name throwaway users `verify_*`.
