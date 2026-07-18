"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { IngredientEditorRow } from "@/components/recipe/IngredientEditorRow";
import { TagPicker } from "@/components/recipe/TagPicker";
import { ROUTES } from "@/constants";
import { PROGRAM_OPTIONS } from "@/constants/programs";
import { useCreateRecipe } from "@/hooks/useCreateRecipe";
import { useParseIngredients } from "@/hooks/useParseIngredients";
import { useTags } from "@/hooks/useTags";
import {
  recipeFormSchema,
  toRecipePayload,
  type RecipeFormValues,
} from "@/lib/schemas/recipe";
import { lemonBumpSx } from "@/styles/clay";
import { useUiStore } from "@/store/useUiStore";

/**
 * Create form UI. Reached only when authenticated (see the /create route's
 * RequireAuth gate). Submits to POST /api/recipes/.
 */
export function CreateRecipeView() {
  const router = useRouter();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const createRecipe = useCreateRecipe();
  const parseIngredients = useParseIngredients();
  const { data: tags = [] } = useTags();
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);

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
      ingredients_text: "",
      special_prep: "",
      program: "",
      tag_slugs: [],
      ingredients: [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "ingredients",
  });

  const ingredientsText = useWatch({ control, name: "ingredients_text" });

  const onParse = async () => {
    if (!ingredientsText?.trim()) return;
    try {
      const result = await parseIngredients.mutateAsync({
        text: ingredientsText,
      });
      replace(
        result.ingredients.map((ingredient) => ({
          section: ingredient.section,
          name: ingredient.name,
          quantity: ingredient.quantity ?? "",
          unit: ingredient.unit,
        })),
      );
      setParseWarnings(result.warnings);
    } catch {
      setParseWarnings([]);
      showSnackbar("Couldn't parse that — try editing rows manually.");
    }
  };

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
  const { ref: ingredientsTextRef, ...ingredientsTextProps } =
    register("ingredients_text");
  const { ref: specialPrepRef, ...specialPrepProps } = register("special_prep");

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

      <Box>
        <TextField
          label="What's in the pint?"
          placeholder="1 cup Fairlife, 2 tbsp cocoa, handful of strawberries…"
          {...ingredientsTextProps}
          inputRef={ingredientsTextRef}
          fullWidth
          multiline
          minRows={3}
        />
        <Button
          onClick={onParse}
          disabled={!ingredientsText?.trim() || parseIngredients.isPending}
          sx={(theme) => ({
            mt: 1,
            ...lemonBumpSx(theme.palette.primary.main),
          })}
        >
          {parseIngredients.isPending ? "Parsing…" : "Parse & replace rows"}
        </Button>
        {parseWarnings.length > 0 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {parseWarnings.join(" ")}
          </Alert>
        )}
      </Box>

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
          Tags (optional)
        </Typography>
        <Controller
          name="tag_slugs"
          control={control}
          render={({ field }) => (
            <TagPicker
              options={tags}
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Ingredients
        </Typography>
        {errors.ingredients?.message && (
          <FormHelperText error sx={{ mb: 1 }}>
            {errors.ingredients.message}
          </FormHelperText>
        )}
        <Stack spacing={1.5}>
          {fields.map((field, index) => (
            <IngredientEditorRow
              key={field.id}
              index={index}
              control={control}
              register={register}
              nameError={errors.ingredients?.[index]?.name}
              onRemove={() => remove(index)}
            />
          ))}
        </Stack>
        <Button
          startIcon={<AddIcon />}
          onClick={() =>
            append({ section: "base", name: "", quantity: "", unit: "" })
          }
          sx={{ mt: 1 }}
        >
          Add ingredient
        </Button>
      </Box>

      <TextField
        label="Special prep (optional)"
        placeholder="Anything unique about this pint's method…"
        {...specialPrepProps}
        inputRef={specialPrepRef}
        fullWidth
        multiline
        minRows={2}
      />

      <Box>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Publishing…" : "Publish"}
        </Button>
      </Box>
    </Stack>
  );
}
