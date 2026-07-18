import type { components } from "@/lib/api/schema";
import type {
  PaginatedRecipes,
  RecipeDetail,
  RecipeListItem,
  UserMe,
  UserPublic,
} from "@/types";

type RecipeWrite = components["schemas"]["RecipeWrite"];
type ParsedIngredient = components["schemas"]["ParsedIngredient"];
type ParseIngredientsResponse =
  components["schemas"]["ParseIngredientsResponse"];

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
    special_prep: "Spin twice for extra creaminess.",
    ingredients_text: "1.5 cup almond milk",
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

export function buildRecipeWrite(
  overrides: Partial<RecipeWrite> = {},
): RecipeWrite {
  return {
    title: "Vanilla Bean Dream",
    slug: "vanilla-bean-dream",
    special_prep: "",
    ingredients_text: "",
    ingredients: [],
    is_published: true,
    ...overrides,
  } satisfies RecipeWrite;
}

export function buildParsedIngredient(
  overrides: Partial<ParsedIngredient> = {},
): ParsedIngredient {
  return {
    section: "base",
    name: "almond milk",
    quantity: "1",
    unit: "cup",
    sort_order: 0,
    ...overrides,
  } satisfies ParsedIngredient;
}

export function buildParseResponse(
  overrides: Partial<ParseIngredientsResponse> = {},
): ParseIngredientsResponse {
  return {
    ingredients: [
      buildParsedIngredient(),
      buildParsedIngredient({
        name: "cocoa powder",
        quantity: "2",
        unit: "tbsp",
        sort_order: 1,
      }),
    ],
    warnings: [],
    ...overrides,
  } satisfies ParseIngredientsResponse;
}

export function paginated(results: RecipeListItem[]): PaginatedRecipes {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  } satisfies PaginatedRecipes;
}
