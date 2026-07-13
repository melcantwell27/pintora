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
import { AuthError, signup } from "@/lib/api/authClient";

export function SignupView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(email, password);
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
      <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <Wordmark />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Create your account
        </Typography>
        <Typography color="text.secondary">
          Join to post your own Creami creations.
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
            {submitting ? "Creating account…" : "Sign up"}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 3 }}>or</Divider>
      <GoogleButton />

      <Typography sx={{ mt: 3, textAlign: "center" }} color="text.secondary">
        Already have an account?{" "}
        <Link component={NextLink} href={ROUTES.login} fontWeight={700}>
          Log in
        </Link>
      </Typography>
    </Box>
  );
}
