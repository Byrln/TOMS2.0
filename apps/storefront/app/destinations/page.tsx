import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@toms/storefront-ui";
import { getDestinations } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export default async function DestinationsPage() {
  const [data, { t }] = await Promise.all([getDestinations("page=1&pageSize=20"), getServerI18n()]); const featured = data.items.find((item) => item.featured) ?? data.items[0];
  return <main><header className="destination-hero">{featured ? <Image src={featured.image.url} alt={featured.image.alt} fill priority sizes="100vw" /> : null}<div><p className="section-eyebrow">WHERE NEXT?</p><h1>{t("nav.destinations")}</h1><p>From Mongolia’s wide horizons to the world’s great cities, explore places through local perspective.</p></div></header><section className="section"><div className="page-container"><div className="destination-toolbar"><span><Compass /> {data.page.total} destinations</span><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All regions</SelectItem>{data.regions.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent></Select></div><div className="destination-grid destination-grid--all">{data.items.map((destination, index) => <Link className={index % 5 === 0 ? "destination-card destination-card--featured" : "destination-card"} key={destination.id} href={`/destinations/${destination.slug}`}><Image src={destination.image.url} alt={destination.image.alt} fill sizes="(max-width: 768px) 90vw, 33vw" /><span><small>{destination.region}</small><strong>{destination.name}</strong><em>{destination.tourCount} journeys</em></span></Link>)}</div></div></section><section className="section final-cta"><div className="page-container"><p className="section-eyebrow">TAILORED TO YOU</p><h2>Not sure where to begin?</h2><p>Share how you want to feel, and we’ll suggest the right place.</p><Button size="lg" render={<Link href="/contact" />}>Talk to a journey designer<ArrowRight /></Button></div></section></main>;
}
