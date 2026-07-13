import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { formatIngredient } from "@/utils";
import type { RecipeIngredient } from "@/types";

function Section({
  title,
  items,
}: {
  title: string;
  items: RecipeIngredient[];
}) {
  if (items.length === 0) return null;
  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <List dense disablePadding>
        {items.map((ingredient) => (
          <ListItem key={ingredient.id} disableGutters>
            <ListItemText primary={formatIngredient(ingredient)} />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export function IngredientList({
  ingredients,
}: {
  ingredients: RecipeIngredient[];
}) {
  const base = ingredients.filter((i) => i.section === "base");
  const mixIns = ingredients.filter((i) => i.section === "mix_in");

  return (
    <>
      <Section title="Base" items={base} />
      <Section title="Mix-ins" items={mixIns} />
    </>
  );
}
