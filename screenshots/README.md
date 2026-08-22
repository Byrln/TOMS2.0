# TOMS page screenshots

The PNG files in this folder are full-page desktop screenshots.

- `storefront/` contains the current branch storefront public pages and the login-gate captures for protected routes.
- `storefront/portal-demo/` contains the authenticated traveler portal, trip, and confirmation screens rendered with the repository's deterministic demo build in an isolated worktree.
- `admin/` contains the admin login/recovery screens and the full authenticated admin workspace rendered with that deterministic demo build.

The current branch requires Supabase authentication for protected admin and traveler routes, so the demo-only screens were rendered from commit `c714c63` without modifying the current worktree.
