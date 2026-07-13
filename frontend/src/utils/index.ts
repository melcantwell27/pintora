import type { RecipeIngredient } from "@/types";

/** Format an ingredient line, e.g. "1.5 cup almond milk (toasted & cooled)". */
export function formatIngredient(ingredient: RecipeIngredient): string {
  const quantity = ingredient.quantity
    ? String(Number(ingredient.quantity)).replace(/\.00$/, "")
    : "";
  const parts = [quantity, ingredient.unit, ingredient.name]
    .filter(Boolean)
    .join(" ");
  return ingredient.prep_note ? `${parts} (${ingredient.prep_note})` : parts;
}

/** Short relative-ish date, e.g. "Jul 8, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
