"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TourCard } from "@toms/storefront-ui";
import type { Tour } from "@/lib/api";

export function TourExplorer({ tours }: { tours: Tour[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.toLowerCase());
  const filtered = useMemo(() => tours.filter((tour) => [tour.name, tour.summary, ...tour.destinations].join(" ").toLowerCase().includes(deferred)), [deferred, tours]);
  return <><div className="filter-bar"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Хаашаа аялах вэ?" aria-label="Аялал хайх" /><span>{filtered.length} аялал</span></div><div className="tour-list-layout"><aside className="filter-rail"><h3>Аяллын төрөл</h3>{["Соёлын аялал","Адал явдал","Байгалийн аялал","Гэр бүлийн","Luxury"].map((label) => <label key={label}><input type="checkbox" /> {label}</label>)}</aside><section className="tour-list-grid">{filtered.map((tour) => <TourCard key={tour.id} tour={{ slug:tour.slug,name:tour.name,summary:tour.summary,heroImageUrl:tour.heroImageUrl,durationDays:tour.durationDays,priceMinor:tour.basePriceMinor,currency:tour.currency }} />)}</section></div></>;
}

