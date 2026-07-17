import type {
  PaginatedRecipes,
  RecipeDetail,
  RecipeListItem,
  UserMe,
  UserPublic,
} from "@/types";

/**
 * Typed fixture builders. Because these `satisfies` the generated API types,
 * the compiler flags any drift between test fixtures and the real contract.
 */

export function buildUser(overrides: Partial<UserPublic> = {}): UserPublic {
  return {
    id: 1,
    username: "mel",
    bio: "",
    avatar: null,
    ...overrides,
  } satisfies UserPublic;
}

export function buildUserMe(overrides: Partial<UserMe> = {}): UserMe {
  return {
    id: 1,
    username: "mel",
    email: "mel@example.com",
    bio: "",
    avatar: null,
    ...overrides,
  } satisfies UserMe;
}

export function buildRecipeListItem(
  overrides: Partial<RecipeListItem> = {},
): RecipeListItem {
  return {
    id: 1,
    title: "Vanilla Bean Dream",
    slug: "vanilla-bean-dream",
    created_by: buildUser(),
    program: "ice_cream",
    program_display: "Ice Cream",
    tags: [{ slug: "classic", label: "Classic" }],
    created_at: "2026-07-01T12:00:00Z",
    ...overrides,
  } satisfies RecipeListItem;
}

export function buildRecipeDetail(
  overrides: Partial<RecipeDetail> = {},
): RecipeDetail {
  return {
    ...buildRecipeListItem(),
    instructions: "Blend the base.\nSpin on Ice Cream.",
    ingredients: [
      {
        id: 1,
        section: "base",
        name: "almond milk",
        quantity: "1.50",
        unit: "cup",
        prep_note: "",
        sort_order: 0,
      },
    ],
    images: [],
    is_published: true,
    updated_at: "2026-07-02T12:00:00Z",
    ...overrides,
  } satisfies RecipeDetail;
}

export function paginated(results: RecipeListItem[]): PaginatedRecipes {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  } satisfies PaginatedRecipes;
}
