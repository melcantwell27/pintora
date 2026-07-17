"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useQueryClient } from "@tanstack/react-query";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Wordmark } from "@/components/layout/Wordmark";
import { ROUTES } from "@/constants";
import { SESSION_QUERY_KEY } from "@/hooks/useSession";
import { AuthError, login } from "@/lib/api/authClient";

export function LoginView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      router.push(ROUTES.home);
    } catch (err) {
      setError(
        err instanceof AuthError ? err.message : "Something went wrong.",
      );
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", py: 4 }}>
      <Stack spacing={1} sx={{ mb: 3, alignItems: "center" }}>
        <Wordmark />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Welcome back
        </Typography>
        <Typography color="text.secondary">
          Log in to share and save Creami recipes.
        </Typography>
      </Stack>

      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            fullWidth
          >
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 3 }}>or</Divider>
      <GoogleButton />

      <Typography sx={{ mt: 3, textAlign: "center" }} color="text.secondary">
        New here?{" "}
        <Link
          component={NextLink}
          href={ROUTES.signup}
          sx={{ fontWeight: 700 }}
        >
          Create an account
        </Link>
      </Typography>
    </Box>
  );
}
