import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { getTour } from "@/lib/api";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tour = await getTour(slug);
    return {
      title: tour.name,
      description: tour.summary,
      alternates: { canonical: `/tours/${tour.slug}` },
      openGraph: { images: [tour.heroImageUrl] },
    };
  } catch {
    return { title: "Аялал" };
  }
}

export default async function TourDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let tour;
  try {
    tour = await getTour(slug);
  } catch {
    notFound();
  }
  const first = tour.departures[0];
  return (
    <main>
      <section className="detail-hero">
        <Image
          src={tour.heroImageUrl}
          alt={tour.name}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="detail-hero__content">
          <span>{tour.destinations.join(" · ")}</span>
          <h1>{tour.name}</h1>
          <p>{tour.summary}</p>
        </div>
      </section>
      <div className="page-container detail-layout">
        <div className="detail-content">
          <section className="detail-section">
            <h2>Аяллын тухай</h2>
            <p>{tour.description}</p>
            <ul>
              {tour.highlights.map((item: string) => (
                <li key={item}>
                  <Check size={14} /> {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="detail-section">
            <h2>Маршрут</h2>
            {Array.from({ length: tour.durationDays }, (_, index) => (
              <div className="trip-event" key={index}>
                <time>Өдөр {index + 1}</time>
                <h3>
                  {index === 0
                    ? "Уулзах ба аялал эхлэх"
                    : index === tour.durationDays - 1
                      ? "Буцах өдөр"
                      : `${tour.destinations[index % tour.destinations.length] ?? "Destination"} танилцах`}
                </h3>
                <p>
                  <MapPin size={12} /> Мэргэжлийн хөтөчтэй өдрийн хөтөлбөр
                </p>
              </div>
            ))}
          </section>
          <section className="detail-section">
            <h2>Багтсан үйлчилгээ</h2>
            <ul>
              {tour.inclusions.map((item: string) => (
                <li key={item}>
                  <Check size={14} /> {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="detail-section" id="departures">
            <h2>Гарах огноо ба үнэ</h2>
            {tour.departures.length === 0 ? (
              <p>Шинэ гарах огноо удахгүй нийтлэгдэнэ.</p>
            ) : (
              tour.departures.map((departure) => (
                <div className="departure-card" key={departure.id}>
                  <strong>
                    {departure.startsOn} → {departure.endsOn}
                  </strong>
                  <span>
                    {departure.confirmedCount} / {departure.capacity} захиалсан
                    ·{" "}
                    {formatCurrencyMinor(
                      departure.priceMinor,
                      departure.currency,
                    )}
                  </span>
                  <Link href={`/checkout/${departure.id}`}>Сонгох</Link>
                </div>
              ))
            )}
          </section>
        </div>
        <aside className="booking-card">
          <p>Нэг хүнээс</p>
          <strong>
            {formatCurrencyMinor(
              first?.priceMinor ?? tour.basePriceMinor,
              tour.currency,
            )}
          </strong>
          <ul>
            <li>
              <Clock3 size={13} /> {tour.durationDays} өдөр /{" "}
              {tour.durationNights} шөнө
            </li>
            <li>
              <ShieldCheck size={13} /> Баталгаатай төлбөр
            </li>
            <li>
              <MapPin size={13} /> {tour.destinations.join(", ")}
            </li>
          </ul>
          <Link
            className="primary-link"
            href={first ? `/checkout/${first.id}` : "#departures"}
          >
            Огноо сонгох
          </Link>
        </aside>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: tour.name,
            description: tour.summary,
            image: tour.heroImageUrl,
            itinerary: tour.destinations,
          }),
        }}
      />
    </main>
  );
}
