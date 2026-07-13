"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/constants";
import { useSession } from "@/hooks/useSession";

/**
 * Renders children only for authenticated users; anonymous visitors are
 * redirected to /login once the session has resolved.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !user) router.replace(ROUTES.login);
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
