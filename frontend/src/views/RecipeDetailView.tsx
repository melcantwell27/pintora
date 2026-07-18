"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { IngredientList } from "@/components/recipe/IngredientList";
import { ProgramChip } from "@/components/recipe/ProgramChip";
import { TagChip } from "@/components/recipe/TagChip";
import { ROUTES } from "@/constants";
import { useRecipe } from "@/hooks/useRecipe";

export function RecipeDetailView({ slug }: { slug: string }) {
  const { data: recipe, isLoading, isError } = useRecipe(slug);

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width="70%" height={48} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    );
  }

  if (isError || !recipe) {
    return <Alert severity="error">Recipe not found.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Button
        component={Link}
        href={ROUTES.home}
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        size="small"
        sx={{ alignSelf: "flex-start" }}
      >
        Back
      </Button>

      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        {recipe.title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        by @{recipe.created_by.username}
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <ProgramChip label={recipe.program_display} />
        {recipe.tags.map((tag) => (
          <TagChip key={tag.slug} label={tag.label} />
        ))}
      </Stack>

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Ingredients
        </Typography>
        <IngredientList ingredients={recipe.ingredients} />
      </Box>

      {recipe.special_prep && (
        <>
          <Divider />
          <Box>
            <Typography variant="h6" gutterBottom>
              Special prep
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
              {recipe.special_prep}
            </Typography>
          </Box>
        </>
      )}
    </Stack>
  );
}
