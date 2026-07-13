"use client";

import Typography from "@mui/material/Typography";

import { RecipeFeedList } from "@/components/recipe/RecipeFeedList";
import { useRecipes } from "@/hooks/useRecipes";

export function HomeView() {
  const { data, isLoading, isError } = useRecipes();

  return (
    <>
      <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
        Latest Creamis
      </Typography>
      <RecipeFeedList
        recipes={data?.results}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No recipes yet. Tap Add Creami to share the first one!"
      />
    </>
  );
}
