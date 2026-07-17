import { http, HttpResponse } from "msw";

import { API_BASE_URL } from "@/lib/api/csrf";

import {
  buildRecipeDetail,
  buildRecipeListItem,
  buildRecipeWrite,
  paginated,
} from "../fixtures";

/** Absolute URL matching the API client's baseUrl. */
export const api = (path: string) => `${API_BASE_URL}${path}`;

export const defaultRecipeDetail = buildRecipeDetail();

export const defaultFeed = [
  buildRecipeListItem(),
  buildRecipeListItem({
    id: 2,
    title: "Mango Sorbet Sunrise",
    slug: "mango-sorbet-sunrise",
    program: "sorbet",
    program_display: "Sorbet",
    tags: [],
  }),
];

/**
 * Default network behavior for tests: a two-recipe feed, one known recipe
 * detail, and an anonymous session. Override per-test with `server.use(...)`.
 */
export const handlers = [
  http.get(api("/api/recipes/"), () =>
    HttpResponse.json(paginated(defaultFeed)),
  ),

  http.get(api("/api/recipes/:slug/"), ({ params }) => {
    if (params.slug === defaultRecipeDetail.slug) {
      return HttpResponse.json(defaultRecipeDetail);
    }
    return HttpResponse.json({ detail: "Not found." }, { status: 404 });
  }),

  http.post(api("/api/recipes/"), () =>
    HttpResponse.json(buildRecipeWrite(), { status: 201 }),
  ),

  http.get(api("/api/me/"), () =>
    HttpResponse.json(
      { detail: "Authentication credentials were not provided." },
      { status: 403 },
    ),
  ),

  // allauth headless endpoints (outside the OpenAPI schema).
  http.get(api("/_allauth/browser/v1/auth/session"), () =>
    HttpResponse.json({ status: 200 }),
  ),
  http.post(api("/_allauth/browser/v1/auth/login"), () =>
    HttpResponse.json({ status: 200 }),
  ),
  http.delete(api("/_allauth/browser/v1/auth/session"), () =>
    HttpResponse.json({ status: 200 }),
  ),
];
