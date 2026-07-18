import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getRecipe } from "@/lib/api/server";
import { getQueryClient } from "@/lib/queryClient";
import { recipeKeys } from "@/lib/queryKeys";
import { RecipeDetailView } from "@/views/RecipeDetailView";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Recipe not found — Pintora" };

  const description =
    recipe.ingredients_text ||
    recipe.ingredients.map((ingredient) => ingredient.name).join(", ") ||
    `A ${recipe.program_display} Creami recipe by @${recipe.created_by.username}.`;

  return {
    title: `${recipe.title} — Pintora`,
    description,
    openGraph: {
      title: recipe.title,
      description,
      type: "article",
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;

  // getRecipe is React.cache'd — generateMetadata and the page share one
  // API call per request.
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const queryClient = getQueryClient();
  queryClient.setQueryData(recipeKeys.detail(slug), recipe);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecipeDetailView slug={slug} />
    </HydrationBoundary>
  );
}
