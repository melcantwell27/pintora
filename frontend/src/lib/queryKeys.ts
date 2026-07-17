/**
 * Single source of truth for query keys. These exact shapes are the contract
 * between browser hooks and (later) server-side prefetch + hydration — never
 * build keys inline.
 */
export const recipeKeys = {
  /** Root for all recipe lists — invalidate this to refresh every feed. */
  lists: ["recipes"] as const,
  list: (search?: string) => ["recipes", search ?? ""] as const,
  detail: (slug: string) => ["recipe", slug] as const,
};

export const sessionKeys = {
  me: () => ["me"] as const,
};
