import { isServer, QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Must stay above ~0 so server-dehydrated data isn't immediately
        // refetched on hydration (the SSR contract with page prefetches).
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * TanStack advanced-SSR pattern: a fresh client per server request (no
 * cross-request cache leaks), a singleton in the browser (survives React
 * suspending during the initial render).
 */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}
