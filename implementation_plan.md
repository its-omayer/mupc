# Implementation Plan - Restructure to Pure Next.js Application

This plan outlines the steps to convert the repository from a Replit pnpm workspace into a clean, standalone, standard Next.js application at the root directory, removing all Replit-related files and comments to look human-created.

## User Review Required

> [!IMPORTANT]
> - **Workspace Cleanup**: The `artifacts` folder (containing `api-server`, `mockup-sandbox`, and Vite configs), the root `lib` workspace directory, and all Replit config files (`.replit`, `.replitignore`, `replit.md`) will be deleted.
> - **Standalone Next.js App**: All source code and assets from the `artifacts/mupc` directory will be migrated to the root level.
> - **Environment Configuration**: We will extract the database and API credentials from the `.replit` file and place them in a `.env.local` file at the root so that the production build and local dev environment compile and run out-of-the-box.

## Proposed Changes

### Configuration & Cleanup

#### [DELETE] [.replit](file:///home/vagusetvacuus/Downloads/mupc/.replit)
- Remove Replit run configurations and userenv credentials.

#### [DELETE] [.replitignore](file:///home/vagusetvacuus/Downloads/mupc/.replitignore)
- Remove Replit-specific ignore file.

#### [DELETE] [replit.md](file:///home/vagusetvacuus/Downloads/mupc/replit.md)
- Remove Replit-specific markdown documentation.

#### [DELETE] [pnpm-workspace.yaml](file:///home/vagusetvacuus/Downloads/mupc/pnpm-workspace.yaml)
- Delete the workspace config as we are converting to a single-package project.

#### [DELETE] [tsconfig.base.json](file:///home/vagusetvacuus/Downloads/mupc/tsconfig.base.json)
- Delete the base tsconfig used for workspace projects.

#### [DELETE] root [lib/](file:///home/vagusetvacuus/Downloads/mupc/lib) directory
- Delete unused external workspace packages (`api-client-react`, `api-spec`, `api-zod`, `db`).

#### [DELETE] root [scripts/](file:///home/vagusetvacuus/Downloads/mupc/scripts) directory
- Delete the old workspace scripts folder.

#### [DELETE] [artifacts/api-server](file:///home/vagusetvacuus/Downloads/mupc/artifacts/api-server) and [artifacts/mockup-sandbox](file:///home/vagusetvacuus/Downloads/mupc/artifacts/mockup-sandbox)
- Delete these subfolders as they are unused artifacts.

### Next.js Migration (Move to Root)

We will move the contents of `artifacts/mupc` to the root workspace directory:
- `components.json` -> `/components.json`
- `next-env.d.ts` -> `/next-env.d.ts`
- `next.config.js` -> `/next.config.js`
- `package.json` -> `/package.json` (replacing the old workspace package.json)
- `postcss.config.js` -> `/postcss.config.js`
- `public/` -> `/public/`
- `src/` -> `/src/`
- `tailwind.config.ts` -> `/tailwind.config.ts`
- `tsconfig.json` -> `/tsconfig.json` (replacing the old workspace tsconfig)
- `scripts/seed.ts` (from `artifacts/mupc/scripts`) -> `/scripts/seed.ts`

### Post-Migration Cleanup

#### [DELETE] [index.html](file:///home/vagusetvacuus/Downloads/mupc/index.html) (moved to root)
- Remove the leftover Vite HTML entry point.

#### [DELETE] [vite.config.ts](file:///home/vagusetvacuus/Downloads/mupc/vite.config.ts) (moved to root)
- Remove the leftover Vite configuration file.

#### [DELETE] [src/App.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/App.tsx)
- Remove the leftover Vite app component stub.

#### [DELETE] [src/main.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/main.tsx)
- Remove the leftover Vite main entry point stub.

#### [DELETE] [src/pages/not-found.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/pages/not-found.tsx)
- Remove the leftover pages router / Vite fallback 404 file.

### Code Modifications

#### [MODIFY] [package.json](file:///home/vagusetvacuus/Downloads/mupc/package.json) (moved to root)
- Rename package name from `@workspace/mupc` to `"mupc"`.
- Clean up dev and start scripts to remove hardcoded Replit `$PORT` requirements:
  - `"dev": "next dev"`
  - `"start": "next start"`

#### [MODIFY] [src/components/ui/button.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/components/ui/button.tsx)
- Clean up `@replit:` comments and replace/remove them to look human-written.

#### [MODIFY] [src/components/ui/badge.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/components/ui/badge.tsx)
- Clean up `@replit:` comments and replace/remove them to look human-written.

#### [NEW] [.env.local](file:///home/vagusetvacuus/Downloads/mupc/.env.local)
- Create local environment file with settings retrieved from `.replit`:
  - `MONGODB_URI`
  - `NEXTAUTH_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

## Verification Plan

### Automated Tests
- Run `pnpm install` at the root level to install the dependencies.
- Run `pnpm run build` to verify the production build succeeds.
- Fix any TypeScript or Next.js build errors encountered during compilation.
