"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

export function useRecipes(search?: string) {
  return useQuery({
    queryKey: ["recipes", search ?? ""],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/recipes/", {
        params: { query: search ? { search } : {} },
      });
      if (error) throw new Error("Failed to load recipes");
      return data;
    },
  });
}
