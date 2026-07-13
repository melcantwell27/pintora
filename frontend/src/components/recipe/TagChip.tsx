import Chip from "@mui/material/Chip";

import { accentForKey } from "@/styles/accents";

export function TagChip({ label }: { label: string }) {
  const accent = accentForKey(label);
  return (
    <Chip
      size="small"
      label={`#${label}`}
      sx={{
        bgcolor: accent.bg,
        color: accent.fg,
        fontWeight: 700,
        border: "none",
      }}
    />
  );
}
