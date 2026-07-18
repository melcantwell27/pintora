import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { RecipeCard } from "@/components/recipe/RecipeCard";
import type { RecipeListItem } from "@/types";

interface RecipeFeedListProps {
  recipes: RecipeListItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyMessage?: string;
}

export function RecipeFeedList({
  recipes,
  isLoading,
  isError,
  emptyMessage = "No recipes yet.",
}: RecipeFeedListProps) {
  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={96} />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Couldn&apos;t load recipes. Is the API running?
      </Alert>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </Stack>
  );
}
