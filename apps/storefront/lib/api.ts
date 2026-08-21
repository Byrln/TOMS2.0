const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Departure = { id: string; tourId: string; code: string; startsOn: string; endsOn: string; capacity: number; confirmedCount: number; priceMinor: number; currency: string; status: string };
export type Tour = { id: string; slug: string; name: string; summary: string; description: string; durationDays: number; durationNights: number; basePriceMinor: number; currency: string; status: string; destinations: string[]; heroImageUrl: string; highlights: string[]; inclusions: string[]; departures: Departure[] };
export type Bootstrap = { tenant: { name: string; slug: string }; storefront: { name: string; promotions: Array<{ id: string; name: string; code: string; benefit: string }> }; featuredTours: Tour[] };
export type Booking = { id: string; bookingNumber: string; departureId: string; tourId: string; organizerEmail: string; payerName: string; travelers: Array<{id:string;fullName:string;nationality:string}>; partySize: number; status: string; paymentStatus: string; currency: string; totalMinor: number; invoiceNumber: string; createdAt: string };
export type Trip = Booking & { tour: Tour; departure: Departure; itinerary: Array<{ id:string; title:string; startsAt:string; location?:string; details?:string }> };

async function getJson<T>(path: string, headers?: HeadersInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { cache: "no-store", ...(headers === undefined ? {} : { headers }) });
  if (!response.ok) throw new Error(`TOMS API ${response.status}`);
  return response.json() as Promise<T>;
}

export const getBootstrap = () => getJson<Bootstrap>("/api/v1/storefront/bootstrap");
export const getTours = async () => (await getJson<{ items: Tour[] }>("/api/v1/tours")).items;
export const getTour = (slug: string) => getJson<Tour>(`/api/v1/tours/${slug}`);
export const getTrips = async (email: string) => (await getJson<{ items: Booking[] }>("/api/v1/me/trips", { "x-demo-traveler": email })).items;
export const getTrip = (id: string, email: string) => getJson<Trip>(`/api/v1/me/trips/${id}`, { "x-demo-traveler": email });
