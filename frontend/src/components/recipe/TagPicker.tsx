"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import { accentForKey } from "@/styles/accents";
import { CLAY } from "@/styles/clay";
import type { Tag } from "@/types";

type TagPickerProps = {
  options: Tag[];
  value: string[];
  onChange: (slugs: string[]) => void;
  disabled?: boolean;
};

/**
 * Multi-select from the shared tag taxonomy. Toggle chips — no freeform
 * create (keeps labels consistent for filtering later).
 */
export function TagPicker({
  options,
  value,
  onChange,
  disabled = false,
}: TagPickerProps) {
  if (options.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No tags available yet.
      </Typography>
    );
  }

  const toggle = (slug: string) => {
    if (disabled) return;
    onChange(
      value.includes(slug)
        ? value.filter((item) => item !== slug)
        : [...value, slug],
    );
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {options.map((tag) => {
        const selected = value.includes(tag.slug);
        const accent = accentForKey(tag.label);
        return (
          <Chip
            key={tag.slug}
            clickable
            disabled={disabled}
            onClick={() => toggle(tag.slug)}
            label={`#${tag.label}`}
            variant={selected ? "filled" : "outlined"}
            sx={{
              fontWeight: 700,
              borderWidth: CLAY.borderWidth,
              borderColor: accent.fg,
              bgcolor: selected ? accent.bg : "transparent",
              color: accent.fg,
              "&:hover": {
                bgcolor: accent.bg,
              },
            }}
          />
        );
      })}
    </Box>
  );
}
