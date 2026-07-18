"use client";

import { alpha, createTheme } from "@mui/material/styles";

import { CLAY } from "./clay";

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
  // "Strawberry + Cacao" — pastel strawberry canvas, dark cacao-nib ink,
  // strawberry pink accent. Soft clay depth (not diner outlines).
  strawberryCacao: {
    primary: "#3B241A",
    primaryDark: "#26160F",
    primaryLight: "#5C3D2E",
    secondary: "#E24B7A",
    bg: "#FBDDE3",
    paper: "#FFFCF7",
    text: "#2E1B14",
    textSecondary: "#7A5A4C",
    divider: "rgba(46, 27, 20, 0.12)",
  },
} satisfies Record<string, Brand>;

const ACTIVE_BRAND: keyof typeof BRANDS = "strawberryCacao";
const brand = BRANDS[ACTIVE_BRAND];

const radii = {
  base: CLAY.radius,
  card: CLAY.radiusCard,
  pill: 999,
  chip: CLAY.radiusChip,
};
const inputBorderWidth = 1.5;
const fonts = {
  sans: "var(--font-sans), system-ui, -apple-system, Segoe UI, Arial, sans-serif",
  display: "var(--font-display), var(--font-sans), system-ui, sans-serif",
};

const ink = brand.primary;
const soft = CLAY.shadow;
const press = {
  ...CLAY.press,
  boxShadow: soft.sm(ink),
};

// =====================================================================
// THEME — soft clay: round shapes, diffuse shadows, quiet borders.
// =====================================================================
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.primary,
      light: brand.primaryLight,
      dark: brand.primaryDark,
      contrastText: "#FFFCF7",
    },
    secondary: {
      main: brand.secondary,
      contrastText: "#FFFCF7",
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
    h1: {
      fontFamily: fonts.display,
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontFamily: fonts.display,
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: fonts.display,
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h4: { fontFamily: fonts.display, fontWeight: 700 },
    h5: { fontFamily: fonts.display, fontWeight: 700 },
    h6: { fontFamily: fonts.display, fontWeight: 700 },
    button: {
      textTransform: "none",
      fontWeight: 800,
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, size: "large" },
      styleOverrides: {
        root: {
          borderRadius: radii.base,
          paddingInline: 22,
          transition:
            "transform 0.12s ease, box-shadow 0.12s ease, background-color 0.15s ease",
          // MUI v9 dropped composite class keys (containedPrimary etc.) —
          // color-specific styling now goes through the variants API.
          variants: [
            {
              props: { variant: "contained", color: "primary" },
              style: {
                boxShadow: soft.md(ink),
                "&:hover": {
                  boxShadow: soft.lg(ink),
                  backgroundColor: brand.primaryLight,
                },
                "&:active": press,
              },
            },
            {
              props: { variant: "contained", color: "secondary" },
              style: {
                boxShadow: soft.md(ink),
                "&:hover": {
                  boxShadow: soft.lg(ink),
                },
                "&:active": press,
              },
            },
          ],
        },
        outlined: {
          borderWidth: inputBorderWidth,
          borderColor: alpha(ink, 0.2),
          color: ink,
          backgroundColor: brand.paper,
          boxShadow: soft.sm(ink),
          "&:hover": {
            borderWidth: inputBorderWidth,
            borderColor: alpha(ink, 0.35),
            backgroundColor: alpha(ink, 0.04),
            boxShadow: soft.md(ink),
          },
          "&:active": press,
        },
        text: {
          color: ink,
          "&:hover": {
            backgroundColor: alpha(ink, 0.06),
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          boxShadow: soft.lg(ink),
          fontWeight: 800,
          "&:hover": {
            boxShadow: soft.lg(ink),
          },
          "&:active": press,
        },
        extended: {
          textTransform: "none",
          fontWeight: 800,
          letterSpacing: "0.02em",
          paddingInline: 20,
        },
        primary: {
          backgroundColor: CLAY.lemon.bg,
          color: CLAY.lemon.fg,
          "&:hover": {
            backgroundColor: CLAY.lemon.bgHover,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radii.chip,
          fontWeight: 700,
          border: `1px solid ${alpha(ink, 0.12)}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "medium" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          // Flat paper + clear stroke — borders beat shadows for field affordance.
          backgroundColor: t.palette.background.paper,
          borderRadius: radii.base,
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: inputBorderWidth,
            borderColor: alpha(t.palette.primary.main, 0.28),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(t.palette.primary.main, 0.45),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
            borderColor: t.palette.secondary.main,
          },
        }),
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: radii.card,
          border: `1px solid ${alpha(ink, 0.08)}`,
          backgroundColor: brand.paper,
          boxShadow: soft.md(ink),
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: soft.lg(ink),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation3: {
          border: `1px solid ${alpha(ink, 0.08)}`,
          boxShadow: soft.md(ink),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(brand.paper, 0.92),
          color: brand.text,
          backgroundImage: "none",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(ink, 0.08)}`,
          boxShadow: soft.sm(ink),
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: brand.paper,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: brand.secondary,
          },
        },
        label: {
          fontWeight: 700,
          fontSize: "0.7rem",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radii.base,
          border: `1px solid ${alpha(ink, 0.1)}`,
          boxShadow: soft.sm(ink),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radii.base,
          "&:hover": {
            backgroundColor: alpha(ink, 0.08),
          },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: ink,
          color: brand.paper,
          borderRadius: radii.base,
          boxShadow: soft.md(ink),
          fontWeight: 700,
        },
      },
    },
  },
});
