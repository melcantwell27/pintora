import "server-only";

import { cookies } from "next/headers";
import createClient, { type Middleware } from "openapi-fetch";
import { cache } from "react";

import { env } from "@/env";
import type { RecipeDetail, UserMe } from "@/types";

import type { paths } from "./schema";

/**
 * Server-side API client. Forwards the incoming request's cookies (Django
 * session) to the API so prefetches see the same auth as the browser.
 * GET-only by convention: Django enforces CSRF on unsafe methods, so
 * mutations stay in the browser client where the X-CSRFToken middleware works.
 * Reading cookies() also opts the route into dynamic rendering — no
 * build-time fetches against the API.
 */
const forwardCookies: Middleware = {
  async onRequest({ request }) {
    const store = await cookies();
    const header = store
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    if (header) request.headers.set("cookie", header);
    return request;
  },
};

export const serverApiClient = createClient<paths>({
  baseUrl: env.API_BASE_URL ?? env.NEXT_PUBLIC_API_BASE_URL,
  fetch: (request) => globalThis.fetch(request),
});

serverApiClient.use(forwardCookies);

/**
 * Current user via the forwarded session cookie, or null when anonymous.
 * The authoritative server-side auth check for protected pages (the proxy
 * only checks that a session cookie exists, not that it's valid).
 */
export async function fetchMe(): Promise<UserMe | null> {
  const { data, response } = await serverApiClient.GET("/api/me/");
  if (response.status === 401 || response.status === 403) return null;
  return data ?? null;
}

/** Feed prefetch. Throws on failure — callers decide whether to swallow. */
export async function fetchRecipeList(search?: string) {
  const { data, error } = await serverApiClient.GET("/api/recipes/", {
    params: { query: search ? { search } : {} },
  });
  if (error || !data) throw new Error("Failed to load recipes");
  return data;
}

/**
 * Recipe by slug, or null on 404. React.cache dedupes the double call from
 * generateMetadata + the page within one request (Next's fetch memoization
 * is unreliable when openapi-fetch passes a Request object).
 */
export const getRecipe = cache(
  async (slug: string): Promise<RecipeDetail | null> => {
    const { data, response, error } = await serverApiClient.GET(
      "/api/recipes/{slug}/",
      { params: { path: { slug } } },
    );
    if (response.status === 404) return null;
    if (error || !data) throw new Error("Failed to load recipe");
    return data;
  },
);
