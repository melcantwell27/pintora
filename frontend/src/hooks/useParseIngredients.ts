"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ParseIngredientsInput =
  components["schemas"]["ParseIngredientsRequestRequest"];
export type ParseIngredientsResult =
  components["schemas"]["ParseIngredientsResponse"];

export function useParseIngredients() {
  return useMutation({
    mutationFn: async (body: ParseIngredientsInput) => {
      const { data, error, response } = await apiClient.POST(
        "/api/recipes/parse-ingredients/",
        { body },
      );
      if (error || !response.ok || !data) {
        throw new Error("Failed to parse ingredients");
      }
      return data;
    },
  });
}
