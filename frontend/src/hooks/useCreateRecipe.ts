"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type RecipeWriteInput = components["schemas"]["RecipeWriteRequest"];
export type RecipeWriteResult = components["schemas"]["RecipeWrite"];

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: RecipeWriteInput) => {
      const { data, error, response } = await apiClient.POST("/api/recipes/", {
        body,
      });
      if (error || !response.ok || !data) {
        throw new Error("Failed to publish recipe");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
