# TOMS Admin, Storefront, and Traveler Portal Redesign

## Product boundary

TOMS remains one travel lifecycle: `Product -> Departure -> Booking -> Traveler -> Services -> Money -> Experience`. Admin is the operational command center, Storefront is the premium travel-commerce surface, and Traveler Portal is the post-booking certainty and service surface. Existing authoritative booking-hold and checkout commands remain intact; the redesign adds purpose-built read models around them.

## Shared visual language

- Midnight navy navigation, warm ivory backgrounds, clean white operational surfaces, champagne-gold accent, restrained semantic status colors, compact radii, and low-contrast cool borders.
- Admin uses dense sans typography, tabular numerals, rich tables, charts, risk/readiness indicators, split views, sheets, and compact controls.
- Storefront uses an editorial serif for display, a clean sans for UI, cinematic local travel photography, asymmetric image-led blocks, generous whitespace, and a mobile-first commerce hierarchy.
- Traveler Portal retains the Storefront identity but makes required actions, countdown, documents, payments, itinerary, and messages immediately legible.
- Motion is restrained, transform/opacity based, and disabled by reduced-motion preferences.

## Component architecture

`@toms/admin-ui` and `@toms/storefront-ui` become source-based Base UI shadcn systems. Each owns semantic primitives under `components/ui`, focused domain components, blocks, utilities, and explicit exports. Page and feature code may use semantic structural HTML but must not hand-build interactive controls for which a shadcn primitive exists. Forms use `FieldGroup`/`Field`; collections use `Table`/server-driven `DataTable`; destructive actions use `AlertDialog`; overlays keep Base UI focus management.

The application stylesheets own the semantic theme variables consumed by shadcn. Admin and Storefront share the TOMS palette but use different density and type scales. Tailwind v4 scans both UI packages. The UI packages remain independent so operational density cannot drift into the editorial Storefront.

## Data and API architecture

Shared Zod request and response contracts live in `@toms/contracts` and export inferred TypeScript types. Collections return `{ items, page, summary?, facets? }`. Money always crosses the boundary as integer minor units plus an ISO currency. Travel dates are ISO dates; events are offset-aware ISO datetimes. Booking, payment, departure, readiness, document, and reconciliation states remain distinct.

Production services use query-specific repositories; Storefront tour listing never filters bootstrap in memory. Development and visual tests use deterministic, cross-linked seeded data with mixed successful and at-risk states. Existing atomic `POST /api/v1/booking-holds` and `POST /api/v1/checkout/sessions` behavior remains authoritative.

Admin read models cover dashboard, tours, departures/readiness/manifest, operations, bookings, customers, travelers, documents, conversations/messages, payments, invoices, promotions, reports, CMS, Storefront configuration, and settings. Storefront read models split bootstrap, home, tour listing/detail, destinations, departure/availability/checkout context, promotions, and CMS pages. Traveler read models cover identity, dashboard, trips, trip timeline/documents/payments, messages, and profile.

## Route experience

Admin migrates dashboard, bookings, tours/new/detail, departures/new/detail/readiness, operations, manifest, customers, travelers, conversations, documents, payments, invoices, promotions, reports, CMS, Storefront manager, settings, login, recovery, and reset. Generic list projections are replaced by domain columns, summary strips, server query state, filters, sort, pagination, actions, and specialist workspaces.

Storefront migrates home, tours, tour detail, destinations, destination detail, departure detail, promotions, About, Contact, CMS pages, checkout, confirmation, and login. The complete discovery-to-checkout path remains connected. Traveler Portal migrates account home, trips, trip detail, documents, payments, messages, and profile. Legacy trip and confirmation URLs redirect to canonical routes.

## Rendering, states, and accessibility

Next.js Server Components perform initial reads and pass minimal serializable data to interactive leaf components. URL search parameters are the source of truth for list query state. Every application supplies route-level loading, error, empty, permission, and not-found states. Keyboard navigation, visible focus, semantic headings, labelled fields, useful alt text, reduced motion, and sufficient contrast are required.

## Verification

Acceptance requires shared contract tests, route/service tests, component tests, a raw-interactive-primitive audit, valid generated OpenAPI, lint, strict typecheck, unit tests, production builds, Playwright user flows, accessibility checks, and deterministic screenshots at 360, 390, 768, 1024, 1280, 1440, 1672, and 1920 pixels. Operational values must originate in API fixtures or the database, never in page components.

