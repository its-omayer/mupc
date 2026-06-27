---
name: api-server path conflict
description: Scaffold api-server artifact claims /api path, blocking a co-located Next.js app's own /api/* routes.
---

The default api-server artifact ships with `paths = ["/api"]` in its artifact.toml. If a Next.js app is also in the workspace and uses Next.js API routes at `/api/*`, ALL those calls will be intercepted by the (not-running) api-server proxy rule and return 502.

**Why:** Path-based routing matches most-specific-first, but `/api` beats `/` for `/api/*` requests.

**How to apply:** Whenever building a Next.js (or any full-stack single-artifact) app alongside the default api-server, update the api-server's artifact.toml to use a non-conflicting path such as `/api-server`. Use `verifyAndReplaceArtifactToml` — never edit artifact.toml directly.
