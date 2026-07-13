"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

export function useRecipe(slug: string) {
  return useQuery({
    queryKey: ["recipe", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/recipes/{slug}/", {
        params: { path: { slug } },
      });
      if (error) throw new Error("Failed to load recipe");
      return data;
    },
  });
}
