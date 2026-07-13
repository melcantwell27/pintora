"use client";

import { create } from "zustand";

import type { UserMe } from "@/types";

interface SessionState {
  user: UserMe | null;
  isAuthenticated: boolean;
  setUser: (user: UserMe | null) => void;
  clear: () => void;
}

/**
 * Global client-side session state. The user object itself is fetched via
 * TanStack Query; this store holds the "who am I / am I logged in" flag that
 * many components across the app read. Wired up fully when auth lands.
 */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  clear: () => set({ user: null, isAuthenticated: false }),
}));
