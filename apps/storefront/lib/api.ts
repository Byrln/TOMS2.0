import { headers } from "next/headers";
import { createTravelerSupabaseClient } from "./supabase-server";
import { getServerI18n } from "./i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Departure = { id: string; tourId: string; code: string; startsOn: string; endsOn: string; capacity: number; confirmedCount: number; priceMinor: number; currency: string; status: string };
export type Tour = { id: string; slug: string; name: string; summary: string; description: string; durationDays: number; durationNights: number; basePriceMinor: number; currency: string; status: string; destinations: string[]; heroImageUrl: string; highlights: string[]; inclusions: string[]; departures: Departure[] };
export type Bootstrap = { tenant: { name: string; slug: string }; storefront: { name: string; promotions: Array<{ id: string; name: string; code: string; benefit: string }> }; featuredTours: Tour[] };
export type Booking = { id: string; bookingNumber: string; departureId: string; tourId: string; organizerEmail: string; payerName: string; travelers: Array<{id:string;fullName:string;nationality:string}>; partySize: number; status: string; paymentStatus: string; currency: string; totalMinor: number; invoiceNumber: string; createdAt: string };
export type Trip = Booking & { tour: Tour; departure: Departure; itinerary: Array<{ id:string; title:string; startsAt:string; location?:string; details?:string }> };

async function getJson<T>(path: string, requestHeaders?: HeadersInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { cache: "no-store", ...(requestHeaders === undefined ? {} : { headers: requestHeaders }) });
  if (!response.ok) throw new Error(`TOMS API ${response.status}`);
  return response.json() as Promise<T>;
}

async function publicContext() {
  const [{ locale }, requestHeaders] = await Promise.all([getServerI18n(), headers()]);
  const host = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost").split(",")[0]!.trim().replace(/:\d+$/, "");
  return { locale, requestHeaders: { "x-toms-storefront-host": host } };
}

export const getBootstrap = async () => {
  const context = await publicContext();
  return getJson<Bootstrap>(`/api/v1/storefront/bootstrap?locale=${context.locale}`, context.requestHeaders);
};
export const getTours = async () => {
  const context = await publicContext();
  return (await getJson<{ items: Tour[] }>(`/api/v1/tours?locale=${context.locale}`, context.requestHeaders)).items;
};
export const getTour = async (slug: string) => {
  const context = await publicContext();
  return getJson<Tour>(`/api/v1/tours/${slug}?locale=${context.locale}`, context.requestHeaders);
};

async function getTravelerJson<T>(path: string): Promise<T> {
  const [supabase, context] = await Promise.all([createTravelerSupabaseClient(), publicContext()]);
  if (!supabase) throw new Error("Supabase server configuration is missing");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("An authenticated traveler session is required");
  const localizedPath = `${path}${path.includes("?") ? "&" : "?"}locale=${context.locale}`;
  return getJson<T>(localizedPath, { ...context.requestHeaders, authorization: `Bearer ${data.session.access_token}` });
}

export const getTrips = async () => (await getTravelerJson<{ items: Booking[] }>("/api/v1/me/trips")).items;
export const getTrip = (id: string) => getTravelerJson<Trip>(`/api/v1/me/trips/${id}`);
