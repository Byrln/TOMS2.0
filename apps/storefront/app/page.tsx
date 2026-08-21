import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { TourCard, TrustStrip } from "@toms/storefront-ui";
import { getBootstrap } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getBootstrap();
  const hero = data.featuredTours[3] ?? data.featuredTours[0];
  if (!hero) return null;
  return (
    <main>
      <section className="hero">
        <Image
          src={hero.heroImageUrl}
          alt={hero.name}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="hero__content">
          <h1>Дэлхийг өөрийнхөөрөө мэдэр</h1>
          <p>
            Мэргэжлийн багийн бэлтгэсэн, баталгаатай олон өдрийн аяллаар
            дараагийн түүхээ эхлүүл.
          </p>
          <div className="hero__actions">
            <Link className="primary-link" href="/tours">
              Аяллаа хайх <ArrowRight size={16} />
            </Link>
            <Link className="secondary-link" href="/about">
              Бидний тухай
            </Link>
          </div>
        </div>
      </section>
      <form className="search-panel" action="/tours">
        <label className="field">
          <span>Хаашаа явах вэ?</span>
          <input name="q" placeholder="Жишээ: Япон, Говь, Европ" />
        </label>
        <label className="field">
          <span>Хэзээ явах вэ?</span>
          <input type="month" name="month" defaultValue="2026-10" />
        </label>
        <label className="field">
          <span>Аяллын төрөл</span>
          <select name="type">
            <option>Бүх аялал</option>
            <option>Адал явдал</option>
            <option>Соёлын аялал</option>
          </select>
        </label>
        <button type="submit">
          <Search size={15} /> Хайх
        </button>
      </form>
      <section className="section">
        <div className="page-container">
          <header className="section-header">
            <div>
              <h2>Онцлох аяллууд</h2>
              <p>
                Баталгаатай гаралт, ойлгомжтой үнэ, мэргэжлийн зохион
                байгуулалт.
              </p>
            </div>
            <Link href="/tours">Бүгдийг харах →</Link>
          </header>
          <div className="tour-grid">
            {data.featuredTours.slice(0, 4).map((tour) => (
              <TourCard
                key={tour.id}
                tour={{
                  slug: tour.slug,
                  name: tour.name,
                  summary: tour.summary,
                  heroImageUrl: tour.heroImageUrl,
                  durationDays: tour.durationDays,
                  priceMinor: tour.basePriceMinor,
                  currency: tour.currency,
                }}
              />
            ))}
          </div>
        </div>
      </section>
      <TrustStrip />
      <section className="section">
        <div className="page-container promo-banner">
          <div>
            <h2>Эрт захиалбал илүү ашигтай</h2>
            <p>
              Төлөвлөгөөгөө эрт баталгаажуулж, сонгосон departure дээрх бодит
              урамшууллыг эдэл.
            </p>
            <Link className="primary-link" href="/promotions">
              Урамшуулал харах
            </Link>
          </div>
          <div className="promo-codes">
            {data.storefront.promotions.map((promotion) => (
              <div className="promo-code" key={promotion.id}>
                <strong>{promotion.code}</strong>
                <span>
                  {promotion.name} · {promotion.benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
