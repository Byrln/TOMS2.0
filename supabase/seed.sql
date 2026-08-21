begin;

insert into public.tenants (id,slug,name,legal_name,default_currency,default_locale,timezone)
values ('11111111-1111-4111-8111-111111111111','toms-demo','TOMS Demo Travel','TOMS Demo Travel LLC','MNT','mn-MN','Asia/Ulaanbaatar');

insert into public.tenant_domains (id,tenant_id,hostname,is_primary,verified_at)
values ('12111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','demo.toms.mn',true,now());

insert into public.tenant_settings (tenant_id,theme,localization,security)
values ('11111111-1111-4111-8111-111111111111','{"primary":"#071d35","accent":"#d4a537","background":"#f8f7f4","radius":"8px"}','{"locales":["mn-MN","en-US"],"currency":"MNT"}','{"mfa_ready":true,"sensitive_read_audit":true}');

insert into public.tour_definitions (id,tenant_id,slug,name,summary,description,duration_days,duration_nights,base_price_minor,currency,status,destinations,hero_image_url,inclusions,exclusions,published_at)
values
('21111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','classic-europe','Классик Европ','Парис, Люксембург, Италиар дамжих сонгодог аялал','Европын түүх, хот, соёлыг мэргэжлийн зохион байгуулалтаар нэг аялалд.',11,10,3450000,'MNT','PUBLISHED',array['France','Luxembourg','Italy'],'/images/classic-europe.png',array['Accommodation','Breakfast','Airport transfers','Local guide'],array['Visa','Personal expenses'],now()),
('21111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','seoul-city-experience','Сөүл хотын аялал','Орчин үе ба уламжлалыг нэг аяллаар мэдэр','Сөүл, DMZ, ордон, хотын туршлага бүхий баталгаатай departure.',6,5,3030000,'MNT','PUBLISHED',array['Seoul','DMZ'],'/images/seoul.png',array['Hotel','Breakfast','Airport pickup','Guide'],array['Lunch','Personal expenses'],now()),
('21111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','gobi-discovery','Говийн гайхамшиг','Хонгорын элс, Баянзаг, нүүдэлчдийн амьдрал','Монголын Говийн байгаль, соёл, орон нутгийн туршлага.',9,8,2850000,'MNT','PUBLISHED',array['Gobi','Bayanzag'],'/images/gobi.png',array['Ger camp','Meals','4x4 transport','Guide'],array['Insurance'],now()),
('21111111-1111-4111-8111-111111111114','11111111-1111-4111-8111-111111111111','altai-adventure','Алтайн адал явдал','Монгол Алтайн уулс ба бүргэдчдийн нутаг','Бага бүрэлдэхүүнтэй уулын аялал.',8,7,4150000,'MNT','PUBLISHED',array['Bayan-Ulgii','Altai'],'/images/altai.png',array['Flights','Camp','Guide'],array['Equipment'],now()),
('21111111-1111-4111-8111-111111111115','11111111-1111-4111-8111-111111111111','japan-autumn','Японы намрын өнгө','Токио, Киото, Нарагийн намрын аялал','Хот, түүх, намрын байгалийн зохицол.',8,7,4650000,'MNT','PUBLISHED',array['Tokyo','Kyoto','Nara'],'/images/seoul.png',array['Hotel','Rail pass','Guide'],array['Visa'],now()),
('21111111-1111-4111-8111-111111111116','11111111-1111-4111-8111-111111111111','kyrgyz-highlands','Тэнгэр уулсын жим','Кыргызын нуур, уул, нүүдэлчдийн соёл','Тэнгэр уулсын жижиг бүлгийн аялал.',7,6,3450000,'MNT','PUBLISHED',array['Bishkek','Issyk-Kul'],'/images/altai.png',array['Camp','Transport','Guide'],array['Flights'],now()),
('21111111-1111-4111-8111-111111111117','11111111-1111-4111-8111-111111111111','khuvsgul-retreat','Хөвсгөлийн цэнхэр сувд','Тайга, цаатан соёл, нуурын амгалан','Хөвсгөл нуурын удаан хэмнэлтэй аялал.',6,5,2650000,'MNT','PUBLISHED',array['Khuvsgul'],'/images/altai.png',array['Camp','Meals','Transport'],array['Flights'],now()),
('21111111-1111-4111-8111-111111111118','11111111-1111-4111-8111-111111111111','silk-road','Торгоны зам','Самарканд, Бухара, Ташкентын өв','Төв Азийн түүхэн хотуудын аялал.',9,8,3850000,'MNT','PUBLISHED',array['Uzbekistan'],'/images/gobi.png',array['Hotel','Rail','Guide'],array['Visa'],now());

insert into public.departures (id,tenant_id,tour_id,code,starts_on,ends_on,booking_deadline,capacity,confirmed_count,price_minor,currency,status)
values
('31111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','21111111-1111-4111-8111-111111111111','EUR-2026-10-03','2026-10-03','2026-10-09','2026-09-20T16:00:00Z',32,24,3450000,'MNT','GUARANTEED'),
('31111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','21111111-1111-4111-8111-111111111112','SEL-2026-09-15','2026-09-15','2026-09-20','2026-09-01T16:00:00Z',24,18,3030000,'MNT','GUARANTEED'),
('31111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','21111111-1111-4111-8111-111111111113','GOB-2026-10-17','2026-10-17','2026-10-25','2026-10-05T16:00:00Z',18,9,2850000,'MNT','OPEN');

insert into public.itinerary_events (id,tenant_id,departure_id,day_number,starts_at,event_type,title,location,traveler_details,internal_notes,visibility,sort_order)
values
('41111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','31111111-1111-4111-8111-111111111112',1,'2026-09-15T00:30:00Z','MEETING','Chinggis Khaan Airport meeting','Terminal 2, information desk B','Meet the TOMS representative 90 minutes before check-in.','Supplier transfer ref SEL-TR-104','TRAVELER',10),
('41111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','31111111-1111-4111-8111-111111111112',1,'2026-09-15T03:40:00Z','FLIGHT','MIAT OM301 UBN → ICN','Chinggis Khaan International Airport','Flight time 3h 10m.','Group seat block 18A-24F','TRAVELER',20),
('41111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','31111111-1111-4111-8111-111111111112',1,'2026-09-15T09:10:00Z','TRANSPORT','Airport pickup','Incheon Terminal 1','Toyota Hiace, driver Minsoo Kim.','Supplier cost protected','TRAVELER',30),
('41111111-1111-4111-8111-111111111114','11111111-1111-4111-8111-111111111111','31111111-1111-4111-8111-111111111112',1,'2026-09-15T11:00:00Z','HOTEL','Hotel check-in','Myeongdong, Seoul','L7 Myeongdong by LOTTE, twin room.','Hotel confirmation SEL-L7-398','TRAVELER',40),
('41111111-1111-4111-8111-111111111115','11111111-1111-4111-8111-111111111111','31111111-1111-4111-8111-111111111112',1,'2026-09-15T12:00:00Z','INTERNAL','Guide operations briefing','Hotel lobby',null,'Do not expose supplier margin','STAFF',50);

insert into public.people (id,tenant_id,full_name,email,phone,nationality)
values
('61111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','Bat-Orgil Munkhbat','bat@example.com','+976 9911 2233','MN'),
('61111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','Enkhjin Munkhbat','enkhjin@example.com','+976 9911 2244','MN');

insert into public.customer_accounts (id,tenant_id,person_id,lifecycle_stage)
values ('62111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','61111111-1111-4111-8111-111111111111','REPEAT_CUSTOMER');

insert into public.traveler_profiles (id,tenant_id,person_id,date_of_birth,dietary_requirements)
values
('63111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','61111111-1111-4111-8111-111111111111','1992-04-13','No peanuts'),
('63111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','61111111-1111-4111-8111-111111111112','1994-07-18','Vegetarian');

insert into public.bookings (id,tenant_id,booking_number,departure_id,customer_account_id,payer_person_id,organizer_person_id,party_size,status,currency,subtotal_minor,discount_minor,total_minor,commercial_snapshot,idempotency_key,confirmed_at)
values ('51111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','TOMS-2026-0001234','31111111-1111-4111-8111-111111111112','62111111-1111-4111-8111-111111111111','61111111-1111-4111-8111-111111111111','61111111-1111-4111-8111-111111111111',2,'CONFIRMED','MNT',3030000,0,3030000,'{"tour_name":"Сөүл хотын аялал","departure":"SEL-2026-09-15","unit_price_minor":1515000}','seed-booking-0001234','2026-08-01T09:00:00Z');

insert into public.booking_parties (id,tenant_id,booking_id,traveler_profile_id,relationship,room_preference)
values
('64111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111','63111111-1111-4111-8111-111111111111','ORGANIZER','TWIN'),
('64111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111','63111111-1111-4111-8111-111111111112','TRAVELER','TWIN');

insert into public.invoices (id,tenant_id,booking_id,invoice_number,currency,total_minor,amount_paid_minor,issued_at)
values ('65111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111','INV-2026-0001234','MNT',3030000,3030000,'2026-08-01T09:00:00Z');

insert into public.payments (id,tenant_id,booking_id,invoice_id,provider,provider_reference,kind,status,currency,amount_minor,idempotency_key,occurred_at)
values ('66111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111','65111111-1111-4111-8111-111111111111','DEMO','demo_seed_0001234','CHARGE','SUCCEEDED','MNT',3030000,'seed-payment-0001234','2026-08-01T09:00:00Z');

insert into public.suppliers (id,tenant_id,name,supplier_type,email,status)
values ('a1111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','Seoul Transport Co.','TRANSPORT','ops@seoul-transport.example','ACTIVE');

insert into public.service_orders (id,tenant_id,departure_id,supplier_id,itinerary_event_id,service_type,status,quantity,supplier_cost_minor,currency,internal_notes)
values ('a2111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','31111111-1111-4111-8111-111111111112','a1111111-1111-4111-8111-111111111111','41111111-1111-4111-8111-111111111113','AIRPORT_TRANSFER','CONFIRMED',2,140000,'KRW','Private supplier terms');

insert into public.storefronts (id,tenant_id,name,slug,status,template_key,theme,navigation)
values ('71111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','Munkh Discovery','main','PUBLISHED','himalaya','{"primary":"#071d35","accent":"#d4a537","background":"#f8f7f4"}','[{"label":"Аяллууд","href":"/tours"},{"label":"Урамшуулал","href":"/promotions"}]');

insert into public.storefront_releases (id,tenant_id,storefront_id,version,snapshot,published_at)
values ('72111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111111',1,'{"template_version":1,"content_version":1,"theme_version":1,"catalog_revision":1}','2026-08-01T08:00:00Z');

insert into public.cms_pages (id,tenant_id,storefront_id,slug,locale,title,sections,seo,status,published_at)
values ('73111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111111','home','mn-MN','Дэлхийг өөрийнхөөрөө мэдэр','[{"type":"hero","tour_id":"21111111-1111-4111-8111-111111111114"},{"type":"featured_tours"},{"type":"trust"},{"type":"promotions"}]','{"title":"Munkh Discovery — Аялал","description":"Баталгаатай олон өдрийн аяллууд"}','PUBLISHED','2026-08-01T08:00:00Z');

insert into public.promotions (id,tenant_id,code,name,presentation_type,eligibility,benefit,limits,starts_at,ends_at,status)
values
('74111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','EARLY10','Эрт захиалгын хөнгөлөлт','BANNER','{"booking_window_days":60}','{"type":"percentage","value":10}','{"per_customer":1}','2026-08-01T00:00:00Z','2026-12-31T15:59:59Z','ACTIVE'),
('74111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','FAMILY5','Гэр бүлийн урамшуулал','COUPON','{"minimum_travelers":3}','{"type":"percentage","value":5}','{"per_booking":1}','2026-08-01T00:00:00Z','2026-12-31T15:59:59Z','ACTIVE');

insert into public.conversations (id,tenant_id,customer_account_id,booking_id,subject,status,updated_at)
values ('91111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','62111111-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111','Trip change request','OPEN','2026-08-21T08:30:00Z');

insert into public.messages (id,tenant_id,conversation_id,sender_type,sender_person_id,body,is_internal,created_at)
values ('92111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','91111111-1111-4111-8111-111111111111','CUSTOMER','61111111-1111-4111-8111-111111111111','Нислэгийн цаг өөрчлөгдсөн үү? Би portal дээр шинэ мэдээллээ харахыг хүсэж байна.',false,'2026-08-21T08:30:00Z');

insert into public.loyalty_entries (id,tenant_id,person_id,booking_id,points,reason,occurred_at)
values ('93111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','61111111-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111',500,'booking','2026-08-01T09:00:00Z');

insert into public.audit_logs (id,tenant_id,action,entity_type,entity_id,change_metadata,occurred_at)
values ('94111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','booking.confirmed','booking','51111111-1111-4111-8111-111111111111','{"source":"seed"}','2026-08-01T09:00:00Z');

insert into public.outbox_events (event_id,event_type,tenant_id,aggregate_type,aggregate_id,payload,occurred_at,processed_at)
values ('95111111-1111-4111-8111-111111111111','booking.confirmed','11111111-1111-4111-8111-111111111111','booking','51111111-1111-4111-8111-111111111111','{"booking_number":"TOMS-2026-0001234"}','2026-08-01T09:00:00Z','2026-08-01T09:00:05Z');

commit;
