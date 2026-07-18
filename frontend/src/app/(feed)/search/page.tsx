import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { fetchRecipeList } from "@/lib/api/server";
import { getQueryClient } from "@/lib/queryClient";
import { recipeKeys } from "@/lib/queryKeys";
import { SearchView } from "@/views/SearchView";

export default async function SearchPage() {
  const queryClient = getQueryClient();

  // SearchView's initial render (empty term) reads ["recipes", ""] — the
  // same key as the home feed — so prefetching it avoids a client fetch.
  await queryClient.prefetchQuery({
    queryKey: recipeKeys.list(),
    queryFn: () => fetchRecipeList(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchView />
    </HydrationBoundary>
  );
}
