"use client";

import { useQuery } from "@tanstack/react-query";

import { recipeDetailQuery } from "@/lib/queries";

export function useRecipe(slug: string) {
  return useQuery({ ...recipeDetailQuery(slug), enabled: Boolean(slug) });
}
