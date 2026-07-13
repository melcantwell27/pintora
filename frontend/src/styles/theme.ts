"use client";

import { alpha, createTheme } from "@mui/material/styles";

// =====================================================================
// BRAND COLORS — the main place to change the app's look.
// Pick the active brand with ACTIVE_BRAND; delete the unused ones once
// you've fully settled.
// =====================================================================
type Brand = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  bg: string;
  paper: string;
  text: string;
  textSecondary: string;
  divider: string;
};

const BRANDS = {
  // Warm "Scoop Shop" — burnt/terracotta orange on cream.
  scoopShop: {
    primary: "#C65D2E",
    primaryDark: "#A9491F",
    primaryLight: "#E0794A",
    secondary: "#E86A92",
    bg: "#FFF8F0",
    paper: "#FFFFFF",
    text: "#3D2C24",
    textSecondary: "#7A685E",
    divider: "rgba(61, 44, 36, 0.12)",
  },
  // "Black Raspberry" — deep plum on light orchid cream.
  blackRaspberry: {
    primary: "#4A1C4F",
    primaryDark: "#33143A",
    primaryLight: "#7A3E80",
    secondary: "#B23A79",
    bg: "#ECE1F1",
    paper: "#FFFFFF",
    text: "#271230",
    textSecondary: "#655370",
    divider: "rgba(39, 18, 48, 0.12)",
  },
  // "Strawberry + Cacao" — pastel strawberry canvas, dark cacao-nib anchor,
  // strawberry pink accent.
  strawberryCacao: {
    primary: "#3B241A",
    primaryDark: "#26160F",
    primaryLight: "#5C3D2E",
    secondary: "#E24B7A",
    bg: "#FBDDE3",
    paper: "#FFFFFF",
    text: "#2E1B14",
    textSecondary: "#7A5A4C",
    divider: "rgba(46, 27, 20, 0.12)",
  },
} satisfies Record<string, Brand>;

const ACTIVE_BRAND: keyof typeof BRANDS = "strawberryCacao";
const brand = BRANDS[ACTIVE_BRAND];

// =====================================================================
// SCALES — radii / elevation / borders / fonts. Local to the theme; MUI's
// theme is the token layer, so these feed component defaults below.
// =====================================================================
const radii = { base: 16, card: 20, pill: 999 };
const elevation = {
  card: "0 6px 20px rgba(40, 30, 45, 0.10)",
  cardHover: "0 14px 30px rgba(40, 30, 45, 0.14)",
};
const inputBorderWidth = 2;
const fonts = {
  sans: "var(--font-sans), system-ui, -apple-system, Segoe UI, Arial, sans-serif",
  display: "var(--font-display), var(--font-sans), system-ui, sans-serif",
};

// =====================================================================
// THEME — assembles the above into MUI. Components read from here.
// =====================================================================
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.primary,
      light: brand.primaryLight,
      dark: brand.primaryDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: brand.secondary,
      contrastText: "#FFFFFF",
    },
    background: {
      default: brand.bg,
      paper: brand.paper,
    },
    text: {
      primary: brand.text,
      secondary: brand.textSecondary,
    },
    divider: brand.divider,
  },
  shape: {
    borderRadius: radii.base,
  },
  typography: {
    fontFamily: fonts.sans,
    fontWeightBold: 800,
    h1: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontFamily: fonts.display, fontWeight: 700 },
    h5: { fontFamily: fonts.display, fontWeight: 700 },
    h6: { fontFamily: fonts.display, fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    // Buttons: pill-shaped, comfortable tap size (mobile-first).
    MuiButton: {
      defaultProps: { disableElevation: true, size: "large" },
      styleOverrides: {
        root: { borderRadius: radii.pill, paddingInline: 22 },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: { borderRadius: radii.pill },
        extended: { textTransform: "none", fontWeight: 700, paddingInline: 20 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radii.pill, fontWeight: 600 },
      },
    },
    // Inputs: bold, on-brand outline (esp. the search field).
    MuiTextField: {
      defaultProps: { size: "medium" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: inputBorderWidth,
            borderColor: alpha(t.palette.primary.main, 0.35),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: t.palette.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: inputBorderWidth,
          },
        }),
      },
    },
    // Cards: rounded, soft shadow, hover-lift (so components stay presentational).
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: radii.card,
          border: `1px solid ${brand.divider}`,
          boxShadow: elevation.card,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: elevation.cardHover,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brand.bg,
          color: brand.text,
          backgroundImage: "none",
        },
      },
    },
  },
});
