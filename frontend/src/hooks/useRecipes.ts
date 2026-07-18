"use client";

import { useQuery } from "@tanstack/react-query";

import { recipeListQuery } from "@/lib/queries";

export function useRecipes(search?: string) {
  return useQuery(recipeListQuery(search));
}
