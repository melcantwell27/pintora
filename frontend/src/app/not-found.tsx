"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <Stack spacing={2} sx={{ py: 6, alignItems: "center" }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
        This pint doesn&apos;t exist 🍨
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: "center" }}>
        The page you&apos;re looking for was unpublished, renamed, or never
        churned in the first place.
      </Typography>
      <Button component={Link} href={ROUTES.home} variant="contained">
        Back to the feed
      </Button>
    </Stack>
  );
}
