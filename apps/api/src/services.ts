import type { Actor } from "./shared/actor";
import type { VerifiedAccessToken } from "./plugins/auth.plugin";

export interface PageQuery {
  page: number;
  pageSize: number;
  sort?: string | undefined;
  q?: string | undefined;
  locale?: "mn" | "en" | undefined;
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
  };
  dashboard: { read(actor: Actor, locale: "mn" | "en"): Promise<unknown> };
  backoffice: {
    list(actor: Actor, resource: "bookings" | "travelers" | "customers" | "conversations" | "payments" | "invoices" | "documents" | "promotions", locale: "mn" | "en"): Promise<unknown>;
  };
  storefront: {
    bootstrap(host: string, locale: "mn" | "en"): Promise<unknown>;
    listTours(host: string, locale: "mn" | "en"): Promise<unknown>;
    getTour(host: string, slug: string, locale: "mn" | "en"): Promise<unknown>;
  };
  bookings: {
    createHold(host: string, input: unknown, idempotencyKey: string): Promise<unknown>;
    checkout(host: string, input: unknown, idempotencyKey: string): Promise<unknown>;
  };
  traveler: {
    list(token: VerifiedAccessToken, locale: "mn" | "en"): Promise<unknown>;
    get(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en"): Promise<unknown>;
  };
}
