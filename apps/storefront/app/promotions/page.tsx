import { getBootstrap } from "@/lib/api";
export const dynamic="force-dynamic";
export default async function PromotionsPage(){const data=await getBootstrap();return <main><header className="page-hero"><div><h1>Урамшуулал</h1><p>Бодит eligibility, хугацаа, хязгаар дээр ажилладаг TOMS promotions.</p></div></header><section className="section"><div className="page-container promo-banner"><div><h2>Азаа сорьж, хямдрал аваарай</h2><p>Spin wheel бол зөвхөн presentation. Доорх үр ашиг нь нэг promotion rules engine-ээс ирнэ.</p></div><div className="promo-codes">{data.storefront.promotions.map((item)=><div className="promo-code" key={item.id}><strong>{item.code}</strong><span>{item.name} · {item.benefit}</span></div>)}</div></div></section></main>}

