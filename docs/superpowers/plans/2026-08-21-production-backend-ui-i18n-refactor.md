# TOMS Production Backend, UI, and i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the prototype execution path with Elysia + Drizzle + PostgreSQL and rebuild every user-facing surface so all UI copy and translatable content work in Mongolian and English.

**Architecture:** Keep the monorepo, domain rules, contracts, Supabase auth/storage, SQL concurrency ideas, outbox, and app boundaries. Add `@toms/db` as the Drizzle source of truth, make Elysia modules the only application API, keep Next.js as an API consumer, and resolve locale through a typed `@toms/i18n` catalog persisted by cookie.

**Tech Stack:** Bun, Elysia 1.4, Drizzle ORM, PostgreSQL/Postgres.js, Supabase Auth/RLS/Storage, Zod, OpenAPI, Next.js 16, React 19, TanStack Query/Form, Base UI/shadcn-style primitives, Vitest, Playwright.

**Spec:** `C:/Users/byrln/.codex/attachments/91b2c8fa-1d35-4ce4-87cc-38a9522ba93f/pasted-text.txt`

## Global Constraints

- No production in-memory repository, demo auth header, generic resource API, generic AdminPage, or runtime-generated table columns.
- Money is integer minor units plus ISO currency; authoritative inventory and confirmation use explicit row locks inside transactions.
- Every tenant-owned table is RLS-protected and server requests execute with verified JWT claims under the authenticated role.
- All visible application copy has typed `mn` and `en` translations; tenant content stores both locales and language choice persists.
- The Admin, Storefront, and Traveler Portal retain their distinct supplied visual languages and meet WCAG 2.2 AA.
- Production migrations are generated and reviewed; `drizzle-kit push` is not the deployment workflow.

---

### Task 1: Drizzle Database Foundation

**Files:** Create `packages/db/**`; modify workspace manifests and migration configuration.

- [ ] Add a failing schema contract test for required tables, status separation, localized fields, tenant indexes, and RLS declarations.
- [ ] Add pinned Drizzle/Postgres dependencies and a pooler-safe client with `prepare: false`.
- [ ] Port enums, tenancy, identity, tours, departures, itinerary, pricing, inventory, bookings, CRM, operations, finance, storefront, CMS, promotions, loyalty, messaging, documents, audit, idempotency, and outbox into focused schema modules.
- [ ] Add `withUserRlsContext` and transaction helpers for explicit locks, claims, and role switching.
- [ ] Generate and validate the initial Drizzle migration; preserve custom security/concurrency SQL.

### Task 2: Modular Elysia Backend

**Files:** Replace `apps/api/src/**`; add feature modules and shared infrastructure.

- [ ] Write failing API tests for health, OpenAPI, JWT rejection, tenant resolution, typed errors, and request IDs.
- [ ] Replace Hono with Elysia plugins for env, database, JWT/JWKS auth, tenant actor, permissions, errors, OpenAPI, logging, and tracing.
- [ ] Implement domain modules using Route → Service → Repository → Drizzle boundaries.
- [ ] Remove `X-Demo-*`, `createDemoRepository`, and `/admin/resources/:resource`.

### Task 3: Database-Backed Commerce Vertical Slice

**Files:** Add Tour, Departure, Itinerary, Inventory, Booking, Storefront, and Worker modules.

- [ ] Write repository and concurrency tests for tenant isolation, capacity-one competing holds, hold expiry, payment confirmation, and idempotency.
- [ ] Implement tour/departure creation, publishing, storefront reads, atomic holds, checkout, authoritative confirmation, traveler claim, and projected itinerary.
- [ ] Persist audit/outbox events in the same transaction and process them idempotently in the worker.
- [ ] Seed realistic bilingual tenant data through PostgreSQL, not runtime arrays.

### Task 4: Typed MN/EN Localization

**Files:** Replace `packages/i18n/src/**`; integrate both Next.js apps and shared UI packages.

- [ ] Write failing tests for typed keys, fallback behavior, interpolation, date/money formatting, content resolution, and locale persistence.
- [ ] Implement typed `mn`/`en` dictionaries and locale resolution from cookie/query/browser preference.
- [ ] Add accessible language switchers to Admin, Storefront, authentication, checkout, confirmation, and Traveler Portal.
- [ ] Replace hardcoded visible copy and localize status labels, validation, loading, empty, error, permission, and success states.

### Task 5: Admin Design System and Entity Screens

**Files:** Replace `packages/admin-ui/**`, `apps/admin/components/**`, and route pages.

- [ ] Add accessible primitive/composite component tests and typed entity column tests.
- [ ] Implement shared tokens, app shell, controls, dialogs/sheets, status/money, tables, timelines, loading/error/empty/permission states.
- [ ] Build entity-specific Dashboard, Tours, Departures, Itinerary, Bookings, Traveler CRM, Customer CRM, Conversations, Operations, Manifest, Finance, Documents, Storefront Admin, CMS, Promotions, Reports, and Settings workflows.
- [ ] Wire every mutation to the API with TanStack Query/Form and server-truth confirmation for authoritative actions.

### Task 6: Storefront and Traveler Portal

**Files:** Replace Storefront and Traveler route/components with typed API workflows.

- [ ] Add bilingual discovery, tour detail, multi-step checkout, confirmation, claim, portal, timeline, documents, payments, messages, and profile tests.
- [ ] Implement URL-backed filters, mobile sheets/sticky CTA, inventory-hold countdown, hosted-payment boundary, and localized content selection.
- [ ] Ensure traveler projections exclude internal notes, costs, margins, and unauthorized bookings.

### Task 7: Documentation and Verification

**Files:** Update README and architecture/backend/design-system documentation; extend CI and Playwright.

- [ ] Validate Drizzle migrations and run database/RLS/inventory integration tests when a database is available.
- [ ] Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- [ ] Run Playwright functional, accessibility, and visual tests at 1440, 1024, and 390 in both locales.
- [ ] Compare current browser captures with supplied reference boards via `view_image`, fix fidelity issues, and report credential/database blockers precisely.
