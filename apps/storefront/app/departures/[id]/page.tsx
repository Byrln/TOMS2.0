import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, UsersRound } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { getTours } from "@/lib/api";

export const dynamic = "force-dynamic";
export default async function DeparturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tours = await getTours();
  const tour = tours.find((item) => item.departures.some((departure) => departure.id === id));
  const departure = tour?.departures.find((item) => item.id === id);
  if (!tour || !departure) notFound();
  return <main><header className="page-hero"><div><p>{tour.destinations.join(" · ")}</p><h1>{tour.name}</h1><p>{departure.code}</p></div></header><section className="section"><div className="page-container departure-detail"><article className="portal-panel"><h2>Гарах аяллын мэдээлэл</h2><div className="summary-row"><span><CalendarDays size={15} /> Огноо</span><strong>{departure.startsOn} → {departure.endsOn}</strong></div><div className="summary-row"><span><UsersRound size={15} /> Багтаамж</span><strong>{departure.confirmedCount} / {departure.capacity}</strong></div><div className="summary-row total"><span>Нэг хүний үнэ</span><strong>{formatCurrencyMinor(departure.priceMinor, departure.currency)}</strong></div><Link className="primary-link" href={`/checkout/${departure.id}`}>Захиалах</Link></article><article className="portal-panel"><h2>Маршрут</h2><p>{tour.description}</p><Link className="secondary-link departure-back" href={`/tours/${tour.slug}`}>Аяллын дэлгэрэнгүй</Link></article></div></section></main>;
}
