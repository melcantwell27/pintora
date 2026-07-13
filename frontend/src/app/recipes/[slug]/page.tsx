import { RecipeDetailView } from "@/views/RecipeDetailView";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <RecipeDetailView slug={slug} />;
}
