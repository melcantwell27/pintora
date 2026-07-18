import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables. Malformed or missing values fail at import
 * time instead of surfacing later as a broken API base URL.
 */
export const env = createEnv({
  server: {
    // Server-side API origin (e.g. an internal hostname in containerized
    // deploys). Falls back to the public URL when unset.
    API_BASE_URL: z.url().optional(),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.url().default("http://localhost:8001"),
  },
  // NEXT_PUBLIC_* vars are inlined at build time, so each must be referenced
  // explicitly for the bundler to pick them up.
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
});
