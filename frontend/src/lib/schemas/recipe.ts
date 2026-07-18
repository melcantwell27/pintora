import { z } from "zod";

import { PROGRAM_VALUES } from "@/constants/programs";
import type { components } from "@/lib/api/schema";

type RecipeWriteRequest = components["schemas"]["RecipeWriteRequest"];

export const recipeFormSchema = z
  .object({
    title: z.string().trim().min(1, "Give your recipe a title."),
    ingredients_text: z.string().trim().optional(),
    special_prep: z.string().trim().optional(),
    program: z.union([z.enum(PROGRAM_VALUES), z.literal("")]),
    tag_slugs: z.array(z.string()),
    ingredients: z.array(
      z.object({
        section: z.enum(["base", "mix_in"]),
        name: z.string().trim().min(1, "Ingredient name can't be empty."),
        quantity: z.string().trim().optional(),
        unit: z.string().trim().optional(),
      }),
    ),
  })
  .refine((values) => values.ingredients.length > 0, {
    message: "Add at least one ingredient.",
    path: ["ingredients"],
  });

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

/**
 * Map validated form values to the generated API request type. The return
 * type pins this to the OpenAPI contract — schema drift fails to compile.
 */
export function toRecipePayload(values: RecipeFormValues): RecipeWriteRequest {
  return {
    title: values.title,
    special_prep: values.special_prep ?? "",
    ingredients_text: values.ingredients_text ?? "",
    ...(values.program ? { program: values.program } : {}),
    ...(values.tag_slugs.length > 0 ? { tag_slugs: values.tag_slugs } : {}),
    ingredients: values.ingredients.map((ingredient, index) => ({
      section: ingredient.section,
      name: ingredient.name,
      ...(ingredient.quantity ? { quantity: ingredient.quantity } : {}),
      ...(ingredient.unit ? { unit: ingredient.unit } : {}),
      sort_order: index,
    })),
    is_published: true,
  };
}
