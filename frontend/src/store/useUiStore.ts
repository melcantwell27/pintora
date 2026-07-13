"use client";

import { create } from "zustand";

interface SnackbarState {
  open: boolean;
  message: string;
}

interface UiState {
  snackbar: SnackbarState;
  showSnackbar: (message: string) => void;
  hideSnackbar: () => void;
}

/** Global client-only UI state (toasts, and later theme mode, etc.). */
export const useUiStore = create<UiState>((set) => ({
  snackbar: { open: false, message: "" },
  showSnackbar: (message) => set({ snackbar: { open: true, message } }),
  hideSnackbar: (): void =>
    set((state) => ({ snackbar: { ...state.snackbar, open: false } })),
}));
