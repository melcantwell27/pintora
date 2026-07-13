"use client";

import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", value: "/", icon: <HomeIcon /> },
  { label: "Search", value: "/search", icon: <SearchIcon /> },
  { label: "Profile", value: "/profile", icon: <PersonIcon /> },
];

function resolveValue(pathname: string): string {
  if (pathname.startsWith("/search")) return "/search";
  if (pathname.startsWith("/profile")) return "/profile";
  return "/";
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <BottomNavigation
        showLabels
        value={resolveValue(pathname)}
        onChange={(_event, value) => router.push(value)}
      >
        {NAV_ITEMS.map((item) => (
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
