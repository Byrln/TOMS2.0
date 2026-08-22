import type { DatabaseClient } from "@toms/db";
import type { ApiServices } from "./services";
import { createIdentityService } from "./modules/identity/identity.service";
import { createStorefrontService } from "./modules/storefront/storefront.service";
import { createToursService } from "./modules/tours/tours.service";
import { createBookingService } from "./modules/bookings/booking.service";
import { createTravelerService } from "./modules/traveler/traveler.service";
import { createDepartureService } from "./modules/departures/departure.service";
import { createDashboardService } from "./modules/dashboard/dashboard.service";
import { createBackofficeService } from "./modules/backoffice/backoffice.service";

export function createProductionServices(client: DatabaseClient): ApiServices {
  return {
    identity: createIdentityService(client),
    tours: createToursService(client),
    storefront: createStorefrontService(client),
    bookings: createBookingService(client),
    traveler: createTravelerService(client),
    departures: createDepartureService(client),
    dashboard: createDashboardService(client),
    backoffice: createBackofficeService(client),
  };
}
