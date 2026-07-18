import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { ProgramChip } from "@/components/recipe/ProgramChip";
import { TagChip } from "@/components/recipe/TagChip";
import { ROUTES } from "@/constants";
import { accentForKey } from "@/styles/accents";
import type { RecipeListItem } from "@/types";

export function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const accent = accentForKey(recipe.created_by.username);
  const initial = recipe.created_by.username.charAt(0).toUpperCase();

  return (
    <Card>
      <CardActionArea component={Link} href={ROUTES.recipe(recipe.slug)}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.75 }}
          >
            {recipe.title}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 1, alignItems: "center" }}
          >
            <Avatar
              sx={{
                width: 26,
                height: 26,
                fontSize: 13,
                fontWeight: 800,
                bgcolor: accent.bg,
                color: accent.fg,
                border: "2px solid",
                borderColor: accent.fg,
              }}
            >
              {initial}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              @{recipe.created_by.username}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <ProgramChip label={recipe.program_display} />
            {recipe.tags.map((tag) => (
              <TagChip key={tag.slug} label={tag.label} />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
