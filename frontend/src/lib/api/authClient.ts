/**
 * Thin wrapper over django-allauth's headless browser API (`/_allauth/...`),
 * which lives outside DRF so it isn't part of the generated OpenAPI client.
 * All calls are session-cookie based and CSRF-protected.
 */
import { ALLAUTH_BASE_URL, ensureCsrfToken } from "./csrf";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

type AllauthError = { message?: string; param?: string; code?: string };

function messageFromBody(body: unknown, fallback: string): string {
  const errors = (body as { errors?: AllauthError[] } | null)?.errors;
  if (errors?.length) {
    const joined = errors
      .map((e) => e.message)
      .filter(Boolean)
      .join(" ");
    if (joined) return joined;
  }
  return fallback;
}

async function request(
  method: string,
  path: string,
  fallbackError: string,
  payload?: Record<string, unknown>,
): Promise<unknown> {
  const token = await ensureCsrfToken();
  const res = await fetch(`${ALLAUTH_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(payload ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "X-CSRFToken": token } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new AuthError(messageFromBody(body, fallbackError), res.status);
  }
  return body;
}

export function login(email: string, password: string): Promise<unknown> {
  return request("POST", "/auth/login", "Incorrect email or password.", {
    email,
    password,
  });
}

export function signup(email: string, password: string): Promise<unknown> {
  return request("POST", "/auth/signup", "Could not create your account.", {
    email,
    password,
  });
}

export async function logout(): Promise<void> {
  try {
    await request("DELETE", "/auth/session", "Could not log out.");
  } catch (err) {
    // A 401 means the session is already gone — treat that as logged out.
    if (err instanceof AuthError && err.status === 401) return;
    throw err;
  }
}

/**
 * Kick off the Google OAuth flow. This is a top-level form navigation (not
 * fetch) because the backend responds with a 302 to Google's consent screen.
 * On completion the browser is redirected back to `callbackUrl`.
 */
export async function redirectToGoogle(callbackUrl: string): Promise<void> {
  const token = await ensureCsrfToken();
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${ALLAUTH_BASE_URL}/auth/provider/redirect`;

  const fields: Record<string, string> = {
    provider: "google",
    callback_url: callbackUrl,
    process: "login",
    ...(token ? { csrfmiddlewaretoken: token } : {}),
  };
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
