"use client";

import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import { useRouter } from "next/navigation";

export default function AddCreamiFab() {
  const router = useRouter();

  return (
    <Fab
      color="primary"
      aria-label="Add Creami"
      variant="extended"
      onClick={() => router.push("/create")}
      sx={{
        position: "fixed",
        right: 16,
        bottom: 72,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <AddIcon sx={{ mr: 1 }} />
      Add Creami
    </Fab>
  );
}
