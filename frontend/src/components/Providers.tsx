"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { GlobalSnackbar } from "@/components/layout/GlobalSnackbar";
import { useSession } from "@/hooks/useSession";
import { getQueryClient } from "@/lib/queryClient";
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
  // getQueryClient (not useState): keeps the same client if React suspends
  // during initial render, and there's no server/browser branch mismatch.
  const queryClient = getQueryClient();

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <SessionGate>{children}</SessionGate>
          <GlobalSnackbar />
          {/* Renders nothing in production builds. */}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
