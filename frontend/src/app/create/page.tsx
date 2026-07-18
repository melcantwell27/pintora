import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { fetchMe } from "@/lib/api/server";
import { getQueryClient } from "@/lib/queryClient";
import { sessionKeys } from "@/lib/queryKeys";
import { CreateRecipeView } from "@/views/CreateRecipeView";

export default async function CreatePage() {
  // Authoritative session check — a present-but-invalid cookie passes the
  // proxy's optimistic check but bounces here.
  const user = await fetchMe();
  if (!user) redirect("/login?next=/create");

  const queryClient = getQueryClient();
  queryClient.setQueryData(sessionKeys.me(), user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreateRecipeView />
    </HydrationBoundary>
  );
}
