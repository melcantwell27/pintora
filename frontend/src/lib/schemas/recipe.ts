import { z } from "zod";

import { PROGRAM_VALUES } from "@/constants/programs";
import type { components } from "@/lib/api/schema";

type RecipeWriteRequest = components["schemas"]["RecipeWriteRequest"];

export const recipeFormSchema = z.object({
  title: z.string().trim().min(1, "Give your recipe a title."),
  instructions: z.string().trim().min(1, "Add the instructions."),
  program: z.union([z.enum(PROGRAM_VALUES), z.literal("")]),
  ingredients: z.array(
    z.object({
      name: z.string().trim().min(1, "Ingredient name can't be empty."),
    }),
  ),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

/**
 * Map validated form values to the generated API request type. The return
 * type pins this to the OpenAPI contract — schema drift fails to compile.
 */
export function toRecipePayload(values: RecipeFormValues): RecipeWriteRequest {
  return {
    title: values.title,
    instructions: values.instructions,
    ...(values.program ? { program: values.program } : {}),
    ingredients: values.ingredients.map((ingredient, index) => ({
      section: "base" as const,
      name: ingredient.name,
      sort_order: index,
    })),
    is_published: true,
  };
}
