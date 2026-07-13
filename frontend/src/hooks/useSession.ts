"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { apiClient } from "@/lib/api/client";
import { useSessionStore } from "@/store/useSessionStore";
import type { UserMe } from "@/types";

export const SESSION_QUERY_KEY = ["me"] as const;

/**
 * Resolve the current user via `GET /api/me`. A 200 means logged in; a 401/403
 * means anonymous. The result is mirrored into `useSessionStore` so any
 * component can read auth state synchronously. This GET also ensures the
 * `csrftoken` cookie exists for later writes.
 */
export function useSession() {
  const setUser = useSessionStore((s) => s.setUser);

  const query = useQuery<UserMe | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const { data, response } = await apiClient.GET("/api/me/");
      if (response.status === 401 || response.status === 403) return null;
      return data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess) setUser(query.data);
  }, [query.isSuccess, query.data, setUser]);

  return query;
}
