"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type RecipeWriteInput = components["schemas"]["RecipeWrite"];
export type RecipeWriteResult = components["schemas"]["RecipeWrite"] & {
  slug?: string;
};

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: RecipeWriteInput) => {
      const { data, error, response } = await apiClient.POST("/api/recipes/", {
        body,
      });
      if (error || !response.ok) {
        throw new Error("Failed to publish recipe");
      }
      return data as RecipeWriteResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
