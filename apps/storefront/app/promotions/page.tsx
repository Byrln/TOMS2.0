import { getBootstrap } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";
export const dynamic="force-dynamic";
export default async function PromotionsPage(){const data=await getBootstrap();const { t }=await getServerI18n();return <main><header className="page-hero"><div><h1>{t("nav.promotions")}</h1><p>{t("promotions.publicDescription")}</p></div></header><section className="section"><div className="page-container promo-banner"><div><h2>{t("promotions.spinTitle")}</h2><p>{t("promotions.spinDescription")}</p></div><div className="promo-codes">{data.storefront.promotions.map((item)=><div className="promo-code" key={item.id}><strong>{item.code}</strong><span>{item.name} · {item.benefit}</span></div>)}</div></div></section></main>}
