"use client";

import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import { usePathname, useRouter } from "next/navigation";

import { CLAY } from "@/styles/clay";
import { ROUTES } from "@/constants";
import { useSession } from "@/hooks/useSession";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useSession();
  const isAuthenticated = Boolean(user);

  // The last tab reflects auth state: "Profile" when signed in, otherwise a
  // "Sign in" shortcut to the login page.
  const accountItem = isAuthenticated
    ? { label: "Profile", value: ROUTES.profile, icon: <PersonIcon /> }
    : { label: "Sign in", value: ROUTES.login, icon: <LoginIcon /> };

  const navItems = [
    { label: "Home", value: ROUTES.home, icon: <HomeIcon /> },
    { label: "Search", value: ROUTES.search, icon: <SearchIcon /> },
    accountItem,
  ];

  const current =
    navItems.find((item) =>
      item.value === ROUTES.home
        ? pathname === "/"
        : pathname.startsWith(item.value),
    )?.value ?? ROUTES.home;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderRadius: `${CLAY.radiusCard}px ${CLAY.radiusCard}px 0 0`,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderBottom: "none",
        boxShadow: (theme) => CLAY.shadow.lg(theme.palette.primary.main),
      }}
    >
      <BottomNavigation
        showLabels
        value={current}
        onChange={(_, value) => router.push(value)}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
