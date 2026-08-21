# TOMS Production Restart Design

## Product invariant

TOMS Admin is the internal travel operations control plane, Storefront is the tenant-owned commerce and traveler experience, and the canonical domain is the single source of truth connecting both.

## Architecture

- TypeScript monorepo managed by pnpm and Turborepo.
- Next.js App Router applications for Admin and Storefront.
- Modular Hono API for typed REST boundaries and a separate worker entrypoint.
- Supabase PostgreSQL/Auth/Storage with versioned SQL, explicit grants, RLS, transactional functions, and no browser-visible secret keys.
- Shared packages for canonical domain logic, Zod contracts, auth, payments, Supabase access, analytics, localization, and distinct Admin/Storefront UI systems.
- Production repositories use Supabase. Local development may use a process-local seeded adapter only when `TOMS_DEMO_MODE=1`; both UIs still consume the typed API boundary.

## Canonical lifecycle

`TourDefinition -> Departure -> InventoryHold -> Booking -> BookingParty/Traveler -> Payment/Invoice -> Traveler-visible Itinerary`

Customer/payer and traveler are separate roles. Booking snapshots preserve purchased commercial truth. Itinerary events carry explicit traveler visibility. Payments and refunds are append-only ledger entries. Loyalty is append-only. Public Storefront data comes only from published immutable releases.

## Security model

Every tenant-owned record has `tenant_id`. Staff access requires active tenant membership plus role permissions. Traveler access requires verified identity linkage to a booking party. Public access is limited to published Storefront projections. Sensitive files use private buckets and signed URLs. Important reads and mutations are auditable. Payment card data is never stored.

## Experience

The supplied eight TOMS boards define the visual language: midnight navy navigation, champagne-gold accents, ivory application background, compact professional controls, white surfaces, slate secondary tones, restrained borders/shadows, high information density, and intentional travel photography. Admin stays task-dense; Storefront is image-led and mobile-first; Traveler Portal optimizes certainty and trust.

## Delivery slices

1. Foundation, domain, contracts, migrations, auth and design tokens.
2. Tour/departure/itinerary, inventory, pricing, booking, invoice and payment vertical flow.
3. Admin operations surfaces.
4. Storefront discovery, checkout and confirmation.
5. Traveler claim, My Trips and authoritative itinerary projection.
6. Suppliers, operations, finance, CMS, promotions, reporting and settings.
7. Quality gates, accessibility, responsive behavior, security documentation and deployment readiness.

