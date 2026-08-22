import type { Actor } from "./shared/actor";
import type { VerifiedAccessToken } from "./plugins/auth.plugin";

export interface PageQuery {
  page: number;
  pageSize: number;
  sort?: string | undefined;
  q?: string | undefined;
  locale?: "mn" | "en" | undefined;
  order?: "asc" | "desc" | undefined;
  status?: string | undefined;
  paymentStatus?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export interface ApiServices {
  identity: { resolveActor(token: VerifiedAccessToken): Promise<Actor> };
  tours: {
    list(actor: Actor, query: PageQuery): Promise<unknown>;
    create(actor: Actor, input: unknown): Promise<unknown>;
    publish(actor: Actor, tourId: string): Promise<unknown>;
    get(actor: Actor, tourId: string, locale: "mn" | "en"): Promise<unknown>;
  };
  departures: {
    list(actor: Actor): Promise<unknown>;
    create(actor: Actor, input: unknown): Promise<unknown>;
    get(actor: Actor, departureId: string): Promise<unknown>;
    readiness(actor: Actor, departureId: string): Promise<unknown>;
    manifest(actor: Actor, departureId: string): Promise<unknown>;
  };
  dashboard: { read(actor: Actor, locale: "mn" | "en", range?: "30d" | "90d" | "12m"): Promise<unknown> };
  backoffice: {
    list(actor: Actor, resource: "bookings" | "travelers" | "customers" | "conversations" | "payments" | "invoices" | "documents" | "promotions", locale: "mn" | "en", query?: PageQuery): Promise<unknown>;
  };
  storefront: {
    bootstrap(host: string, locale: "mn" | "en"): Promise<unknown>;
    home(host: string, locale: "mn" | "en"): Promise<unknown>;
    listTours(host: string, locale: "mn" | "en", query?: PageQuery): Promise<unknown>;
    getTour(host: string, slug: string, locale: "mn" | "en"): Promise<unknown>;
    listDestinations(host: string, locale: "mn" | "en", query?: PageQuery): Promise<unknown>;
    getDestination(host: string, slug: string, locale: "mn" | "en"): Promise<unknown>;
    getDeparture(host: string, departureId: string, locale: "mn" | "en"): Promise<unknown>;
    availability(host: string, departureId: string, locale: "mn" | "en"): Promise<unknown>;
    checkoutContext(host: string, departureId: string, locale: "mn" | "en"): Promise<unknown>;
    promotions(host: string, locale: "mn" | "en", query?: PageQuery): Promise<unknown>;
    page(host: string, slug: string, locale: "mn" | "en"): Promise<unknown>;
  };
  bookings: {
    createHold(host: string, input: unknown, idempotencyKey: string): Promise<unknown>;
    checkout(host: string, input: unknown, idempotencyKey: string): Promise<unknown>;
  };
  traveler: {
    list(token: VerifiedAccessToken, locale: "mn" | "en"): Promise<unknown>;
    get(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en"): Promise<unknown>;
    dashboard(token: VerifiedAccessToken, locale: "mn" | "en"): Promise<unknown>;
    timeline(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en"): Promise<unknown>;
    documents(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en"): Promise<unknown>;
    payments(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en"): Promise<unknown>;
    messages(token: VerifiedAccessToken, locale: "mn" | "en"): Promise<unknown>;
    profile(token: VerifiedAccessToken, locale: "mn" | "en"): Promise<unknown>;
    updateProfile(token: VerifiedAccessToken, input: unknown, locale: "mn" | "en"): Promise<unknown>;
  };
}
