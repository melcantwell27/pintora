"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Wordmark } from "@/components/layout/Wordmark";
import { ROUTES } from "@/constants";
import { AuthError, login } from "@/lib/api/authClient";
import { sessionKeys } from "@/lib/queryKeys";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  // Only same-origin paths — never redirect to an absolute URL from a param.
  const nextParam = searchParams.get("next");
  const nextPath =
    nextParam?.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : ROUTES.home;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      await login(email, password);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.me() });
      router.push(nextPath);
      // Re-render server components with the new session cookie — the RQ
      // cache update alone doesn't refresh dehydrated server output.
      router.refresh();
    } catch (err) {
      setError("root.serverError", {
        message:
          err instanceof AuthError ? err.message : "Something went wrong.",
      });
    }
  });

  const { ref: emailRef, ...emailProps } = register("email");
  const { ref: passwordRef, ...passwordProps } = register("password");

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

      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          {errors.root?.serverError && (
            <Alert severity="error">{errors.root.serverError.message}</Alert>
          )}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            {...emailProps}
            inputRef={emailRef}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            {...passwordProps}
            inputRef={passwordRef}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Logging in…" : "Log in"}
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
