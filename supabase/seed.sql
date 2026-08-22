begin;

insert into public.tenants (
  id, slug, name_i18n, default_locale, supported_locales, default_currency, time_zone, status
) values (
  '11111111-1111-4111-8111-111111111111',
  'munkh-discovery',
  '{"mn":"Мөнх Дисковери","en":"Munkh Discovery"}'::jsonb,
  'mn', '["mn","en"]'::jsonb, 'MNT', 'Asia/Ulaanbaatar', 'ACTIVE'
) on conflict (id) do nothing;

insert into public.tenant_domains (
  id, tenant_id, host, is_primary, verified_at
) values
  ('12111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'localhost', true, now()),
  ('12111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'munkh-discovery.toms.mn', false, now())
on conflict (id) do nothing;

insert into public.tenant_settings (tenant_id, settings)
values (
  '11111111-1111-4111-8111-111111111111',
  '{"brand":{"primary":"#071d35","accent":"#d4a537"},"localization":{"locales":["mn","en"],"currency":"MNT"},"security":{"mfaReady":true}}'::jsonb
) on conflict (tenant_id) do nothing;

insert into public.tour_definitions (
  id, tenant_id, slug, name_i18n, summary_i18n, description_i18n,
  category, duration_days, duration_nights, destinations, languages,
  highlights_i18n, inclusions_i18n, exclusions_i18n, hero_image_path,
  status, published_at
) values
(
  '21111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'classic-europe',
  '{"mn":"Классик Европ","en":"Classic Europe"}',
  '{"mn":"Парис, Люксембург, Италиар дамжих сонгодог аялал","en":"A classic journey through Paris, Luxembourg and Italy"}',
  '{"mn":"Европын түүх, хот, соёлыг мэргэжлийн зохион байгуулалтаар нэг аялалд.","en":"Experience European history, cities and culture in one professionally operated journey."}',
  'CULTURAL', 11, 10, '["France","Luxembourg","Italy"]', '["mn","en"]',
  '[{"mn":"Парисын онцлох газрууд","en":"Paris highlights"},{"mn":"Италийн урлаг ба хоол","en":"Italian art and cuisine"}]',
  '[{"mn":"Зочид буудал","en":"Accommodation"},{"mn":"Өглөөний цай","en":"Breakfast"},{"mn":"Орон нутгийн хөтөч","en":"Local guide"}]',
  '[{"mn":"Виз","en":"Visa"},{"mn":"Хувийн зардал","en":"Personal expenses"}]',
  '/images/classic-europe.png', 'PUBLISHED', now()
),
(
  '21111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'seoul-city-experience',
  '{"mn":"Сөүл хотын аялал","en":"Seoul City Experience"}',
  '{"mn":"Орчин үе ба уламжлалыг нэг аяллаар мэдэр","en":"Experience modern life and tradition in one journey"}',
  '{"mn":"Сөүл, DMZ, ордон, хотын туршлага бүхий баталгаатай гаралт.","en":"A guaranteed departure featuring Seoul, the DMZ, palaces and city life."}',
  'CITY', 6, 5, '["Seoul","DMZ"]', '["mn","en"]',
  '[{"mn":"Кёнбокгун ордон","en":"Gyeongbokgung Palace"},{"mn":"DMZ аялал","en":"DMZ visit"}]',
  '[{"mn":"Зочид буудал","en":"Hotel"},{"mn":"Нисэх буудлын тосолт","en":"Airport pickup"},{"mn":"Хөтөч","en":"Guide"}]',
  '[{"mn":"Өдрийн хоол","en":"Lunch"},{"mn":"Хувийн зардал","en":"Personal expenses"}]',
  '/images/seoul.png', 'PUBLISHED', now()
),
(
  '21111111-1111-4111-8111-111111111113', '11111111-1111-4111-8111-111111111111', 'gobi-discovery',
  '{"mn":"Говийн гайхамшиг","en":"Gobi Discovery"}',
  '{"mn":"Хонгорын элс, Баянзаг, нүүдэлчдийн амьдрал","en":"Khongor dunes, Bayanzag and nomadic life"}',
  '{"mn":"Монголын Говийн байгаль, соёл, орон нутгийн туршлага.","en":"Nature, culture and local experiences across the Mongolian Gobi."}',
  'ADVENTURE', 9, 8, '["Gobi","Bayanzag"]', '["mn","en"]',
  '[{"mn":"Хонгорын элс","en":"Khongor dunes"},{"mn":"Тэмээтэй аялал","en":"Camel experience"}]',
  '[{"mn":"Жуулчны бааз","en":"Ger camp"},{"mn":"Хоол","en":"Meals"},{"mn":"4x4 тээвэр","en":"4x4 transport"}]',
  '[{"mn":"Даатгал","en":"Insurance"}]',
  '/images/gobi.png', 'PUBLISHED', now()
),
(
  '21111111-1111-4111-8111-111111111114', '11111111-1111-4111-8111-111111111111', 'altai-adventure',
  '{"mn":"Алтайн адал явдал","en":"Altai Adventure"}',
  '{"mn":"Монгол Алтайн уулс ба бүргэдчдийн нутаг","en":"Mongolian Altai mountains and eagle hunters"}',
  '{"mn":"Бага бүрэлдэхүүнтэй уулын аялал.","en":"A small-group mountain expedition."}',
  'ADVENTURE', 8, 7, '["Bayan-Ulgii","Altai"]', '["mn","en"]',
  '[{"mn":"Бүргэдчдийн гэр бүл","en":"Eagle hunter family"},{"mn":"Алтайн уулс","en":"Altai Mountains"}]',
  '[{"mn":"Дотоодын нислэг","en":"Domestic flight"},{"mn":"Кемп","en":"Camp"},{"mn":"Хөтөч","en":"Guide"}]',
  '[{"mn":"Хувийн хэрэгсэл","en":"Personal equipment"}]',
  '/images/altai.png', 'PUBLISHED', now()
)
on conflict (id) do nothing;

insert into public.departures (
  id, tenant_id, tour_id, code, starts_on, ends_on, capacity,
  confirmed_count, held_count, status, trip_status
) values
  ('31111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111111', 'EUR-2026-10-03', '2026-10-03', '2026-10-13', 32, 24, 0, 'GUARANTEED', 'UPCOMING'),
  ('31111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111112', 'SEL-2026-09-15', '2026-09-15', '2026-09-20', 24, 18, 0, 'GUARANTEED', 'UPCOMING'),
  ('31111111-1111-4111-8111-111111111113', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111113', 'GOB-2026-10-17', '2026-10-17', '2026-10-25', 18, 9, 0, 'OPEN', 'UPCOMING'),
  ('31111111-1111-4111-8111-111111111114', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111114', 'ALT-2026-11-08', '2026-11-08', '2026-11-15', 14, 4, 0, 'OPEN', 'UPCOMING')
on conflict (id) do nothing;

insert into public.tour_prices (
  id, tenant_id, tour_id, departure_id, price_type, amount_minor, currency
) values
  ('32111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111111', '31111111-1111-4111-8111-111111111111', 'ADULT', 3450000, 'MNT'),
  ('32111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111112', '31111111-1111-4111-8111-111111111112', 'ADULT', 3030000, 'MNT'),
  ('32111111-1111-4111-8111-111111111113', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111113', '31111111-1111-4111-8111-111111111113', 'ADULT', 2850000, 'MNT'),
  ('32111111-1111-4111-8111-111111111114', '11111111-1111-4111-8111-111111111111', '21111111-1111-4111-8111-111111111114', '31111111-1111-4111-8111-111111111114', 'ADULT', 4150000, 'MNT')
on conflict (id) do nothing;

insert into public.itinerary_days (id, tenant_id, departure_id, day_number, title_i18n)
values (
  '40111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '31111111-1111-4111-8111-111111111112', 1,
  '{"mn":"Улаанбаатараас Сөүл","en":"Ulaanbaatar to Seoul"}'
) on conflict (id) do nothing;

insert into public.itinerary_events (
  id, tenant_id, departure_id, itinerary_day_id, day_number, sort_order,
  type, starts_at, ends_at, title_i18n, details_i18n, location_i18n,
  visibility, internal_notes
) values
(
  '41111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '31111111-1111-4111-8111-111111111112', '40111111-1111-4111-8111-111111111111',
  1, 10, 'MEETING', '2026-09-15T00:30:00Z', '2026-09-15T01:00:00Z',
  '{"mn":"Чингис хаан нисэх буудалд уулзах","en":"Meet at Chinggis Khaan Airport"}',
  '{"mn":"Бүртгэлээс 90 минутын өмнө TOMS-ийн төлөөлөгчтэй уулзана.","en":"Meet the TOMS representative 90 minutes before check-in."}',
  '{"mn":"Терминал 2, мэдээллийн B цэг","en":"Terminal 2, information desk B"}',
  'BOOKED_TRAVELER', 'Supplier transfer reference SEL-TR-104'
),
(
  '41111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111',
  '31111111-1111-4111-8111-111111111112', '40111111-1111-4111-8111-111111111111',
  1, 20, 'FLIGHT', '2026-09-15T03:40:00Z', '2026-09-15T06:50:00Z',
  '{"mn":"MIAT OM301 UBN → ICN","en":"MIAT OM301 UBN → ICN"}',
  '{"mn":"Нислэгийн хугацаа 3 цаг 10 минут.","en":"Flight time is 3 hours 10 minutes."}',
  '{"mn":"Чингис хаан олон улсын нисэх буудал","en":"Chinggis Khaan International Airport"}',
  'BOOKED_TRAVELER', 'Group seat block 18A-24F'
)
on conflict (id) do nothing;

insert into public.people (
  id, tenant_id, first_name, last_name, email, phone, nationality, preferred_locale
) values
  ('61111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Bat-Orgil', 'Munkhbat', 'bat@example.com', '+976 9911 2233', 'MN', 'mn'),
  ('61111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'Enkhjin', 'Munkhbat', 'enkhjin@example.com', '+976 9911 2244', 'MN', 'en')
on conflict (id) do nothing;

insert into public.customer_accounts (id, tenant_id, person_id, segment, source)
values (
  '62111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '61111111-1111-4111-8111-111111111111', 'REPEAT_CUSTOMER', 'STOREFRONT'
) on conflict (id) do nothing;

insert into public.traveler_profiles (
  id, tenant_id, person_id, passport_country, passport_last_four,
  document_readiness, dietary_requirements, room_preference
) values
  ('63111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '61111111-1111-4111-8111-111111111111', 'MN', '5457', 'READY', 'No peanuts', 'TWIN'),
  ('63111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', '61111111-1111-4111-8111-111111111112', 'MN', '4321', 'READY', 'Vegetarian', 'TWIN')
on conflict (id) do nothing;

insert into public.bookings (
  id, tenant_id, booking_number, tour_id, departure_id, customer_account_id,
  organizer_person_id, payer_person_id, organizer_email, party_size, status,
  payment_status, total_minor, currency, source, tour_snapshot, price_snapshot,
  confirmed_at
) values (
  '51111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  'TOMS-2026-0001234', '21111111-1111-4111-8111-111111111112',
  '31111111-1111-4111-8111-111111111112', '62111111-1111-4111-8111-111111111111',
  '61111111-1111-4111-8111-111111111111', '61111111-1111-4111-8111-111111111111',
  'bat@example.com', 2, 'CONFIRMED', 'PAID', 6060000, 'MNT', 'STOREFRONT',
  '{"slug":"seoul-city-experience","name":{"mn":"Сөүл хотын аялал","en":"Seoul City Experience"}}',
  '{"unitPriceMinor":"3030000","partySize":2,"currency":"MNT"}',
  '2026-08-01T09:00:00Z'
) on conflict (id) do nothing;

insert into public.booking_parties (
  id, tenant_id, booking_id, traveler_profile_id, traveler_snapshot, is_organizer
) values
  ('64111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '51111111-1111-4111-8111-111111111111', '63111111-1111-4111-8111-111111111111', '{"fullName":"Bat-Orgil Munkhbat","nationality":"MN"}', true),
  ('64111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', '51111111-1111-4111-8111-111111111111', '63111111-1111-4111-8111-111111111112', '{"fullName":"Enkhjin Munkhbat","nationality":"MN"}', false)
on conflict (id) do nothing;

insert into public.invoices (
  id, tenant_id, booking_id, invoice_number, status, total_minor, paid_minor,
  currency, issued_at
) values (
  '65111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '51111111-1111-4111-8111-111111111111', 'INV-2026-0001234', 'PAID',
  6060000, 6060000, 'MNT', '2026-08-01T09:00:00Z'
) on conflict (id) do nothing;

insert into public.payments (
  id, tenant_id, booking_id, invoice_id, provider, provider_transaction_id,
  status, amount_minor, currency, reconciliation_status, succeeded_at
) values (
  '66111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '51111111-1111-4111-8111-111111111111', '65111111-1111-4111-8111-111111111111',
  'MANUAL_BANK', 'seed_bank_0001234', 'PAID', 6060000, 'MNT', 'MATCHED',
  '2026-08-01T09:00:00Z'
) on conflict (id) do nothing;

insert into public.storefronts (
  id, tenant_id, slug, brand_name_i18n, template, theme_tokens,
  navigation_i18n, status
) values (
  '71111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  'main', '{"mn":"Мөнх Дисковери","en":"Munkh Discovery"}', 'HIMALAYA',
  '{"primary":"#071d35","accent":"#d4a537","background":"#f8f7f4"}',
  '{"mn":[{"label":"Аяллууд","href":"/tours"},{"label":"Урамшуулал","href":"/promotions"}],"en":[{"label":"Tours","href":"/tours"},{"label":"Promotions","href":"/promotions"}]}',
  'PUBLISHED'
) on conflict (id) do nothing;

insert into public.storefront_releases (
  id, tenant_id, storefront_id, version, status, snapshot, checksum, published_at
) values (
  '72111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '71111111-1111-4111-8111-111111111111', '1.0.0', 'PUBLISHED',
  '{"templateVersion":1,"contentVersion":1,"catalogRevision":1}',
  'sha256:seed-release-1', '2026-08-01T08:00:00Z'
) on conflict (id) do nothing;

update public.storefronts
set active_release_id = '72111111-1111-4111-8111-111111111111'
where id = '71111111-1111-4111-8111-111111111111';

insert into public.cms_pages (
  id, tenant_id, storefront_id, slug, title_i18n, seo_i18n, status
) values (
  '73111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '71111111-1111-4111-8111-111111111111', 'home',
  '{"mn":"Дэлхийг өөрийнхөөрөө мэдэр","en":"Experience the world your way"}',
  '{"mn":{"title":"Мөнх Дисковери — Аялал","description":"Баталгаатай олон өдрийн аяллууд"},"en":{"title":"Munkh Discovery — Tours","description":"Trusted multi-day journeys"}}',
  'PUBLISHED'
) on conflict (id) do nothing;

insert into public.cms_blocks (
  id, tenant_id, page_id, type, sort_order, content_i18n, settings
) values (
  '73211111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  '73111111-1111-4111-8111-111111111111', 'HERO', 10,
  '{"mn":{"title":"Дэлхийг өөрийнхөөрөө мэдэр","cta":"Аяллаа хайх"},"en":{"title":"Experience the world your way","cta":"Find a trip"}}',
  '{"heroTourId":"21111111-1111-4111-8111-111111111114"}'
) on conflict (id) do nothing;

insert into public.promotions (
  id, tenant_id, code, name_i18n, description_i18n, conditions, benefit,
  presentation, redemption_limit, per_customer_limit, starts_at, ends_at, status
) values
(
  '74111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'EARLY10',
  '{"mn":"Эрт захиалгын хөнгөлөлт","en":"Early booking offer"}',
  '{"mn":"60-аас дээш хоногийн өмнө захиалахад","en":"For bookings made at least 60 days early"}',
  '{"minimumBookingWindowDays":60}', '{"type":"PERCENTAGE","value":10}',
  'EARLY_BIRD', 500, 1, '2026-08-01T00:00:00Z', '2026-12-31T15:59:59Z', 'ACTIVE'
),
(
  '74111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'FAMILY5',
  '{"mn":"Гэр бүлийн урамшуулал","en":"Family offer"}',
  '{"mn":"3-аас дээш аялагчтай захиалгад","en":"For bookings with at least three travelers"}',
  '{"minimumTravelers":3}', '{"type":"PERCENTAGE","value":5}',
  'COUPON', 300, 1, '2026-08-01T00:00:00Z', '2026-12-31T15:59:59Z', 'ACTIVE'
)
on conflict (id) do nothing;

insert into public.audit_logs (
  id, tenant_id, action, entity_type, entity_id, after, metadata, occurred_at
) values (
  '94111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  'booking.confirmed', 'booking', '51111111-1111-4111-8111-111111111111',
  '{"status":"CONFIRMED","paymentStatus":"PAID"}', '{"source":"seed"}',
  '2026-08-01T09:00:00Z'
) on conflict (id) do nothing;

insert into public.outbox_events (
  id, tenant_id, event_type, aggregate_type, aggregate_id, deduplication_key,
  payload, occurred_at, processed_at
) values (
  '95111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  'booking.confirmed', 'booking', '51111111-1111-4111-8111-111111111111',
  'booking.confirmed:51111111-1111-4111-8111-111111111111',
  '{"bookingNumber":"TOMS-2026-0001234"}', '2026-08-01T09:00:00Z',
  '2026-08-01T09:00:05Z'
) on conflict (id) do nothing;

commit;
