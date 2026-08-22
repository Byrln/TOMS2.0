import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { getTour } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";
import { intlLocale } from "@toms/i18n";

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
    const { t } = await getServerI18n();
    return { title: t("tours.tour") };
  }
}

export default async function TourDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, t } = await getServerI18n();
  const currencyLocale = intlLocale(locale);
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
            <h2>{t("tour.about")}</h2>
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
            <h2>{t("tours.itinerary")}</h2>
            {Array.from({ length: tour.durationDays }, (_, index) => (
              <div className="trip-event" key={index}>
                <time>{t("tour.day", { count: index + 1 })}</time>
                <h3>
                  {index === 0
                    ? t("tour.meetAndStart")
                    : index === tour.durationDays - 1
                      ? t("tour.returnDay")
                      : t("tour.exploreDestination", { destination: tour.destinations[index % tour.destinations.length] ?? "Destination" })}
                </h3>
                <p>
                  <MapPin size={12} /> {t("tour.guidedProgram")}
                </p>
              </div>
            ))}
          </section>
          <section className="detail-section">
            <h2>{t("tour.included")}</h2>
            <ul>
              {tour.inclusions.map((item: string) => (
                <li key={item}>
                  <Check size={14} /> {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="detail-section" id="departures">
            <h2>{t("tour.departuresAndPrices")}</h2>
            {tour.departures.length === 0 ? (
              <p>{t("tour.noDepartures")}</p>
            ) : (
              tour.departures.map((departure) => (
                <div className="departure-card" key={departure.id}>
                  <strong>
                    {departure.startsOn} → {departure.endsOn}
                  </strong>
                  <span>
                    {t("tour.booked", { confirmed: departure.confirmedCount, capacity: departure.capacity })}
                    ·{" "}
                    {formatCurrencyMinor(
                      departure.priceMinor,
                      departure.currency,
                      currencyLocale,
                    )}
                  </span>
                  <Link href={`/checkout/${departure.id}`}>{t("tour.select")}</Link>
                </div>
              ))
            )}
          </section>
        </div>
        <aside className="booking-card">
          <p>{t("tour.fromPerPerson")}</p>
          <strong>
            {formatCurrencyMinor(
              first?.priceMinor ?? tour.basePriceMinor,
              tour.currency,
              currencyLocale,
            )}
          </strong>
          <ul>
            <li>
              <Clock3 size={13} /> {t("common.days", { count: tour.durationDays })} /{" "}
              {t("common.nights", { count: tour.durationNights })}
            </li>
            <li>
              <ShieldCheck size={13} /> {t("tour.securePayment")}
            </li>
            <li>
              <MapPin size={13} /> {tour.destinations.join(", ")}
            </li>
          </ul>
          <Link
            className="primary-link"
            href={first ? `/checkout/${first.id}` : "#departures"}
          >
            {t("tour.chooseDate")}
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
