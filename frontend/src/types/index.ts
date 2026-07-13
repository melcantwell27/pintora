import type { components } from "@/lib/api/schema";

/**
 * Ergonomic aliases over the generated OpenAPI schema components.
 * Prefer importing these instead of reaching into `components["schemas"]`.
 */
export type RecipeListItem = components["schemas"]["RecipeList"];
export type RecipeDetail = components["schemas"]["RecipeDetail"];
export type RecipeIngredient = components["schemas"]["RecipeIngredient"];
export type Tag = components["schemas"]["Tag"];
export type UserPublic = components["schemas"]["UserPublic"];
export type UserMe = components["schemas"]["UserMe"];
export type PaginatedRecipes = components["schemas"]["PaginatedRecipeListList"];

export type IngredientSection = RecipeIngredient["section"];
