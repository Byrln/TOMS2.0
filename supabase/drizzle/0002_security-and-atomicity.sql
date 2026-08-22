create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.request_tenant_id()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::uuid
$$;

create or replace function private.is_tenant_member(requested_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tenant_memberships membership
    where membership.tenant_id = requested_tenant_id
      and membership.user_id = auth.uid()
      and membership.status = 'ACTIVE'
  )
$$;

create or replace function private.can_access_booking(requested_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.booking_parties party
    where party.booking_id = requested_booking_id and party.auth_user_id = auth.uid()
  )
$$;

create or replace function private.can_access_person(requested_person_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.people person
    where person.id = requested_person_id and person.auth_user_id = auth.uid()
  ) or exists (
    select 1
    from public.traveler_profiles profile
    join public.booking_parties party on party.traveler_profile_id = profile.id
    where profile.person_id = requested_person_id
      and private.can_access_booking(party.booking_id)
  )
$$;

revoke all on function private.request_tenant_id() from public, anon, authenticated;
revoke all on function private.is_tenant_member(uuid) from public, anon, authenticated;
revoke all on function private.can_access_booking(uuid) from public, anon, authenticated;
revoke all on function private.can_access_person(uuid) from public, anon, authenticated;
grant execute on function private.request_tenant_id() to authenticated;
grant execute on function private.is_tenant_member(uuid) to authenticated;
grant execute on function private.can_access_booking(uuid) to authenticated;
grant execute on function private.can_access_person(uuid) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'audit_logs', 'booking_parties', 'bookings', 'cms_blocks', 'cms_pages',
    'departures', 'documents', 'invoices', 'payment_attempts',
    'payment_webhook_events', 'payments', 'refunds', 'idempotency_keys',
    'customer_accounts', 'organizations', 'people', 'traveler_profiles',
    'inventory_holds', 'itinerary_days', 'itinerary_events', 'loyalty_entries',
    'conversations', 'messages', 'departure_readiness', 'operation_tasks',
    'outbox_events', 'fx_snapshots', 'tour_prices', 'promotion_redemptions',
    'promotions', 'storefront_releases', 'storefronts', 'service_orders',
    'suppliers', 'tenant_domains', 'tenant_memberships', 'tenant_settings',
    'tour_definitions'
  ]
  loop
    execute format('drop policy if exists tenant_isolation on public.%I', table_name);
    execute format(
      'create policy tenant_isolation on public.%I for all to authenticated using (tenant_id = private.request_tenant_id() and private.is_tenant_member(tenant_id)) with check (tenant_id = private.request_tenant_id() and private.is_tenant_member(tenant_id))',
      table_name
    );
  end loop;
end
$$;

drop policy if exists tenant_self_access on public.tenants;
create policy tenant_self_access on public.tenants
for select to authenticated
using (id = private.request_tenant_id() and private.is_tenant_member(id));

drop policy if exists public_active_tenant on public.tenants;
create policy public_active_tenant on public.tenants
for select to anon, authenticated
using (status = 'ACTIVE');

drop policy if exists public_verified_domain on public.tenant_domains;
create policy public_verified_domain on public.tenant_domains
for select to anon, authenticated
using (verified_at is not null);

drop policy if exists public_published_storefront on public.storefronts;
create policy public_published_storefront on public.storefronts
for select to anon, authenticated
using (status = 'PUBLISHED');

drop policy if exists public_published_release on public.storefront_releases;
create policy public_published_release on public.storefront_releases
for select to anon, authenticated
using (status = 'PUBLISHED');

drop policy if exists public_published_tour on public.tour_definitions;
create policy public_published_tour on public.tour_definitions
for select to anon, authenticated
using (status = 'PUBLISHED');

drop policy if exists public_open_departure on public.departures;
create policy public_open_departure on public.departures
for select to anon, authenticated
using (
  status in ('OPEN', 'GUARANTEED')
  and exists (
    select 1 from public.tour_definitions tour
    where tour.id = departures.tour_id and tour.status = 'PUBLISHED'
  )
);

drop policy if exists public_tour_price on public.tour_prices;
create policy public_tour_price on public.tour_prices
for select to anon, authenticated
using (
  exists (
    select 1 from public.tour_definitions tour
    where tour.id = tour_prices.tour_id and tour.status = 'PUBLISHED'
  )
);

drop policy if exists public_itinerary_day on public.itinerary_days;
create policy public_itinerary_day on public.itinerary_days
for select to anon, authenticated
using (
  exists (
    select 1
    from public.departures departure
    join public.tour_definitions tour on tour.id = departure.tour_id
    where departure.id = itinerary_days.departure_id
      and departure.status in ('OPEN', 'GUARANTEED')
      and tour.status = 'PUBLISHED'
  )
);

drop policy if exists public_itinerary_event on public.itinerary_events;
create policy public_itinerary_event on public.itinerary_events
for select to anon, authenticated
using (
  visibility = 'PUBLIC'
  and exists (
    select 1
    from public.itinerary_days day
    join public.departures departure on departure.id = day.departure_id
    join public.tour_definitions tour on tour.id = departure.tour_id
    where day.id = itinerary_events.itinerary_day_id
      and departure.status in ('OPEN', 'GUARANTEED')
      and tour.status = 'PUBLISHED'
  )
);

drop policy if exists traveler_booking_party on public.booking_parties;
create policy traveler_booking_party on public.booking_parties
for select to authenticated
using (private.can_access_booking(booking_id));

drop policy if exists traveler_booking on public.bookings;
create policy traveler_booking on public.bookings
for select to authenticated
using (
  private.can_access_booking(id)
);

drop policy if exists traveler_person_self on public.people;
create policy traveler_person_self on public.people
for select to authenticated
using (private.can_access_person(id));

drop policy if exists traveler_profile_self on public.traveler_profiles;
create policy traveler_profile_self on public.traveler_profiles
for select to authenticated
using (private.can_access_person(person_id));

drop policy if exists traveler_itinerary on public.itinerary_events;
create policy traveler_itinerary on public.itinerary_events
for select to authenticated
using (
  visibility in ('PUBLIC', 'BOOKED_TRAVELER', 'BOOKING_ORGANIZER')
  and exists (
    select 1
    from public.bookings booking
    where booking.departure_id = itinerary_events.departure_id
      and private.can_access_booking(booking.id)
      and booking.status = 'CONFIRMED'
  )
);

drop policy if exists traveler_invoice on public.invoices;
create policy traveler_invoice on public.invoices
for select to authenticated
using (
  private.can_access_booking(booking_id)
);

drop policy if exists traveler_payment on public.payments;
create policy traveler_payment on public.payments
for select to authenticated
using (
  private.can_access_booking(booking_id)
);

drop policy if exists traveler_document on public.documents;
create policy traveler_document on public.documents
for select to authenticated
using (
  visibility in ('PUBLIC', 'TRAVELER')
  and (
    private.can_access_booking(booking_id)
    or exists (
      select 1
      from public.traveler_profiles profile
      join public.people person on person.id = profile.person_id
      where profile.id = documents.traveler_profile_id and person.auth_user_id = auth.uid()
    )
  )
);

create or replace function public.claim_booking(target_booking uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  verified_email text;
  organizer_person_id uuid;
begin
  verified_email := lower(nullif(auth.jwt() ->> 'email', ''));
  if auth.uid() is null or verified_email is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  select booking.organizer_person_id into organizer_person_id
  from public.bookings booking
  where booking.id = target_booking
    and lower(booking.organizer_email) = verified_email
    and booking.status in ('ON_HOLD', 'CONFIRMED');
  if organizer_person_id is null then
    return false;
  end if;

  update public.booking_parties
  set auth_user_id = auth.uid(), updated_at = now()
  where booking_id = target_booking and is_organizer = true;

  update public.people
  set auth_user_id = auth.uid(), updated_at = now()
  where id = organizer_person_id and (auth_user_id is null or auth_user_id = auth.uid());

  return true;
end
$$;

revoke all on function public.claim_booking(uuid) from public, anon;
grant execute on function public.claim_booking(uuid) to authenticated;

drop policy if exists public_active_promotion on public.promotions;
create policy public_active_promotion on public.promotions
for select to anon
using (
  status = 'ACTIVE'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

grant usage on schema public to anon, authenticated;
grant select on public.tenants, public.tenant_domains, public.storefronts,
  public.storefront_releases, public.tour_definitions, public.departures,
  public.tour_prices, public.itinerary_days, public.itinerary_events,
  public.promotions to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke update, delete on public.audit_logs, public.outbox_events, public.idempotency_keys from authenticated;

create or replace function public.reserve_inventory(
  requested_tenant_id uuid,
  requested_departure_id uuid,
  requested_quantity integer,
  requested_expires_at timestamptz,
  requested_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_hold_id uuid;
  new_hold_id uuid;
  departure_capacity integer;
  departure_confirmed integer;
  departure_held integer;
  released_quantity integer;
begin
  if requested_quantity <= 0 or requested_quantity > 50 then
    raise exception 'INVALID_HOLD_QUANTITY' using errcode = '22023';
  end if;
  if requested_expires_at <= now() or requested_expires_at > now() + interval '30 minutes' then
    raise exception 'INVALID_HOLD_EXPIRY' using errcode = '22023';
  end if;

  select hold.id into existing_hold_id
  from public.inventory_holds hold
  where hold.tenant_id = requested_tenant_id
    and hold.idempotency_key = requested_idempotency_key;
  if existing_hold_id is not null then
    return existing_hold_id;
  end if;

  select departure.capacity, departure.confirmed_count, departure.held_count
    into departure_capacity, departure_confirmed, departure_held
  from public.departures departure
  join public.tour_definitions tour on tour.id = departure.tour_id
  where departure.id = requested_departure_id
    and departure.tenant_id = requested_tenant_id
    and departure.status in ('OPEN', 'GUARANTEED')
    and tour.status = 'PUBLISHED'
  for update of departure;

  if not found then
    raise exception 'DEPARTURE_NOT_AVAILABLE' using errcode = 'P0002';
  end if;

  with expired as (
    update public.inventory_holds hold
    set status = 'EXPIRED', updated_at = now()
    where hold.tenant_id = requested_tenant_id
      and hold.departure_id = requested_departure_id
      and hold.status = 'ACTIVE'
      and hold.expires_at <= now()
    returning hold.quantity
  )
  select coalesce(sum(quantity), 0)::integer into released_quantity from expired;

  departure_held := greatest(0, departure_held - released_quantity);
  if departure_capacity - departure_confirmed - departure_held < requested_quantity then
    raise exception 'INSUFFICIENT_INVENTORY' using errcode = 'P0001';
  end if;

  insert into public.inventory_holds (
    tenant_id, departure_id, idempotency_key, quantity, status, expires_at
  ) values (
    requested_tenant_id, requested_departure_id, requested_idempotency_key,
    requested_quantity, 'ACTIVE', requested_expires_at
  ) returning id into new_hold_id;

  update public.departures
  set held_count = departure_held + requested_quantity, updated_at = now()
  where id = requested_departure_id;

  return new_hold_id;
end
$$;

create or replace function public.consume_inventory_hold(
  requested_tenant_id uuid,
  requested_hold_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  hold_departure_id uuid;
  hold_quantity integer;
begin
  select hold.departure_id, hold.quantity
    into hold_departure_id, hold_quantity
  from public.inventory_holds hold
  where hold.id = requested_hold_id
    and hold.tenant_id = requested_tenant_id
    and hold.status = 'ACTIVE'
    and hold.expires_at > now()
  for update;

  if not found then
    raise exception 'HOLD_NOT_ACTIVE' using errcode = 'P0002';
  end if;

  update public.departures
  set held_count = greatest(0, held_count - hold_quantity),
      confirmed_count = confirmed_count + hold_quantity,
      updated_at = now()
  where id = hold_departure_id and tenant_id = requested_tenant_id;

  update public.inventory_holds
  set status = 'CONSUMED', consumed_at = now(), updated_at = now()
  where id = requested_hold_id;

  return hold_quantity;
end
$$;

revoke all on function public.reserve_inventory(uuid, uuid, integer, timestamptz, text) from public;
revoke all on function public.consume_inventory_hold(uuid, uuid) from public;
grant execute on function public.reserve_inventory(uuid, uuid, integer, timestamptz, text) to anon, authenticated;
