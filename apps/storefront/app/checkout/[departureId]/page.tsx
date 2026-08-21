import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { getTours } from "@/lib/api";

export const dynamic = "force-dynamic";
export default async function CheckoutPage({ params }: {params:Promise<{departureId:string}>}) { const {departureId}=await params; const tours=await getTours(); const tour=tours.find((item)=>item.departures.some((departure)=>departure.id===departureId)); const departure=tour?.departures.find((item)=>item.id===departureId); if(!tour||!departure) notFound(); return <main className="checkout-page"><div className="page-container"><div className="checkout-stepper"><span className="is-active">1 Гаралт</span><span className="is-active">2 Аялагчид</span><span className="is-active">3 Холбоо барих</span><span className="is-active">4 Төлбөр</span><span>5 Баталгаажуулалт</span></div><CheckoutForm tour={tour} departure={departure} /></div></main>; }

