# Implementation Plan - Admin Redirect Removal, Full Photo Details Page & Dynamic Rendering Error Fix

This plan covers removing the "separate portal" text and redirect from the member sign-in panel, adding a dedicated page to view full photos with full details, and resolving Next.js static build compilation issues by forcing dynamic rendering on routes utilizing NextAuth's `getServerSession`.

## Proposed Changes

### Sign In & Authentication

#### [MODIFY] [signin/page.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/app/signin/page.tsx)
- Remove the text/link "Admins use a separate portal" from the bottom of the signin page.
- On successful sign in, check the user's role and automatically redirect admin users to `/bash-mubc-bash` (or the callback URL if specified), allowing them to use the same sign-in panel.

---

### Photo Details Feature

#### [NEW] [route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/photos/[id]/route.ts)
- Create a `GET` API route at `/api/photos/[id]` to retrieve photo metadata (title, photographer, tags, votes, views, etc.) and its Cloudinary URL from MongoDB by its ID.

#### [NEW] [page.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/app/photos/[id]/page.tsx)
- Create a beautifully designed client page to view the photo in full size/resolution alongside its details.
- **Image Source**: The full-size image is rendered directly from **Cloudinary** using the secure URL (`cloudinaryUrl`) stored in MongoDB.
- Implement interactive elements: "Vote for this Photo" (for active contests), "Save to Bookmarks", and "Open Original" (direct Cloudinary link).
- Integrate the standard `Navbar` and `Footer` components.

#### [MODIFY] [gallery/page.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/app/gallery/page.tsx)
- Add a "View Full Photo Details" button/link inside the lightbox popup that redirects to the new `/photos/[id]` page.

#### [MODIFY] [leaderboard/page.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/app/leaderboard/page.tsx)
- Wrap the contest photos and titles with a Next.js `Link` pointing to `/photos/[id]`, enabling users to click any thumbnail on the leaderboard to view it in full.

#### [MODIFY] [dashboard/page.tsx](file:///home/vagusetvacuus/Downloads/mupc/src/app/dashboard/page.tsx)
- Add a click-to-view link on photos in the submissions grid.
- Implement the actual Bookmarks / Saved list rendering. Users will now see a grid of all their bookmarked photos in the "Saved" tab, which also link to `/photos/[id]`.

#### [MODIFY] [profile/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/dashboard/profile/route.ts)
- Add a `GET` method to return the authenticated user's profile and populate their `savedPhotos` field, enabling the Saved tab on the dashboard to display their bookmarked photos.

#### [MODIFY] [bookmarks/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/bookmarks/route.ts)
- Make `action` default to `'save'` if not explicitly passed, and handle both `'save'` and `'unsave'` correctly to support toggling bookmarks easily from the detail page.

---

### Dynamic Rendering Fixes

#### [MODIFY] [notifications/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/notifications/route.ts)
- Add `export const dynamic = 'force-dynamic'` at the top to prevent static compilation errors due to `getServerSession`.

#### [MODIFY] API GET routes containing `getServerSession`:
- Add `export const dynamic = 'force-dynamic'` at the top of:
  - [submissions/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/dashboard/submissions/route.ts)
  - [users/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/admin/users/route.ts)
  - [stats/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/admin/stats/route.ts)
  - [photos/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/admin/photos/route.ts)
  - [contestweeks/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/admin/contestweeks/route.ts)
  - [logs/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/admin/logs/route.ts)
  - [photographers/route.ts](file:///home/vagusetvacuus/Downloads/mupc/src/app/api/admin/photographers/route.ts)

---

## Verification Plan

### Automated Tests
- Run `pnpm run build` to verify the Next.js production build succeeds without static extraction errors or compiler errors.

### Manual Verification
- Log in using normal credentials and verify page redirect behavior.
- Visit the Gallery, click a photo to open the lightbox, click "View Full Photo Details", and ensure it loads perfectly from Cloudinary.
- Verify voting/bookmarking logic on the detailed page.
- Test the dashboard Saved tab to ensure saved bookmarks are displayed correctly.
