# Security model

## Identity and sessions

- Supabase Auth provides staff password/recovery and traveler magic-link sessions.
- Next.js proxy code refreshes cookie sessions and validates with `getClaims()`; it never trusts `getSession()` as authorization proof.
- Staff claims require tenant ID and role in immutable `app_metadata`, plus an active membership row.
- Traveler access requires verified identity linked to a booking person through `claim_booking`.

## Data protection

- RLS is enabled on all application tables, with explicit `anon`, `authenticated` and `service_role` grants.
- Passport and medical fields are modeled as encrypted values and excluded from broad content roles.
- Staff-only itinerary notes, supplier costs and internal messages never appear in traveler projections.
- Storage buckets separate public media, tenant documents and traveler files.
- Payment/card secrets are not collected by the local checkout; production providers must use hosted/tokenized collection.

## Operational controls

- Atomic database functions protect inventory and booking confirmation from races.
- Idempotency keys protect hold, checkout, payment, refund and outbox processing.
- Audit and outbox tables are append-only to authenticated application users.
- `.env.example` contains only publishable configuration and a rotated-secret placeholder. The original server secret must never be restored to source control.

Remote deployment remains gated on a rotated Supabase server secret, provider secrets and platform security headers/CSP appropriate to the final hostnames.
