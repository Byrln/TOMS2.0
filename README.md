# TOMS

Travel Operations OS and Storefront Commerce Platform. This repository contains the internal operations application, the public booking storefront, the traveler portal, the API, background workers, shared domain packages, and the Supabase database contract.

## Requirements

- Node.js 22 or newer
- pnpm 10.17.1
- Docker Desktop and the Supabase CLI for local database work

## Start locally

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

The local applications run at:

- Admin: `http://localhost:3000`
- Storefront and traveler portal: `http://localhost:3001`
- API: `http://localhost:4000`

`TOMS_DEMO_MODE=1` uses the deterministic in-memory acceptance repository. Set it to `0` only after adding a rotated server-only Supabase secret and wiring the production repository adapter. Never expose `SUPABASE_SECRET_KEY` to a browser bundle.

## Database

```powershell
pnpm supabase start
pnpm supabase db reset
```

The migrations create the canonical product, departure, booking, traveler, supplier, finance, communication, storefront, CMS, promotion, loyalty, audit, and outbox domains. Every application table has RLS enabled. Traveler access requires both a verified email identity and an explicit booking relationship; a booking identifier alone never grants access.

## Quality gates

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

The Playwright suite covers staff sign-in, admin tour/departure publishing, public discovery and checkout, traveler claim and portal access, itinerary propagation, internal-note redaction, mobile layout, and automated accessibility checks.

## Architecture

- [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md)
- [`docs/architecture/domain-model.md`](docs/architecture/domain-model.md)
- [`docs/architecture/tenancy-and-rls.md`](docs/architecture/tenancy-and-rls.md)
- [`docs/storefront/publishing-model.md`](docs/storefront/publishing-model.md)
- [`docs/payments/payment-architecture.md`](docs/payments/payment-architecture.md)
- [`docs/security/security-model.md`](docs/security/security-model.md)
