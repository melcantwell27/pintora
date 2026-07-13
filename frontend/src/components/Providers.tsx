"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { GlobalSnackbar } from "@/components/layout/GlobalSnackbar";
import { useSession } from "@/hooks/useSession";
import { makeQueryClient } from "@/lib/queryClient";
import { theme } from "@/styles/theme";

/**
 * Resolves auth state once, high in the tree, so the whole app knows whether a
 * user is signed in (and mints the CSRF cookie for later writes).
 */
function SessionGate({ children }: { children: React.ReactNode }) {
  useSession();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <SessionGate>{children}</SessionGate>
          <GlobalSnackbar />
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
