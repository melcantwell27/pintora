"use client";

import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "@/constants";

export function AddCreamiFab() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === ROUTES.create) return null;

  return (
    <Fab
      color="primary"
      variant="extended"
      aria-label="Add Creami"
      onClick={() => router.push(ROUTES.create)}
      sx={{ position: "fixed", bottom: 80, right: 16, zIndex: 1200 }}
    >
      <AddIcon sx={{ mr: 1 }} />
      Add Creami
    </Fab>
  );
}
