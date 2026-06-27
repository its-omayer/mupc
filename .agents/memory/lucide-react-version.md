---
name: lucide-react version split
description: Workspace catalog pins lucide-react at a different version than individual artifacts, causing SSR/client hydration icon mismatches.
---

The pnpm-workspace catalog pins `lucide-react: ^0.545.0`. If a Next.js artifact declares `^0.511.0` in its own package.json, pnpm installs both. Webpack client bundle resolves from root node_modules (0.545.0) while Node.js SSR resolves from the artifact's local dep (0.511.0). Icon SVG path data differs between versions → hydration mismatch dev error.

**Why:** pnpm stores two separate version trees; webpack uses root resolution, Node.js uses per-package resolution.

**How to apply:** Always match the lucide-react version in a Next.js artifact to the catalog version (`^0.545.0`). After updating, run `pnpm install --no-frozen-lockfile`.
