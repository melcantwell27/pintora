"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { ROUTES } from "@/constants";
import { PROGRAM_OPTIONS } from "@/constants/programs";
import { useCreateRecipe } from "@/hooks/useCreateRecipe";
import {
  recipeFormSchema,
  toRecipePayload,
  type RecipeFormValues,
} from "@/lib/schemas/recipe";
import { useUiStore } from "@/store/useUiStore";

/**
 * Create form UI. Reached only when authenticated (see the /create route's
 * RequireAuth gate). Submits to POST /api/recipes/.
 */
export function CreateRecipeView() {
  const router = useRouter();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const createRecipe = useCreateRecipe();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      instructions: "",
      program: "",
      ingredients: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const recipe = await createRecipe.mutateAsync(toRecipePayload(values));
      showSnackbar("Recipe published!");
      router.push(recipe.slug ? ROUTES.recipe(recipe.slug) : ROUTES.home);
    } catch {
      setError("root.serverError", {
        message: "Could not publish. Check your connection and try again.",
      });
    }
  });

  const { ref: titleRef, ...titleProps } = register("title");
  const { ref: instructionsRef, ...instructionsProps } =
    register("instructions");

  return (
    <Stack spacing={2} component="form" onSubmit={onSubmit} noValidate>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
        Add a Creami
      </Typography>

      {errors.root?.serverError && (
        <Alert severity="error">{errors.root.serverError.message}</Alert>
      )}

      <TextField
        label="Title"
        {...titleProps}
        inputRef={titleRef}
        error={Boolean(errors.title)}
        helperText={errors.title?.message}
        fullWidth
      />
      <TextField
        label="Instructions"
        {...instructionsProps}
        inputRef={instructionsRef}
        error={Boolean(errors.instructions)}
        helperText={errors.instructions?.message}
        fullWidth
        multiline
        minRows={3}
      />
      <Controller
        name="program"
        control={control}
        render={({ field: { ref, ...field } }) => (
          <FormControl fullWidth>
            <InputLabel id="program-label">Program (optional)</InputLabel>
            <Select
              labelId="program-label"
              label="Program (optional)"
              inputRef={ref}
              {...field}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {PROGRAM_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Ingredients
        </Typography>
        <Stack spacing={1.5}>
          {fields.map((field, index) => {
            const { ref, ...nameProps } = register(`ingredients.${index}.name`);
            return (
              <Stack
                key={field.id}
                direction="row"
                spacing={1}
                sx={{ alignItems: "flex-start" }}
              >
                <TextField
                  label={`Ingredient ${index + 1}`}
                  size="small"
                  {...nameProps}
                  inputRef={ref}
                  error={Boolean(errors.ingredients?.[index]?.name)}
                  helperText={errors.ingredients?.[index]?.name?.message}
                  fullWidth
                />
                <IconButton
                  aria-label={`Remove ingredient ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            );
          })}
        </Stack>
        <Button
          startIcon={<AddIcon />}
          onClick={() => append({ name: "" })}
          sx={{ mt: 1 }}
        >
          Add ingredient
        </Button>
      </Box>

      <Box>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Publishing…" : "Publish"}
        </Button>
      </Box>
    </Stack>
  );
}
