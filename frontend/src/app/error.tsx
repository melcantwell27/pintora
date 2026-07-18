"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";

/** Route-level error boundary (must be a client component). */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for observability tooling; digest identifies server errors.
    console.error(error);
  }, [error]);

  return (
    <Stack spacing={2} sx={{ py: 6, alignItems: "center" }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
        Something melted 🫠
      </Typography>
      <Alert severity="error" sx={{ maxWidth: 440 }}>
        An unexpected error occurred. It&apos;s been logged — try again in a
        moment.
      </Alert>
      <Button variant="contained" onClick={reset}>
        Try again
      </Button>
    </Stack>
  );
}
