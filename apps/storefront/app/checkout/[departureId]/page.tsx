import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { getTours } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export default async function CheckoutPage({ params }: {params:Promise<{departureId:string}>}) { const {departureId}=await params; const tours=await getTours(); const { t } = await getServerI18n(); const tour=tours.find((item)=>item.departures.some((departure)=>departure.id===departureId)); const departure=tour?.departures.find((item)=>item.id===departureId); if(!tour||!departure) notFound(); return <main className="checkout-page"><div className="page-container"><div className="checkout-stepper"><span className="is-active">{t("checkout.stepDeparture")}</span><span className="is-active">{t("checkout.stepTravelers")}</span><span className="is-active">{t("checkout.stepContact")}</span><span className="is-active">{t("checkout.stepPayment")}</span><span>{t("checkout.stepConfirmation")}</span></div><CheckoutForm tour={tour} departure={departure} /></div></main>; }
