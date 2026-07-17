import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables. Malformed or missing values fail at import
 * time instead of surfacing later as a broken API base URL.
 */
export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.url().default("http://localhost:8001"),
  },
  // NEXT_PUBLIC_* vars are inlined at build time, so each must be referenced
  // explicitly for the bundler to pick them up.
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
});
