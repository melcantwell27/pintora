"use client";

import { useQuery } from "@tanstack/react-query";

import { sessionQuery } from "@/lib/queries";

/**
 * Resolve the current user via `GET /api/me`. A 200 means logged in; a 401/403
 * means anonymous (`data === null`). The React Query cache is the single
 * source of truth for session state. This GET also ensures the `csrftoken`
 * cookie exists for later writes.
 */
export function useSession() {
  return useQuery(sessionQuery());
}
