import createClient, { type Middleware } from "openapi-fetch";

import { API_BASE_URL, getCookie } from "./csrf";
import type { paths } from "./schema";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

/**
 * Attach Django's CSRF token to unsafe requests so authenticated writes
 * (e.g. publishing a recipe) pass CsrfViewMiddleware.
 */
const csrfMiddleware: Middleware = {
  onRequest({ request }) {
    if (!SAFE_METHODS.has(request.method.toUpperCase())) {
      const token = getCookie("csrftoken");
      if (token) request.headers.set("X-CSRFToken", token);
    }
    return request;
  },
};

/**
 * Typed API client generated from the Django OpenAPI schema.
 * `credentials: "include"` sends the session cookie for authenticated calls.
 */
export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});

apiClient.use(csrfMiddleware);
