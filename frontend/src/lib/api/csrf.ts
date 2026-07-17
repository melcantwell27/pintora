/**
 * CSRF helpers for the session-cookie auth flow. Django sets a `csrftoken`
 * cookie (readable by JS via CSRF_COOKIE_HTTPONLY = False); unsafe requests
 * must echo it back in the `X-CSRFToken` header.
 */

import { env } from "@/env";

export const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

/** allauth headless browser-client base, e.g. .../\_allauth/browser/v1 */
export const ALLAUTH_BASE_URL = `${API_BASE_URL}/_allauth/browser/v1`;

/** Read a browser cookie by name (returns null on the server). */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/**
 * Ensure a `csrftoken` cookie exists, fetching the allauth session endpoint to
 * mint one if needed. Returns the token (or null if it couldn't be obtained).
 */
export async function ensureCsrfToken(): Promise<string | null> {
  let token = getCookie("csrftoken");
  if (!token) {
    await fetch(`${ALLAUTH_BASE_URL}/auth/session`, {
      credentials: "include",
    }).catch(() => undefined);
    token = getCookie("csrftoken");
  }
  return token;
}
