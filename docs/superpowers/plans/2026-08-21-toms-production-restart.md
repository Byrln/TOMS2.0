# TOMS Production Restart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-oriented TOMS monorepo demonstrating the complete staff-to-storefront-to-traveler vertical flow from one canonical domain.

**Architecture:** Two Next.js applications consume a typed modular API. Supabase is the production authority; an explicitly enabled development adapter supplies deterministic seeded API data when server credentials are absent. Domain transitions, money, inventory holds, RLS, outbox events, and authorization remain outside page components.

**Tech Stack:** Node 22+, pnpm, Turborepo, TypeScript strict, Next.js 16 App Router, React 19, Hono, Supabase, Zod, TanStack Query/Form, Base UI, Tailwind CSS, Lucide, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-21-toms-production-restart-design.md`

## Global Constraints

- Preserve the provided TOMS design boards as visual source of truth.
- Never expose `SUPABASE_SECRET_KEY`, raw payment card data, supplier costs, private notes, or unrelated traveler PII.
- Every tenant-owned table has `tenant_id`, explicit grants, and RLS.
- Public Storefront mutates commerce only through API commands.
- Money uses integer minor units plus ISO currency; FX rates are snapshotted.
- Inventory holds are atomic, expiring, and idempotent.
- Node.js is at least 22 because current Supabase libraries no longer support Node 20.
- All dependency versions are exact and the lockfile is committed.

---

### Task 1: Monorepo and design-system foundation

**Files:** root workspace config; `packages/config`; `packages/admin-ui`; `packages/storefront-ui`; app shells.

**Interfaces:** Produces shared tokens, navigation models, controls, cards, tables, status badges, shells, and workspace scripts.

- [ ] Add failing component/token tests and verify the missing exports fail.
- [ ] Implement focused shared packages and Next.js shells.
- [ ] Verify tests, lint, typecheck, and responsive shell rendering.

### Task 2: Canonical domain and typed contracts

**Files:** `packages/domain/src/*`; `packages/contracts/src/*`.

**Interfaces:** Produces `Money`, `TourDefinition`, `Departure`, `InventoryHold`, `Booking`, pricing and state-transition functions, plus Zod request/response schemas.

- [ ] Write failing tests for pricing, capacity, hold expiry, booking/payment transitions, permissions, and traveler projection.
- [ ] Implement minimal deterministic domain functions.
- [ ] Run the focused tests and full unit suite.

### Task 3: Supabase persistence, RLS and transactional commands

**Files:** `supabase/migrations/*`; `supabase/seed.sql`; `packages/supabase/src/*`; `packages/auth/src/*`.

**Interfaces:** Produces tenant membership checks, staff/traveler access predicates, atomic `create_booking_hold`, booking confirmation, audit and outbox persistence.

- [ ] Create migrations through the Supabase CLI.
- [ ] Define schema, constraints, indexes, explicit grants, RLS policies, storage policies, transactional functions and pgTAP-style security assertions.
- [ ] Add adapters and verify SQL structure plus client-level authorization tests.

### Task 4: Modular API and worker

**Files:** `apps/api/src/*`; `apps/worker/src/*`.

**Interfaces:** Produces `/api/v1/admin/*`, public `/api/v1/storefront/*`, `/api/v1/booking-holds`, `/api/v1/bookings`, and authorized `/api/v1/me/*` endpoints.

- [ ] Write failing endpoint tests for health, catalog, hold, checkout, publish, trip claim and itinerary updates.
- [ ] Implement middleware, repositories, services, idempotency, audit/outbox events, typed errors and seeded development mode.
- [ ] Verify endpoint tests and worker expiry/retry tests.

### Task 5: Admin operational application

**Files:** `apps/admin/app/*`; `apps/admin/components/*`; `packages/admin-ui/src/*`.

**Interfaces:** Produces Dashboard, Tours, Departures, Itinerary Builder, Bookings, CRM, Conversations, Operations, Manifest, Finance, Documents, Storefront, CMS, Promotions, Reports and Settings routes.

- [ ] Write failing UI behavior tests for route registry, table filtering, status presentation and itinerary editing.
- [ ] Implement API-backed route modules in the supplied dense navy/gold design system.
- [ ] Verify desktop/mobile layouts, keyboard navigation and meaningful states.

### Task 6: Storefront commerce and Traveler Portal

**Files:** `apps/storefront/app/*`; `apps/storefront/components/*`; `packages/storefront-ui/src/*`.

**Interfaces:** Produces Home, Tours, Tour Detail, Promotions, Checkout, Confirmation, Claim Trip, My Trips and Trip Detail.

- [ ] Write failing UI and flow tests for catalog rendering, departure selection, checkout state, booking confirmation and traveler-visible itinerary.
- [ ] Implement mobile-first API-backed pages with SEO metadata, structured data and accessible forms.
- [ ] Verify the complete commerce and traveler update flow.

### Task 7: Documentation and release gates

**Files:** `docs/architecture/*`; `docs/security/*`; `docs/storefront/*`; `docs/payments/*`; Playwright configuration/tests.

**Interfaces:** Produces living diagrams, runbooks, security model, publishing/payment documentation and acceptance automation.

- [ ] Add E2E coverage for the staff create/publish, Storefront hold/checkout, claim, My Trips and itinerary update flow.
- [ ] Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and Playwright.
- [ ] Compare browser screenshots against the supplied boards at desktop and mobile sizes and repair fidelity gaps.

