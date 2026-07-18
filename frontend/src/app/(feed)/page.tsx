import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { fetchRecipeList } from "@/lib/api/server";
import { getQueryClient } from "@/lib/queryClient";
import { recipeKeys } from "@/lib/queryKeys";
import { HomeView } from "@/views/HomeView";

export default async function HomePage() {
  const queryClient = getQueryClient();

  // prefetchQuery swallows errors by design: on API failure we hydrate an
  // empty cache and the client-side query retries with its own error UI.
  await queryClient.prefetchQuery({
    queryKey: recipeKeys.list(),
    queryFn: () => fetchRecipeList(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView />
    </HydrationBoundary>
  );
}
