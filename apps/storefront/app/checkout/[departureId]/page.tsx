import { CheckoutForm } from "@/components/checkout-form";
import { getCheckoutContext } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export default async function CheckoutPage({ params }: {params:Promise<{departureId:string}>}) { const {departureId}=await params; const [context,{ t }] = await Promise.all([getCheckoutContext(departureId),getServerI18n()]); return <main className="checkout-page"><div className="page-container"><div className="checkout-stepper"><span className="is-active">{t("checkout.stepDeparture")}</span><span className="is-active">{t("checkout.stepTravelers")}</span><span>{t("checkout.stepPayment")}</span><span>{t("checkout.stepConfirmation")}</span></div><CheckoutForm context={context} /></div></main>; }
