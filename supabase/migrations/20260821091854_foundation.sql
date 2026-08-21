create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.staff_role as enum ('OWNER', 'ADMIN', 'SALES', 'OPERATIONS', 'FINANCE', 'CONTENT', 'GUIDE', 'VIEWER');
create type public.membership_status as enum ('INVITED', 'ACTIVE', 'SUSPENDED');
create type public.tour_status as enum ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
create type public.departure_status as enum ('DRAFT', 'OPEN', 'GUARANTEED', 'SOLD_OUT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type public.booking_status as enum ('DRAFT', 'HELD', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
create type public.hold_status as enum ('ACTIVE', 'CONSUMED', 'EXPIRED', 'RELEASED');
create type public.payment_status as enum ('PENDING', 'AUTHORIZED', 'SUCCEEDED', 'FAILED', 'REFUNDED');
create type public.payment_kind as enum ('CHARGE', 'REFUND', 'CREDIT');
create type public.document_visibility as enum ('STAFF', 'TRAVELER', 'PUBLIC');
create type public.itinerary_visibility as enum ('STAFF', 'TRAVELER');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  legal_name text,
  default_currency char(3) not null default 'MNT',
  default_locale text not null default 'mn-MN',
  timezone text not null default 'Asia/Ulaanbaatar',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.staff_role not null,
  status public.membership_status not null default 'INVITED',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  hostname text not null unique,
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  theme jsonb not null default '{}'::jsonb,
  localization jsonb not null default '{}'::jsonb,
  security jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  nationality char(2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (tenant_id, email)
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  registration_number text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.customer_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  lifecycle_stage text not null default 'CUSTOMER',
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(person_id, organization_id) = 1)
);

create table public.traveler_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  date_of_birth date,
  passport_number_encrypted text,
  passport_expires_on date,
  dietary_requirements text,
  medical_notes_encrypted text,
  created_at timestamptz not null default now(),
  unique (tenant_id, person_id)
);

create table public.tour_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  summary text not null,
  description text not null,
  duration_days integer not null check (duration_days > 0),
  duration_nights integer not null check (duration_nights >= 0),
  base_price_minor bigint not null check (base_price_minor >= 0),
  currency char(3) not null,
  status public.tour_status not null default 'DRAFT',
  destinations text[] not null default '{}',
  hero_image_url text,
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  version integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table public.departures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tour_id uuid not null references public.tour_definitions(id) on delete restrict,
  code text not null,
  starts_on date not null,
  ends_on date not null,
  booking_deadline timestamptz,
  capacity integer not null check (capacity > 0),
  confirmed_count integer not null default 0 check (confirmed_count >= 0 and confirmed_count <= capacity),
  price_minor bigint not null check (price_minor >= 0),
  currency char(3) not null,
  status public.departure_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (tenant_id, code)
);

create table public.itinerary_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  departure_id uuid not null references public.departures(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  event_type text not null,
  title text not null,
  location text,
  traveler_details text,
  internal_notes text,
  visibility public.itinerary_visibility not null default 'STAFF',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.inventory_holds (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  departure_id uuid not null references public.departures(id) on delete cascade,
  party_size integer not null check (party_size > 0),
  status public.hold_status not null default 'ACTIVE',
  idempotency_key text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create index inventory_holds_active_idx on public.inventory_holds (departure_id, expires_at) where status = 'ACTIVE';

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_number text not null,
  departure_id uuid not null references public.departures(id) on delete restrict,
  customer_account_id uuid references public.customer_accounts(id) on delete set null,
  payer_person_id uuid references public.people(id) on delete set null,
  organizer_person_id uuid references public.people(id) on delete set null,
  hold_id uuid references public.inventory_holds(id) on delete set null,
  party_size integer not null check (party_size > 0),
  status public.booking_status not null default 'DRAFT',
  currency char(3) not null,
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  commercial_snapshot jsonb not null,
  idempotency_key text not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, booking_number),
  unique (tenant_id, idempotency_key),
  check (subtotal_minor - discount_minor = total_minor)
);

create table public.booking_parties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  traveler_profile_id uuid not null references public.traveler_profiles(id) on delete restrict,
  relationship text not null default 'TRAVELER',
  room_preference text,
  created_at timestamptz not null default now(),
  unique (booking_id, traveler_profile_id)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete restrict,
  invoice_number text not null,
  currency char(3) not null,
  total_minor bigint not null check (total_minor >= 0),
  amount_paid_minor bigint not null default 0 check (amount_paid_minor >= 0),
  due_at timestamptz,
  issued_at timestamptz not null default now(),
  unique (tenant_id, invoice_number)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete set null,
  provider text not null,
  provider_reference text,
  kind public.payment_kind not null default 'CHARGE',
  status public.payment_status not null default 'PENDING',
  currency char(3) not null,
  amount_minor bigint not null check (amount_minor >= 0),
  fx_snapshot jsonb,
  idempotency_key text not null,
  occurred_at timestamptz not null default now(),
  unique (tenant_id, provider, idempotency_key)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  supplier_type text not null,
  email text,
  phone text,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);

create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  departure_id uuid not null references public.departures(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  itinerary_event_id uuid references public.itinerary_events(id) on delete set null,
  service_type text not null,
  status text not null default 'REQUESTED',
  quantity integer not null default 1 check (quantity > 0),
  supplier_cost_minor bigint check (supplier_cost_minor >= 0),
  currency char(3),
  internal_notes text,
  created_at timestamptz not null default now()
);

create table public.storefronts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'DRAFT',
  template_key text not null default 'himalaya',
  theme jsonb not null default '{}'::jsonb,
  navigation jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table public.storefront_releases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  storefront_id uuid not null references public.storefronts(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null,
  unique (storefront_id, version)
);

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  storefront_id uuid not null references public.storefronts(id) on delete cascade,
  slug text not null,
  locale text not null default 'mn-MN',
  title text not null,
  sections jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT',
  published_at timestamptz,
  unique (storefront_id, slug, locale)
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text,
  name text not null,
  presentation_type text not null,
  eligibility jsonb not null,
  benefit jsonb not null,
  limits jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'DRAFT',
  unique nulls not distinct (tenant_id, code)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  traveler_profile_id uuid references public.traveler_profiles(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  document_type text not null,
  visibility public.document_visibility not null default 'STAFF',
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_account_id uuid references public.customer_accounts(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  subject text not null,
  status text not null default 'OPEN',
  assigned_user_id uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type text not null,
  sender_person_id uuid references public.people(id) on delete set null,
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.loyalty_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  points integer not null,
  reason text not null,
  occurred_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  change_metadata jsonb not null default '{}'::jsonb,
  request_metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.outbox_events (
  event_id uuid primary key default gen_random_uuid(),
  event_type text not null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null,
  occurred_at timestamptz not null default now(),
  processed_at timestamptz
);

create index outbox_unprocessed_idx on public.outbox_events (occurred_at) where processed_at is null;
create index bookings_departure_idx on public.bookings (departure_id, status);
create index itinerary_departure_day_idx on public.itinerary_events (departure_id, day_number, sort_order);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create or replace function private.is_tenant_member(target_tenant uuid, allowed_roles public.staff_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.tenant_memberships membership
      where membership.tenant_id = target_tenant
        and membership.user_id = (select auth.uid())
        and membership.status = 'ACTIVE'
        and (allowed_roles is null or membership.role = any(allowed_roles))
    );
$$;

create or replace function private.is_booking_traveler(target_booking uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.booking_parties party
      join public.traveler_profiles traveler on traveler.id = party.traveler_profile_id
      join public.people person on person.id = traveler.person_id
      where party.booking_id = target_booking
        and person.auth_user_id = (select auth.uid())
    );
$$;

revoke all on function private.is_tenant_member(uuid, public.staff_role[]) from public;
revoke all on function private.is_booking_traveler(uuid) from public;
grant usage on schema private to authenticated, service_role;
grant execute on function private.is_tenant_member(uuid, public.staff_role[]) to authenticated, service_role;
grant execute on function private.is_booking_traveler(uuid) to authenticated, service_role;

create or replace function private.create_booking_hold(
  target_tenant uuid,
  target_departure uuid,
  requested_party_size integer,
  request_idempotency_key text,
  ttl_minutes integer default 15
)
returns public.inventory_holds
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_departure public.departures;
  held_count integer;
  existing_hold public.inventory_holds;
  created_hold public.inventory_holds;
begin
  if requested_party_size < 1 or ttl_minutes < 1 or ttl_minutes > 60 then
    raise exception 'invalid hold request' using errcode = '22023';
  end if;

  select * into existing_hold
  from public.inventory_holds
  where tenant_id = target_tenant and idempotency_key = request_idempotency_key;
  if found then return existing_hold; end if;

  select * into selected_departure
  from public.departures
  where id = target_departure and tenant_id = target_tenant and status in ('OPEN', 'GUARANTEED')
  for update;
  if not found then raise exception 'departure unavailable' using errcode = 'P0002'; end if;

  update public.inventory_holds
  set status = 'EXPIRED'
  where departure_id = target_departure and status = 'ACTIVE' and expires_at <= now();

  select coalesce(sum(party_size), 0)::integer into held_count
  from public.inventory_holds
  where departure_id = target_departure and status = 'ACTIVE' and expires_at > now();

  if selected_departure.confirmed_count + held_count + requested_party_size > selected_departure.capacity then
    raise exception 'insufficient availability' using errcode = 'P0001';
  end if;

  insert into public.inventory_holds (tenant_id, departure_id, party_size, idempotency_key, expires_at)
  values (target_tenant, target_departure, requested_party_size, request_idempotency_key, now() + make_interval(mins => ttl_minutes))
  returning * into created_hold;
  return created_hold;
end;
$$;

revoke all on function private.create_booking_hold(uuid, uuid, integer, text, integer) from public, anon, authenticated;
grant execute on function private.create_booking_hold(uuid, uuid, integer, text, integer) to service_role;

create or replace function private.confirm_booking(target_booking uuid, target_payment uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_booking public.bookings;
  selected_payment public.payments;
begin
  select * into selected_booking from public.bookings where id = target_booking for update;
  if not found then raise exception 'booking not found' using errcode = 'P0002'; end if;
  if selected_booking.status = 'CONFIRMED' then return selected_booking; end if;

  select * into selected_payment
  from public.payments
  where id = target_payment and booking_id = target_booking and status = 'SUCCEEDED';
  if not found then raise exception 'successful payment required' using errcode = 'P0001'; end if;

  update public.departures
  set confirmed_count = confirmed_count + selected_booking.party_size, updated_at = now()
  where id = selected_booking.departure_id
    and confirmed_count + selected_booking.party_size <= capacity;
  if not found then raise exception 'insufficient availability' using errcode = 'P0001'; end if;

  update public.inventory_holds set status = 'CONSUMED', consumed_at = now() where id = selected_booking.hold_id and status = 'ACTIVE';
  update public.bookings set status = 'CONFIRMED', confirmed_at = now(), updated_at = now() where id = target_booking returning * into selected_booking;

  insert into public.outbox_events (event_type, tenant_id, aggregate_type, aggregate_id, payload)
  values ('booking.confirmed', selected_booking.tenant_id, 'booking', selected_booking.id, jsonb_build_object('booking_number', selected_booking.booking_number));
  return selected_booking;
end;
$$;

revoke all on function private.confirm_booking(uuid, uuid) from public, anon, authenticated;
grant execute on function private.confirm_booking(uuid, uuid) to service_role;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'tenants','tenant_memberships','tenant_domains','tenant_settings','people','organizations','customer_accounts','traveler_profiles',
    'tour_definitions','departures','itinerary_events','inventory_holds','bookings','booking_parties','invoices','payments','suppliers','service_orders',
    'storefronts','storefront_releases','cms_pages','promotions','documents','conversations','messages','loyalty_entries','audit_logs','outbox_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end $$;

grant select on public.tenants, public.tenant_domains, public.tour_definitions, public.departures, public.itinerary_events,
  public.storefronts, public.storefront_releases, public.cms_pages, public.promotions to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.audit_logs, public.outbox_events, public.payments, public.loyalty_entries from authenticated;

create policy tenant_read on public.tenants for select to authenticated
  using (private.is_tenant_member(id));
create policy tenant_public_by_domain on public.tenants for select to anon
  using (exists (select 1 from public.tenant_domains domain where domain.tenant_id = id and domain.verified_at is not null));

create policy membership_read on public.tenant_memberships for select to authenticated
  using (user_id = (select auth.uid()) or private.is_tenant_member(tenant_id, array['OWNER','ADMIN']::public.staff_role[]));
create policy membership_manage on public.tenant_memberships for all to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN']::public.staff_role[]))
  with check (private.is_tenant_member(tenant_id, array['OWNER','ADMIN']::public.staff_role[]));

create policy domain_staff on public.tenant_domains for all to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','CONTENT']::public.staff_role[]))
  with check (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','CONTENT']::public.staff_role[]));
create policy domain_public on public.tenant_domains for select to anon using (verified_at is not null);

create policy settings_staff on public.tenant_settings for all to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN']::public.staff_role[]))
  with check (private.is_tenant_member(tenant_id, array['OWNER','ADMIN']::public.staff_role[]));

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'people','organizations','customer_accounts','tour_definitions','departures','itinerary_events','inventory_holds','bookings','booking_parties',
    'suppliers','service_orders','storefronts','storefront_releases','cms_pages','promotions','conversations','messages'
  ] loop
    execute format('create policy tenant_staff on public.%I for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id))', table_name);
  end loop;
end $$;

create policy traveler_profile_staff on public.traveler_profiles for all to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','SALES','OPERATIONS']::public.staff_role[]))
  with check (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','SALES','OPERATIONS']::public.staff_role[]));

create policy payment_staff_read on public.payments for select to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','FINANCE','SALES']::public.staff_role[]) or private.is_booking_traveler(booking_id));
create policy invoice_staff_traveler on public.invoices for select to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','FINANCE','SALES']::public.staff_role[]) or private.is_booking_traveler(booking_id));

create policy document_staff_traveler on public.documents for select to authenticated
  using (private.is_tenant_member(tenant_id) or (booking_id is not null and visibility = 'TRAVELER' and private.is_booking_traveler(booking_id)));
create policy document_staff_write on public.documents for insert to authenticated
  with check (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','OPERATIONS']::public.staff_role[]));
create policy document_staff_update on public.documents for update to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','OPERATIONS']::public.staff_role[]))
  with check (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','OPERATIONS']::public.staff_role[]));

create policy loyalty_staff_traveler on public.loyalty_entries for select to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN','SALES']::public.staff_role[])
    or exists (select 1 from public.people person where person.id = person_id and person.auth_user_id = (select auth.uid())));
create policy audit_staff on public.audit_logs for select to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN']::public.staff_role[]));
create policy outbox_staff on public.outbox_events for select to authenticated
  using (private.is_tenant_member(tenant_id, array['OWNER','ADMIN']::public.staff_role[]));

create policy public_tours on public.tour_definitions for select to anon using (status = 'PUBLISHED');
create policy public_departures on public.departures for select to anon using (
  status in ('OPEN','GUARANTEED','SOLD_OUT') and exists (
    select 1 from public.tour_definitions tour where tour.id = tour_id and tour.status = 'PUBLISHED'
  )
);
create policy public_itinerary on public.itinerary_events for select to anon using (
  visibility = 'TRAVELER' and exists (
    select 1 from public.departures departure
    join public.tour_definitions tour on tour.id = departure.tour_id
    where departure.id = departure_id and tour.status = 'PUBLISHED'
  )
);
create policy public_storefront on public.storefronts for select to anon using (status = 'PUBLISHED');
create policy public_storefront_release on public.storefront_releases for select to anon using (
  exists (select 1 from public.storefronts storefront where storefront.id = storefront_id and storefront.status = 'PUBLISHED')
);
create policy public_cms on public.cms_pages for select to anon using (status = 'PUBLISHED');
create policy public_promotions on public.promotions for select to anon using (
  status = 'ACTIVE' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-storefront-media', 'public-storefront-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('private-tenant-files', 'private-tenant-files', false, 26214400, null),
  ('traveler-documents', 'traveler-documents', false, 15728640, array['application/pdf','image/jpeg','image/png']),
  ('generated-documents', 'generated-documents', false, 15728640, array['application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy public_storefront_media_read on storage.objects for select to anon using (bucket_id = 'public-storefront-media');
create policy tenant_file_read on storage.objects for select to authenticated using (
  bucket_id in ('private-tenant-files','traveler-documents','generated-documents')
  and private.is_tenant_member((storage.foldername(name))[1]::uuid)
);
create policy tenant_file_insert on storage.objects for insert to authenticated with check (
  bucket_id in ('private-tenant-files','traveler-documents','generated-documents')
  and private.is_tenant_member((storage.foldername(name))[1]::uuid)
);
create policy tenant_file_update on storage.objects for update to authenticated using (
  bucket_id in ('private-tenant-files','traveler-documents','generated-documents')
  and private.is_tenant_member((storage.foldername(name))[1]::uuid)
) with check (
  bucket_id in ('private-tenant-files','traveler-documents','generated-documents')
  and private.is_tenant_member((storage.foldername(name))[1]::uuid)
);
