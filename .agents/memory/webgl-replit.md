---
name: WebGL in Replit preview
description: Three.js Canvas throws errors in the Replit iframe preview because WebGL context creation fails in headless/sandboxed environments.
---

Replit's preview pane is a proxied iframe. The underlying screenshot/headless environment may not support WebGL. Three.js logs `Error creating WebGL context` to console.error before React error boundaries can catch it, which Next.js dev overlay treats as a crash.

**Why:** Three.js calls `console.error` directly before throwing, bypassing React's error boundary silent catch.

**How to apply:**
1. Check WebGL availability *before* mounting the Canvas using `canvas.getContext('webgl')` in a `useEffect`.
2. Render a CSS fallback if unavailable — do not attempt `<Canvas>` at all.
3. Keep a React error boundary as a second safety net for edge cases.
