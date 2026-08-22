import Image from "next/image";
import { notFound } from "next/navigation";
import { TourCard } from "@toms/storefront-ui";
import type { StorefrontTourSummary } from "@toms/contracts";
import { getDestination } from "@/lib/api";

type DestinationDetail = { id: string; slug: string; name: string; region: string; summary: string; hero: { url: string; alt: string }; tours: StorefrontTourSummary[] };
export const dynamic = "force-dynamic";
export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; let destination: DestinationDetail; try { destination = await getDestination<DestinationDetail>(slug); } catch { notFound(); } return <main><header className="destination-hero"><Image src={destination.hero.url} alt={destination.hero.alt} fill priority sizes="100vw" /><div><p className="section-eyebrow">{destination.region}</p><h1>{destination.name}</h1><p>{destination.summary}</p></div></header><section className="section"><div className="page-container"><header className="section-header"><div><p className="section-eyebrow">CURATED HERE</p><h2>Journeys through {destination.name}</h2></div></header><div className="tour-grid">{destination.tours.map((tour) => <TourCard key={tour.id} tour={{ slug: tour.slug, name: tour.name, summary: tour.summary, heroImageUrl: tour.heroImage.url, durationDays: tour.durationDays, priceMinor: tour.priceFrom.amountMinor, currency: tour.priceFrom.currency, destination: tour.destinations.join(" · "), nextAvailableOn: tour.nextAvailableOn, availabilityLabel: tour.availabilityLabel }} />)}</div></div></section></main>; }
