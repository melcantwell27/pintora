"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import type { Control, FieldError, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { RecipeFormValues } from "@/lib/schemas/recipe";
import { CLAY } from "@/styles/clay";

const SECTION_OPTIONS = [
  { value: "base", label: "Base" },
  { value: "mix_in", label: "Mix-in" },
] as const;

type IngredientEditorRowProps = {
  index: number;
  control: Control<RecipeFormValues>;
  register: UseFormRegister<RecipeFormValues>;
  nameError?: FieldError;
  onRemove: () => void;
};

/**
 * One editable ingredient row for create/edit. Stacks fields so qty/unit
 * aren't clipped on narrow (mobile) viewports.
 */
export function IngredientEditorRow({
  index,
  control,
  register,
  nameError,
  onRemove,
}: IngredientEditorRowProps) {
  const { ref: nameRef, ...nameProps } = register(`ingredients.${index}.name`);
  const { ref: quantityRef, ...quantityProps } = register(
    `ingredients.${index}.quantity`,
  );
  const { ref: unitRef, ...unitProps } = register(`ingredients.${index}.unit`);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minWidth: 0,
        p: 1.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: `${CLAY.radius}px`,
        boxShadow: (theme) => CLAY.shadow.sm(theme.palette.primary.main),
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          minWidth: 0,
        }}
      >
        <Controller
          name={`ingredients.${index}.section`}
          control={control}
          render={({ field: { ref, ...sectionField } }) => (
            <FormControl size="small" sx={{ width: 120, flexShrink: 0 }}>
              <InputLabel id={`section-label-${index}`}>Section</InputLabel>
              <Select
                labelId={`section-label-${index}`}
                label="Section"
                inputRef={ref}
                {...sectionField}
              >
                {SECTION_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Box sx={{ flex: 1, minWidth: 0 }} />
        <IconButton
          aria-label={`Remove ingredient ${index + 1}`}
          onClick={onRemove}
          sx={{ flexShrink: 0 }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <TextField
        label={`Ingredient ${index + 1}`}
        size="small"
        {...nameProps}
        inputRef={nameRef}
        error={Boolean(nameError)}
        helperText={nameError?.message}
        fullWidth
      />

      <Box
        sx={{
          display: "flex",
          gap: 1,
          minWidth: 0,
        }}
      >
        <TextField
          label="Qty"
          size="small"
          {...quantityProps}
          inputRef={quantityRef}
          sx={{ flex: "1 1 0", minWidth: 0 }}
        />
        <TextField
          label="Unit"
          size="small"
          {...unitProps}
          inputRef={unitRef}
          sx={{ flex: "1 1 0", minWidth: 0 }}
        />
      </Box>
    </Box>
  );
}
