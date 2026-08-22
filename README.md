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

Data-backed API routes require `DATABASE_URL`. Staff and traveler authentication use Supabase JWTs; no demo headers or in-memory production repository exist. Never expose `DATABASE_URL`, migration credentials, or Supabase server secrets to a browser bundle.

The UI supports Mongolian (`mn`) and English (`en`). The selected locale is stored in the `toms-locale` cookie and is forwarded to the API for localized content. Author-managed tour, CMS, promotion, and storefront content stores both language variants.

## Database

```powershell
pnpm --filter @toms/db generate
pnpm --filter @toms/db check
pnpm --filter @toms/db migrate
```

Drizzle schema is the source of truth. Generated migrations live in `supabase/drizzle`; custom SQL in the same sequence supplies PostgreSQL functions, grants, and RLS policies. Runtime traffic uses `DATABASE_URL` with prepared statements disabled for Supabase transaction pooling. Prefer `DATABASE_MIGRATION_URL` for migration execution.

The migrations create the canonical product, departure, booking, traveler, supplier, finance, communication, storefront, CMS, promotion, loyalty, audit, and outbox domains. Tenant-owned tables have RLS enabled. Traveler access requires a verified JWT plus an explicit booking-party relationship; a booking identifier alone never grants access.

## Quality gates

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

Unit and HTTP-boundary tests run without external credentials. PostgreSQL/RLS/concurrency and authenticated end-to-end tests require a configured Supabase development project and must not be reported as passing when those credentials are absent.

## Architecture

- [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md)
- [`docs/architecture/domain-model.md`](docs/architecture/domain-model.md)
- [`docs/architecture/tenancy-and-rls.md`](docs/architecture/tenancy-and-rls.md)
- [`docs/storefront/publishing-model.md`](docs/storefront/publishing-model.md)
- [`docs/payments/payment-architecture.md`](docs/payments/payment-architecture.md)
- [`docs/security/security-model.md`](docs/security/security-model.md)
