import { headers } from "next/headers";
import type {
  StorefrontBootstrapResponse, StorefrontCheckoutContext, StorefrontDepartureResponse,
  StorefrontDestinationsResponse, StorefrontHomeResponse, StorefrontTourDetailResponse,
  StorefrontToursResponse, TravelerDashboardResponse, TravelerDocumentsResponse,
  TravelerMessagesResponse, TravelerPaymentsResponse, TravelerProfileResponse,
  TravelerTripResponse, TravelerTripsResponse,
} from "@toms/contracts";
import { createTravelerSupabaseClient } from "./supabase-server";
import { getServerI18n } from "./i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

async function publicGet<T>(path: string) { const context = await publicContext(); const separator = path.includes("?") ? "&" : "?"; return getJson<T>(`${path}${separator}locale=${context.locale}`, context.requestHeaders); }

export const getBootstrap = () => publicGet<StorefrontBootstrapResponse>("/api/v1/storefront/bootstrap");
export const getHome = () => publicGet<StorefrontHomeResponse>("/api/v1/storefront/home");
export const getTours = (query = "") => publicGet<StorefrontToursResponse>(`/api/v1/storefront/tours${query ? `?${query}` : ""}`);
export const getTour = (slug: string) => publicGet<StorefrontTourDetailResponse>(`/api/v1/storefront/tours/${slug}`);
export const getDestinations = (query = "") => publicGet<StorefrontDestinationsResponse>(`/api/v1/storefront/destinations${query ? `?${query}` : ""}`);
export const getDestination = <T>(slug: string) => publicGet<T>(`/api/v1/storefront/destinations/${slug}`);
export const getDeparture = (id: string) => publicGet<StorefrontDepartureResponse>(`/api/v1/storefront/departures/${id}`);
export const getCheckoutContext = (id: string) => publicGet<StorefrontCheckoutContext>(`/api/v1/storefront/departures/${id}/checkout-context`);
export const getPromotions = <T>() => publicGet<T>("/api/v1/storefront/promotions");
export const getCmsPage = <T>(slug: string) => publicGet<T>(`/api/v1/storefront/pages/${slug}`);

async function travelerGet<T>(path: string): Promise<T> {
  const context = await publicContext();
  const localizedPath = `${path}${path.includes("?") ? "&" : "?"}locale=${context.locale}`;
  if (process.env.TOMS_DEMO_MODE === "1") return getJson<T>(localizedPath, { ...context.requestHeaders, authorization: "Bearer toms-demo-access-token" });
  const supabase = await createTravelerSupabaseClient();
  if (!supabase) throw new Error("Supabase server configuration is missing");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("An authenticated traveler session is required");
  return getJson<T>(localizedPath, { ...context.requestHeaders, authorization: `Bearer ${data.session.access_token}` });
}

export const getTravelerDashboard = () => travelerGet<TravelerDashboardResponse>("/api/v1/me/dashboard");
export const getTrips = () => travelerGet<TravelerTripsResponse>("/api/v1/me/trips");
export const getTrip = (id: string) => travelerGet<TravelerTripResponse>(`/api/v1/me/trips/${id}`);
export const getTripTimeline = <T>(id: string) => travelerGet<T>(`/api/v1/me/trips/${id}/timeline`);
export const getTripDocuments = (id: string) => travelerGet<TravelerDocumentsResponse>(`/api/v1/me/trips/${id}/documents`);
export const getTripPayments = (id: string) => travelerGet<TravelerPaymentsResponse>(`/api/v1/me/trips/${id}/payments`);
export const getMessages = () => travelerGet<TravelerMessagesResponse>("/api/v1/me/messages");
export const getProfile = () => travelerGet<TravelerProfileResponse>("/api/v1/me/profile");
