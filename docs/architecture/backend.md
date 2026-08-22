# Backend module guide

TOMS backend features follow one traceable direction:

```text
HTTP route → application service → repository → Drizzle → PostgreSQL
```

- Route files parse HTTP input, validate authentication, select locale/host context, and shape the response.
- Service files enforce permissions, own transaction boundaries, write audit/outbox records, and translate domain failures into typed API errors.
- Repository files contain tenant-scoped Drizzle queries and explicit SQL only where locking or PostgreSQL security semantics require it.
- `packages/db/src/schema` is the schema source of truth. `supabase/drizzle` contains generated and reviewed migrations.

Tour logic is under `apps/api/src/modules/tours`; departures, booking holds/checkout, storefront discovery, traveler trips, dashboard reporting, and explicit back-office collections use the same convention.

Protected requests must never accept a tenant ID from the browser as authority. `identity.service.ts` resolves exactly one active membership from the verified Supabase token. `withUserRlsContext` then sets the authenticated PostgreSQL role and verified JWT claims locally for the transaction.

Errors use `{ error: { code, message, requestId } }`. Public responses never include stack traces. Idempotent mutations require `Idempotency-Key`; authoritative booking/payment success must come from database/provider truth.
