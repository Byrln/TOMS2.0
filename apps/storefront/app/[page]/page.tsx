import { notFound } from "next/navigation";
import { getServerI18n } from "@/lib/i18n";
import type { TranslationKey } from "@toms/i18n";

const content: Record<string,{title:TranslationKey;description:TranslationKey;body:TranslationKey}>={
  destinations:{title:"content.destinationsTitle",description:"content.destinationsDescription",body:"content.destinationsBody"},
  about:{title:"nav.about",description:"content.aboutDescription",body:"content.aboutBody"},
  contact:{title:"nav.contact",description:"content.contactDescription",body:"content.contactBody"},
  account:{title:"portal.claimTitle",description:"portal.claimDescription",body:"portal.claimLongDescription"}
};
export default async function ContentPage({params}:{params:Promise<{page:string}>}){const {page}=await params;const { t }=await getServerI18n();const selected=content[page];if(!selected)notFound();return <main><header className="page-hero"><div><h1>{t(selected.title)}</h1><p>{t(selected.description)}</p></div></header><section className="section"><div className="page-container"><article className="portal-panel"><p>{t(selected.body)}</p></article></div></section></main>}
