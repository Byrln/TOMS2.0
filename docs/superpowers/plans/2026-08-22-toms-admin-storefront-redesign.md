# TOMS Admin, Storefront, and Traveler Portal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every TOMS Admin, Storefront, and Traveler Portal route on a Base UI shadcn design system backed by validated, purpose-built, coherently seeded read APIs.

**Architecture:** The two UI packages own source shadcn primitives and semantic domain blocks while Next.js Server Components fetch shared Zod-inferred contracts. Elysia routes validate query and response payloads and delegate to resource-specific repositories/services; deterministic database seed data fills every state without placing operational fixtures in pages.

**Tech Stack:** pnpm 10, Turborepo, TypeScript 6 strict, Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn/ui Base UI, TanStack Table, Recharts, Elysia 1.4, Zod 4, Drizzle/PostgreSQL, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-22-toms-admin-storefront-redesign-design.md`

## Global Constraints

- Preserve the canonical `Product -> Departure -> Booking -> Traveler -> Services -> Money -> Experience` lifecycle and existing hold/checkout write commands.
- Raw `input`, `select`, `textarea`, `button`, `table`, checkbox, radio, switch, modal, menu, tooltip, popover, tabs, date picker, command palette, pagination, and status-badge implementations are forbidden in page/feature code when a shadcn primitive exists.
- All forms compose `FieldGroup`, `Field`, labels, descriptions, and errors; destructive actions use `AlertDialog`; Base UI triggers use `render`, never Radix `asChild`.
- Money is integer minor units plus currency; travel dates are ISO dates; event datetimes include an offset.
- Server Components fetch initial data; interactive client components remain leaves; list query state lives in the URL.
- Operational metrics originate in database/fixture APIs. Storefront conversion remains absent until real analytics exists.
- Admin is dense and operational; Storefront is editorial and image-first; Portal is task-oriented. Do not make every block a generic Card.
- Explicitly support 360, 390, 768, 1024, 1280, 1440, 1672, and 1920 pixel widths.

---

### Task 1: Base UI shadcn foundations and package decomposition

**Files:**
- Create: `packages/admin-ui/components.json`
- Create: `packages/admin-ui/src/lib/utils.ts`
- Create: `packages/admin-ui/src/components/ui/*.tsx`
- Create: `packages/admin-ui/src/components/{navigation,data-table,feedback,status,forms}/*.tsx`
- Create: `packages/admin-ui/src/blocks/{dashboard,operations,finance,crm}/*.tsx`
- Modify: `packages/admin-ui/src/index.tsx`
- Modify: `packages/admin-ui/package.json`
- Create: `packages/storefront-ui/components.json`
- Create: `packages/storefront-ui/src/lib/utils.ts`
- Create: `packages/storefront-ui/src/components/ui/*.tsx`
- Create: `packages/storefront-ui/src/components/{navigation,tour,destination,booking,portal}/*.tsx`
- Create: `packages/storefront-ui/src/blocks/{hero,search,gallery,featured-tours,destinations,promotions,trust,editorial,checkout}/*.tsx`
- Modify: `packages/storefront-ui/src/index.tsx`
- Modify: `packages/storefront-ui/package.json`
- Modify: `apps/admin/app/globals.css`
- Modify: `apps/storefront/app/globals.css`
- Test: `packages/admin-ui/src/components.test.tsx`
- Test: `packages/storefront-ui/src/components.test.tsx`

**Interfaces:**
- Produces: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Field*`, `Card*`, `Badge`, `Table*`, `Progress`, `Alert*`, `Skeleton`, `Separator`, `ScrollArea`, `Tabs*`, `Accordion*`, `Dialog*`, `Sheet*`, `DropdownMenu*`, `Command*`, `Sidebar*`, `Chart*`, `Pagination*`, `Avatar*`, and semantic TOMS blocks.

- [ ] **Step 1: Add failing export and accessibility tests** that import the required primitives and render labelled Field, Dialog title, Avatar fallback, table header, and mobile Sheet composition.
- [ ] **Step 2: Run `pnpm --filter @toms/admin-ui test && pnpm --filter @toms/storefront-ui test`** and confirm missing exports fail.
- [ ] **Step 3: Initialize Base Nova shadcn metadata and install components through `pnpm dlx shadcn@latest`**, after running `info`, `search`, and `docs` for the installed component set.
- [ ] **Step 4: Normalize generated imports, dependencies, semantic tokens, icon usage, and Base UI `render` composition** into each UI package.
- [ ] **Step 5: Split monolithic indexes into focused files and explicit exports**, preserving public component names required by existing callers until route migration completes.
- [ ] **Step 6: Run focused tests, lint, and typecheck** and keep both packages green.
- [ ] **Step 7: Commit** with `feat(ui): establish TOMS shadcn foundations`.

### Task 2: Shared runtime response contracts and deterministic data

**Files:**
- Create: `packages/contracts/src/common.ts`
- Create: `packages/contracts/src/admin.ts`
- Create: `packages/contracts/src/storefront.ts`
- Create: `packages/contracts/src/traveler.ts`
- Modify: `packages/contracts/src/index.ts`
- Modify: `packages/contracts/src/contracts.test.ts`
- Modify: `supabase/seed.sql`

**Interfaces:**
- Produces: `moneySchema`, `pageSchema`, generic `listResponseSchema`, all Admin/Storefront/Traveler query and response schemas, and inferred DTO types.
- Collection query: `{ page, pageSize, q?, sort?, order?, status?, from?, to? }`.
- Dashboard response: `{ period, metrics, trend, departureHealth, risks, upcomingDepartures, recentBookings }`.

- [ ] **Step 1: Write failing schema tests** for minor-unit money, page metadata, dashboard dated trend, resource-specific states, Storefront bootstrap/home separation, rich tour/departure payloads, and traveler readiness/actions.
- [ ] **Step 2: Run `pnpm --filter @toms/contracts test`** and confirm the new imports fail.
- [ ] **Step 3: Implement focused Zod schema modules** and export inferred types without duplicating handwritten DTOs.
- [ ] **Step 4: Run contract tests and typecheck** and confirm invalid float/date/state payloads are rejected.
- [ ] **Step 5: Expand deterministic SQL seed data** to at least 6 tours, 16 departures, 48 bookings, 96 travelers, customers, mixed invoices/payments/documents, conversations/messages, supplier/operations states, promotions, CMS pages, and Storefront draft/published releases.
- [ ] **Step 6: Add seed integrity assertions** for counts, cross-links, and mixed warning/overdue/missing/sold-out/cancelled states.
- [ ] **Step 7: Commit** with `feat(contracts): define redesign read models`.

### Task 3: Purpose-built Elysia read APIs

**Files:**
- Modify: `apps/api/src/services.ts`
- Modify: `apps/api/src/production-services.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/modules/dashboard/*`
- Modify: `apps/api/src/modules/backoffice/*`
- Modify: `apps/api/src/modules/storefront/*`
- Modify: `apps/api/src/modules/traveler/*`
- Modify: `apps/api/src/modules/tours/*`
- Modify: `apps/api/src/modules/departures/*`
- Create: `apps/api/src/modules/operations/*`
- Create: `apps/api/src/modules/content/*`
- Test: `apps/api/src/app.test.ts`

**Interfaces:**
- Consumes: shared schemas from Task 2.
- Produces: the complete `/api/v1/admin/*`, `/api/v1/storefront/*`, and `/api/v1/me/*` read map in the design spec while preserving booking-hold and checkout commands.

- [ ] **Step 1: Add failing HTTP tests** for dashboard response dates, collection query pagination/facets, Storefront bootstrap/home/tour/destination/departure separation, traveler dashboard/documents/payments/messages/profile, and OpenAPI response schemas.
- [ ] **Step 2: Run `pnpm --filter @toms/api test`** and verify the new routes return 404 or fail the expected contract.
- [ ] **Step 3: Replace generic `backoffice.list` with resource-specific service methods and repository projections**, sharing only pagination/query parsing.
- [ ] **Step 4: Split Storefront repository reads** so catalog/detail/departure APIs do not load bootstrap or filter featured tours in memory.
- [ ] **Step 5: Expand traveler projections** with authorization-preserving dashboard, timeline, documents, payments, messages, and profile endpoints.
- [ ] **Step 6: Attach shared Zod query/response schemas to Elysia routes** so `/openapi/json` documents the contracts.
- [ ] **Step 7: Run API tests, strict typecheck, and OpenAPI validation**.
- [ ] **Step 8: Commit** with `feat(api): add purpose-built redesign read models`.

### Task 4: Admin shell, auth, dashboard, and server-driven lists

**Files:**
- Modify: `apps/admin/app/layout.tsx`
- Modify: `apps/admin/app/page.tsx`
- Modify: `apps/admin/app/admin/{login,forgot-password,reset-password}/page.tsx`
- Modify: `apps/admin/app/{bookings,tours,departures,customers,travelers,documents,payments,invoices,promotions}/page.tsx`
- Modify: `apps/admin/components/admin-route-frame.tsx`
- Replace: `apps/admin/components/backoffice-tables.tsx`
- Modify: `apps/admin/components/dashboard-section.tsx`
- Create: `apps/admin/components/admin-data-table.tsx`
- Create: `apps/admin/components/admin-filters.tsx`
- Modify: `apps/admin/lib/api.ts`
- Test: `apps/admin/components/*.test.tsx`

**Interfaces:**
- Consumes: typed Admin contracts and `@toms/admin-ui` primitives.
- Produces: shadcn Sidebar/Command shell, cohesive auth family, real dashboard, and URL-driven paged domain tables.

- [ ] **Step 1: Write failing component tests** for Command-K, accessible mobile Sidebar Sheet, Field-based auth forms, dashboard trend labels/risk links, and URL query serialization.
- [ ] **Step 2: Run Admin focused tests** and verify legacy raw controls fail the audit assertions.
- [ ] **Step 3: Implement the Admin shell and auth family** using Sidebar, Command/Dialog, DropdownMenu, Button, Checkbox, and Field primitives.
- [ ] **Step 4: Implement dashboard blocks** with dated Recharts axes/tooltips, departure health, actionable risks, upcoming departures, and recent bookings.
- [ ] **Step 5: Implement domain list pages** with server query parameters, summary strips, filters, sort, pagination, rich cells, row menus, loading/empty/error states, and horizontal mobile ScrollArea.
- [ ] **Step 6: Run focused tests, raw primitive audit, lint, and typecheck**.
- [ ] **Step 7: Commit** with `feat(admin): rebuild shell dashboard and lists`.

### Task 5: Admin specialist workspaces and editors

**Files:**
- Modify: `apps/admin/app/tours/new/page.tsx`
- Modify: `apps/admin/app/tours/[id]/page.tsx`
- Modify: `apps/admin/app/departures/new/page.tsx`
- Create: `apps/admin/app/departures/[id]/page.tsx`
- Modify: `apps/admin/app/{operations,manifest,conversations,reports,cms,storefront,settings}/page.tsx`
- Modify: `apps/admin/components/{tour-form,departure-form,tour-publish-actions,workspace-sections}.tsx`
- Create: `apps/admin/components/{conversation-workspace,operations-workspace,manifest-workspace,cms-editor,storefront-manager,settings-workspace}.tsx`

**Interfaces:**
- Produces: multi-section tour/departure editors; departure detail/readiness; three-pane conversations; operations/manifest; reporting; CMS; visual Storefront manager; structured settings.

- [ ] **Step 1: Write failing behavior tests** for Field composition, tabs/readiness, inbox keyboard navigation, CMS block ordering, settings tabs, and destructive confirmation.
- [ ] **Step 2: Run focused tests** and confirm the legacy generic panels fail expected semantics.
- [ ] **Step 3: Migrate editors and publish actions** to Field, Tabs, Sheet, Alert, AlertDialog, and loading Button composition.
- [ ] **Step 4: Build each specialist workspace** against its purpose-built read model; do not reuse generic resource tables for conversations or operations.
- [ ] **Step 5: Add route loading/empty/error/permission states and responsive collapse rules**.
- [ ] **Step 6: Run Admin tests, lint, typecheck, and raw primitive audit**.
- [ ] **Step 7: Commit** with `feat(admin): build operational workspaces`.

### Task 6: Storefront commerce redesign

**Files:**
- Modify: `apps/storefront/app/layout.tsx`
- Modify: `apps/storefront/app/page.tsx`
- Modify: `apps/storefront/app/tours/page.tsx`
- Modify: `apps/storefront/app/tours/[slug]/page.tsx`
- Create: `apps/storefront/app/destinations/page.tsx`
- Create: `apps/storefront/app/destinations/[slug]/page.tsx`
- Modify: `apps/storefront/app/departures/[id]/page.tsx`
- Modify: `apps/storefront/app/promotions/page.tsx`
- Modify: `apps/storefront/app/[page]/page.tsx`
- Modify: `apps/storefront/app/checkout/[departureId]/page.tsx`
- Modify: `apps/storefront/app/booking/confirmation/[id]/page.tsx`
- Modify: `apps/storefront/app/login/page.tsx`
- Modify: `apps/storefront/components/{tour-explorer,checkout-form}.tsx`
- Modify: `apps/storefront/lib/api.ts`

**Interfaces:**
- Consumes: typed Storefront contracts and Storefront UI blocks.
- Produces: global navigation/footer, home composition, catalog/filtering, rich tour/destination/departure/CMS pages, authoritative hold-based checkout, confirmation, and auth.

- [ ] **Step 1: Add failing Storefront tests** for typed home rendering, filter URL state, itinerary Accordion, gallery alt text, exact departure availability, checkout Field semantics, and canonical confirmation links.
- [ ] **Step 2: Run focused tests** and confirm missing contracts/routes fail.
- [ ] **Step 3: Rebuild the shell and Home** with cinematic hero, overlay search, trust, featured journeys/destinations, editorial promotion, story, final CTA, and rich footer.
- [ ] **Step 4: Rebuild listing/detail/destination/departure/promotion/CMS pages** using normalized image-led Storefront blocks and shadcn controls.
- [ ] **Step 5: Rebuild checkout and confirmation** while retaining server-authoritative inventory hold and payment session behavior.
- [ ] **Step 6: Verify mobile sticky actions, keyboard/focus behavior, reduced motion, loading/empty/error states, and SEO metadata**.
- [ ] **Step 7: Commit** with `feat(storefront): rebuild discovery and checkout`.

### Task 7: Traveler Portal and canonical redirects

**Files:**
- Modify: `apps/storefront/app/account/page.tsx`
- Modify: `apps/storefront/app/account/trips/page.tsx`
- Modify: `apps/storefront/app/account/trips/[id]/page.tsx`
- Modify: `apps/storefront/app/account/trips/[id]/{documents,payments}/page.tsx`
- Modify: `apps/storefront/app/account/{messages,profile}/page.tsx`
- Modify: `apps/storefront/app/trips/page.tsx`
- Modify: `apps/storefront/app/trips/[id]/page.tsx`
- Modify: `apps/storefront/app/booking-confirmation/[id]/page.tsx`
- Create: `apps/storefront/components/portal-shell.tsx`

**Interfaces:**
- Produces: portal home, photographic upcoming/past trips, trip readiness/timeline, document and payment workspaces, messages, profile, and redirects from legacy routes.

- [ ] **Step 1: Add failing route/component tests** for required actions, countdown, mixed document/payment states, message composer, profile Fields, and redirect targets.
- [ ] **Step 2: Run focused tests** and verify the legacy duplicate implementations fail redirect expectations.
- [ ] **Step 3: Build the Portal shell and pages** from traveler read models with practical hierarchy and no marketing-only filler.
- [ ] **Step 4: Replace legacy `/trips` and `/booking-confirmation` pages with permanent canonical redirects**.
- [ ] **Step 5: Verify authenticated error/permission states and responsive behavior**.
- [ ] **Step 6: Commit** with `feat(portal): rebuild traveler experience`.

### Task 8: Visual regression and release gates

**Files:**
- Modify: `e2e/toms.spec.ts`
- Modify: `e2e/mobile.spec.ts`
- Create: `e2e/visual.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `README.md`

**Interfaces:**
- Produces: deterministic flow/accessibility/visual coverage and documented local verification.

- [ ] **Step 1: Add Playwright route matrices** covering every meaningful Admin, Storefront, and Portal route/state at the required viewport widths.
- [ ] **Step 2: Add deterministic screenshot assertions and Axe checks** with seeded authentication fixtures and stable clocks/animations.
- [ ] **Step 3: Run the raw interactive primitive audit** with `rg -n --glob '*.tsx' '<(input|select|textarea|button|table)(\\s|>)' apps packages` and resolve feature/page violations.
- [ ] **Step 4: Run `pnpm lint`**, read the complete output, and fix all errors.
- [ ] **Step 5: Run `pnpm typecheck`**, read the complete output, and fix all errors.
- [ ] **Step 6: Run `pnpm test`**, read the complete output, and fix all failures.
- [ ] **Step 7: Run `pnpm build`**, read the complete output, and fix all production-build failures.
- [ ] **Step 8: Fetch `/openapi/json` in the API test harness and validate required paths/schemas**.
- [ ] **Step 9: Run `pnpm e2e` and visual screenshot coverage**, inspect representative desktop/mobile screenshots against the design spec, and repair fidelity/accessibility/responsive defects.
- [ ] **Step 10: Commit** with `test: verify redesigned TOMS surfaces`.

