import { queryOptions } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { recipeKeys, sessionKeys } from "@/lib/queryKeys";
import type { UserMe } from "@/types";

/**
 * Shared queryOptions (TanStack v5 pattern): one definition per query,
 * consumed by browser hooks now and server-side prefetching later.
 */

export function recipeListQuery(search?: string) {
  return queryOptions({
    queryKey: recipeKeys.list(search),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/recipes/", {
        params: { query: search ? { search } : {} },
      });
      if (error || !data) throw new Error("Failed to load recipes");
      return data;
    },
  });
}

export function recipeDetailQuery(slug: string) {
  return queryOptions({
    queryKey: recipeKeys.detail(slug),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/recipes/{slug}/", {
        params: { path: { slug } },
      });
      if (error || !data) throw new Error("Failed to load recipe");
      return data;
    },
  });
}

export function sessionQuery() {
  return queryOptions<UserMe | null>({
    queryKey: sessionKeys.me(),
    queryFn: async () => {
      const { data, response } = await apiClient.GET("/api/me/");
      if (response.status === 401 || response.status === 403) return null;
      return data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
