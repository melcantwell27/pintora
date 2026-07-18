import AcUnitIcon from "@mui/icons-material/AcUnit";
import Chip from "@mui/material/Chip";

import { accentForProgram } from "@/styles/accents";

export function ProgramChip({ label }: { label: string }) {
  if (!label) return null;
  const accent = accentForProgram(label);
  return (
    <Chip
      size="small"
      icon={<AcUnitIcon />}
      label={label}
      sx={{
        bgcolor: accent.bg,
        color: accent.fg,
        fontWeight: 700,
        borderColor: accent.fg,
        "& .MuiChip-icon": { color: accent.fg },
      }}
    />
  );
}
