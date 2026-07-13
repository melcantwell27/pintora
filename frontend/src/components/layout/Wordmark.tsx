"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Pintora wordmark. The dot of the "i" is replaced with a small spoon graphic.
 * We render the "i" as a dotless i (U+0131) and overlay an SVG spoon so the
 * mark scales with font-size (spoon dimensions use `em` units).
 */
export function Wordmark({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box
      component="span"
      role="img"
      aria-label="Pintora"
      sx={{
        fontFamily: "var(--font-display), var(--font-sans), sans-serif",
        fontWeight: 700,
        color: "primary.main",
        fontSize: "1.6rem",
        lineHeight: 1,
        letterSpacing: "-0.005em",
        display: "inline-flex",
        alignItems: "baseline",
        userSelect: "none",
        ...sx,
      }}
    >
      P
      <Box component="span" sx={{ position: "relative", display: "inline-block" }}>
        {"\u0131"}
        <Box
          component="svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: "50%",
            top: "-0.12em",
            transform: "translateX(-50%) rotate(164deg)",
            width: "0.5em",
            height: "0.5em",
            fill: "currentColor",
          }}
        >
          <ellipse cx="12" cy="7" rx="4.6" ry="6" />
          <rect x="10.4" y="10" width="3.2" height="11" rx="1.6" />
        </Box>
      </Box>
      ntora
    </Box>
  );
}
