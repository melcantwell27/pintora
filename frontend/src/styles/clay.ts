import { alpha } from "@mui/material/styles";

/**
 * Soft clay / Duolingo-ish visual tokens — round shapes, diffuse depth,
 * no hard ink outlines. Used by the MUI theme and a few one-off accents.
 */
export const CLAY = {
  lemon: {
    bg: "#FFF1C9",
    bgHover: "#FFE59A",
    bgDisabled: "#F5EFD6",
    fg: "#9A6B00",
  },
  mint: {
    bg: "#DDF3E4",
    fg: "#1F7A4D",
  },
  /** Hairline only — depth comes from shadow, not outline. */
  borderWidth: 1,
  radius: 18,
  radiusCard: 24,
  radiusChip: 12,
  shadow: {
    sm: (ink: string) =>
      `0 2px 6px ${alpha(ink, 0.08)}, 0 1px 2px ${alpha(ink, 0.06)}`,
    md: (ink: string) =>
      `0 8px 24px ${alpha(ink, 0.12)}, 0 2px 6px ${alpha(ink, 0.08)}`,
    lg: (ink: string) =>
      `0 14px 36px ${alpha(ink, 0.14)}, 0 4px 12px ${alpha(ink, 0.08)}`,
  },
  /** Soft press — scale in place (no sticker translate). */
  press: {
    transform: "scale(0.97)",
  },
} as const;

/** Soft lemon CTA — kept name for call sites that used the old diner bump. */
export function lemonBumpSx(ink: string) {
  return {
    bgcolor: CLAY.lemon.bg,
    color: CLAY.lemon.fg,
    border: `${CLAY.borderWidth}px solid ${alpha(ink, 0.12)}`,
    borderRadius: CLAY.radius,
    boxShadow: CLAY.shadow.sm(ink),
    fontWeight: 800,
    letterSpacing: "0.02em",
    transition:
      "transform 0.12s ease, box-shadow 0.12s ease, background-color 0.15s ease",
    "&:hover": {
      bgcolor: CLAY.lemon.bgHover,
      boxShadow: CLAY.shadow.md(ink),
    },
    "&:active": {
      ...CLAY.press,
      boxShadow: CLAY.shadow.sm(ink),
    },
    "&.Mui-disabled": {
      bgcolor: CLAY.lemon.bgDisabled,
      color: "text.secondary",
      borderColor: "divider",
      boxShadow: "none",
      transform: "none",
    },
  } as const;
}
