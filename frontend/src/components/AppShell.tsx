"use client";

import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";

import AddCreamiFab from "./AddCreamiFab";
import BottomNav from "./BottomNav";

const HIDE_FAB_ON = ["/create"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFab = !HIDE_FAB_ON.some((path) => pathname.startsWith(path));

  return (
    <Box sx={{ pb: 8, minHeight: "100dvh" }}>
      {children}
      {showFab && <AddCreamiFab />}
      <BottomNav />
    </Box>
  );
}
