"use client";

import Snackbar from "@mui/material/Snackbar";

import { useUiStore } from "@/store/useUiStore";

export function GlobalSnackbar() {
  const { snackbar, hideSnackbar } = useUiStore();

  return (
    <Snackbar
      open={snackbar.open}
      message={snackbar.message}
      autoHideDuration={3000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ mb: 9 }}
    />
  );
}
