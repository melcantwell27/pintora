"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQueryClient } from "@tanstack/react-query";
import NextLink from "next/link";
import { useState } from "react";

import { ROUTES } from "@/constants";
import { useSession } from "@/hooks/useSession";
import { logout } from "@/lib/api/authClient";
import { sessionKeys } from "@/lib/queryKeys";
import { useUiStore } from "@/store/useUiStore";
import { accentForKey } from "@/styles/accents";

export function ProfileView() {
  const { data: user, isLoading } = useSession();
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const [loggingOut, setLoggingOut] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Your profile
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Log in to post recipes and manage your profile.
        </Typography>
        <Stack spacing={1.5} sx={{ maxWidth: 280, mx: "auto" }}>
          <Button
            component={NextLink}
            href={ROUTES.login}
            variant="contained"
            size="large"
          >
            Log in
          </Button>
          <Button
            component={NextLink}
            href={ROUTES.signup}
            variant="outlined"
            size="large"
          >
            Create an account
          </Button>
        </Stack>
      </Box>
    );
  }

  const accent = accentForKey(user.username);
  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      await queryClient.invalidateQueries({ queryKey: sessionKeys.me() });
    } catch {
      showSnackbar("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Box sx={{ py: 4, maxWidth: 440, mx: "auto" }}>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Avatar
          src={user.avatar ?? undefined}
          sx={{
            width: 88,
            height: 88,
            bgcolor: accent.bg,
            color: accent.fg,
            fontSize: 36,
            fontWeight: 800,
          }}
        >
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {user.username}
          </Typography>
          <Typography color="text.secondary">{user.email}</Typography>
        </Box>
        {user.bio && (
          <Typography sx={{ textAlign: "center" }}>{user.bio}</Typography>
        )}
        <Button
          onClick={onLogout}
          variant="outlined"
          color="inherit"
          disabled={loggingOut}
          sx={{ mt: 1 }}
        >
          {loggingOut ? "Logging out…" : "Log out"}
        </Button>
      </Stack>
    </Box>
  );
}
