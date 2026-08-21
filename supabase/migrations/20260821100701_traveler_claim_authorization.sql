-- Traveler account claiming is based on a verified auth identity plus matching
-- organizer/payer/traveler email. Possession of a booking UUID is never enough.
create or replace function private.is_booking_traveler(target_booking uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (
      select 1
      from public.bookings booking
      left join public.people organizer on organizer.id = booking.organizer_person_id
      left join public.people payer on payer.id = booking.payer_person_id
      where booking.id = target_booking
        and (organizer.auth_user_id = (select auth.uid()) or payer.auth_user_id = (select auth.uid()))
    )
    or exists (
      select 1
      from public.booking_parties party
      join public.traveler_profiles traveler on traveler.id = party.traveler_profile_id
      join public.people person on person.id = traveler.person_id
      where party.booking_id = target_booking
        and person.auth_user_id = (select auth.uid())
    )
  );
$$;

create or replace function public.claim_booking(target_booking uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  verified_email text := lower(coalesce((select auth.jwt()) ->> 'email', ''));
  current_user_id uuid := (select auth.uid());
  claimed_count integer := 0;
begin
  if current_user_id is null or verified_email = '' then
    return false;
  end if;

  update public.people person
  set auth_user_id = current_user_id,
      updated_at = now()
  where lower(coalesce(person.email, '')) = verified_email
    and (person.auth_user_id is null or person.auth_user_id = current_user_id)
    and (
      person.id in (
        select booking.organizer_person_id from public.bookings booking where booking.id = target_booking
        union
        select booking.payer_person_id from public.bookings booking where booking.id = target_booking
      )
      or person.id in (
        select traveler.person_id
        from public.booking_parties party
        join public.traveler_profiles traveler on traveler.id = party.traveler_profile_id
        where party.booking_id = target_booking
      )
    );

  get diagnostics claimed_count = row_count;
  return claimed_count > 0 and private.is_booking_traveler(target_booking);
end;
$$;

revoke all on function public.claim_booking(uuid) from public, anon;
grant execute on function public.claim_booking(uuid) to authenticated;

create policy traveler_person_read on public.people for select to authenticated
  using (auth_user_id = (select auth.uid()));
create policy traveler_profile_read on public.traveler_profiles for select to authenticated
  using (exists (
    select 1 from public.people person
    where person.id = traveler_profiles.person_id and person.auth_user_id = (select auth.uid())
  ));
create policy traveler_booking_read on public.bookings for select to authenticated
  using (private.is_booking_traveler(id));
create policy traveler_party_read on public.booking_parties for select to authenticated
  using (private.is_booking_traveler(booking_id));
create policy traveler_departure_read on public.departures for select to authenticated
  using (exists (
    select 1 from public.bookings booking
    where booking.departure_id = departures.id and private.is_booking_traveler(booking.id)
  ));
create policy traveler_tour_read on public.tour_definitions for select to authenticated
  using (exists (
    select 1
    from public.departures departure
    join public.bookings booking on booking.departure_id = departure.id
    where departure.tour_id = tour_definitions.id and private.is_booking_traveler(booking.id)
  ));
create policy traveler_itinerary_read on public.itinerary_events for select to authenticated
  using (visibility in ('PUBLIC', 'TRAVELER') and exists (
    select 1 from public.bookings booking
    where booking.departure_id = itinerary_events.departure_id and private.is_booking_traveler(booking.id)
  ));
create policy traveler_conversation_read on public.conversations for select to authenticated
  using (booking_id is not null and private.is_booking_traveler(booking_id));
create policy traveler_message_read on public.messages for select to authenticated
  using (not is_internal and exists (
    select 1 from public.conversations conversation
    where conversation.id = messages.conversation_id
      and conversation.booking_id is not null
      and private.is_booking_traveler(conversation.booking_id)
  ));
create policy traveler_message_insert on public.messages for insert to authenticated
  with check (
    sender_type = 'TRAVELER'
    and not is_internal
    and exists (
      select 1 from public.people person
      where person.id = messages.sender_person_id and person.auth_user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.conversations conversation
      where conversation.id = messages.conversation_id
        and conversation.booking_id is not null
        and private.is_booking_traveler(conversation.booking_id)
    )
  );
