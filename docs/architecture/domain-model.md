# Canonical domain model

```mermaid
erDiagram
  TENANT ||--o{ TOUR_DEFINITION : owns
  TOUR_DEFINITION ||--o{ DEPARTURE : schedules
  DEPARTURE ||--o{ ITINERARY_EVENT : contains
  DEPARTURE ||--o{ INVENTORY_HOLD : reserves
  DEPARTURE ||--o{ BOOKING : confirms
  BOOKING ||--o{ BOOKING_PARTY : includes
  BOOKING_PARTY }o--|| TRAVELER_PROFILE : identifies
  TRAVELER_PROFILE ||--|| PERSON : describes
  BOOKING ||--o{ INVOICE : bills
  INVOICE ||--o{ PAYMENT : settles
  DEPARTURE ||--o{ SERVICE_ORDER : fulfills
  STOREFRONT ||--o{ STOREFRONT_RELEASE : publishes
```

`TourDefinition`, `Departure`, `Booking`, `Traveler` and itinerary are separate records. A tour is reusable product content; a departure is dated inventory; a booking is the immutable commercial snapshot for a party.

Money uses integer minor units plus ISO currency. Confirmed counts and active holds are checked atomically. Booking and payment statuses move only through explicit domain transitions. Traveler projections remove `STAFF` itinerary events and internal notes before returning data.

The canonical lifecycle is:

`Product → Departure → Hold → Booking → Traveler → Services → Money → Experience`
