"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/constants";
import { useCreateRecipe } from "@/hooks/useCreateRecipe";
import type { components } from "@/lib/api/schema";
import { useUiStore } from "@/store/useUiStore";

type ProgramEnum = components["schemas"]["ProgramEnum"];

const PROGRAMS: { value: ProgramEnum; label: string }[] = [
  { value: "ice_cream", label: "Ice Cream" },
  { value: "lite_ice_cream", label: "Lite Ice Cream" },
  { value: "sorbet", label: "Sorbet" },
  { value: "gelato", label: "Gelato" },
  { value: "smoothie_bowl", label: "Smoothie Bowl" },
  { value: "milkshake", label: "Milkshake" },
  { value: "mix_in", label: "Mix-in" },
  { value: "frozen_yogurt", label: "Frozen Yogurt" },
  { value: "italian_ice", label: "Italian Ice" },
];

/**
 * Create form UI. Reached only when authenticated (see the /create route's
 * RequireAuth gate). Submits to POST /api/recipes/.
 */
export function CreateRecipeView() {
  const router = useRouter();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const createRecipe = useCreateRecipe();

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [program, setProgram] = useState<ProgramEnum | "">("");
  const [ingredientName, setIngredientName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedIngredient = ingredientName.trim();
    const ingredients = trimmedIngredient
      ? [
          {
            section: "base" as const,
            name: trimmedIngredient,
            sort_order: 0,
          },
        ]
      : [];

    try {
      const recipe = await createRecipe.mutateAsync({
        title: title.trim(),
        instructions: instructions.trim(),
        ...(program ? { program } : {}),
        ingredients,
        is_published: true,
      });

      showSnackbar("Recipe published!");
      if (recipe.slug) {
        router.push(ROUTES.recipe(recipe.slug));
      } else {
        router.push(ROUTES.home);
      }
    } catch {
      setError("Could not publish. Check your connection and try again.");
    }
  };

  return (
    <Stack spacing={2} component="form" onSubmit={onSubmit}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
        Add a Creami
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Instructions"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        required
        fullWidth
        multiline
        minRows={3}
      />
      <FormControl fullWidth>
        <InputLabel id="program-label">Program (optional)</InputLabel>
        <Select
          labelId="program-label"
          label="Program (optional)"
          value={program}
          onChange={(e) => setProgram(e.target.value as ProgramEnum | "")}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {PROGRAMS.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Main ingredient (optional)"
        value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)}
        fullWidth
        placeholder="e.g. Greek yogurt"
        helperText="You can add more ingredients later — one is enough to publish for now."
      />

      <Box>
        <Button
          type="submit"
          variant="contained"
          disabled={createRecipe.isPending}
        >
          {createRecipe.isPending ? "Publishing…" : "Publish"}
        </Button>
      </Box>
    </Stack>
  );
}
