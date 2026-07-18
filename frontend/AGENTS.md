<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions

Task-shaped guides live in `../.claude/skills/` — `ssr-page` (routes, auth
gating, streaming), `data-layer` (queries/mutations), `testing` (MSW
conventions), `schema-sync` (regenerating API types). System rationale:
`../docs/architecture.md`. Known local facts: middleware is `src/proxy.ts`;
`cookies()`/`params`/`searchParams` are async; `cacheComponents` stays off;
MUI v9 uses the `variants` API instead of composite styleOverride keys.
