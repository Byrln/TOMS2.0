"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@toms/i18n/react";
import { adminApiFetch } from "@/lib/api-client";

export function DepartureForm({ tours, selectedTourId = "" }: { tours: Array<{ id:string; name:string }>; selectedTourId?: string }) {
  const router=useRouter(); const [error,setError]=useState(""); const [pending,setPending]=useState(false);
  const { t }=useLocale();
  async function submit(formData:FormData){setPending(true);setError("");const body={tourId:String(formData.get("tourId")),code:String(formData.get("code")),startsOn:String(formData.get("startsOn")),endsOn:String(formData.get("endsOn")),capacity:Number(formData.get("capacity")),priceMinor:Number(formData.get("priceMinor")),currency:String(formData.get("currency"))};const response=await adminApiFetch("/api/v1/admin/departures",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});if(!response.ok){const result=await response.json() as {error?:{message?:string}};setError(result.error?.message??t("admin.createDepartureError"));setPending(false);return;}router.push(`/tours/${body.tourId}`);router.refresh()}
  return <form className="entity-form panel" action={(data)=>void submit(data)}><div className="form-section"><h2>{t("admin.departureInfo")}</h2><div className="form-grid"><label>{t("admin.tour")}<select name="tourId" defaultValue={selectedTourId} required><option value="" disabled>{t("admin.selectTour")}</option>{tours.map((tour)=><option key={tour.id} value={tour.id}>{tour.name}</option>)}</select></label><label>{t("admin.code")}<input name="code" defaultValue="AEJ-2026-10-03" required /></label><label>{t("admin.startDate")}<input name="startsOn" type="date" defaultValue="2026-10-03" required /></label><label>{t("admin.endDate")}<input name="endsOn" type="date" defaultValue="2026-10-09" required /></label><label>{t("admin.capacity")}<input name="capacity" type="number" min="1" defaultValue="16" required /></label><label>{t("admin.price")}<input name="priceMinor" type="number" min="0" defaultValue="4250000" required /></label><label>{t("admin.currency")}<select name="currency"><option>MNT</option><option>USD</option></select></label></div></div>{error?<p className="form-error" role="alert">{error}</p>:null}<div className="form-actions"><button className="button button--primary" type="submit" disabled={pending}>{pending?t("admin.adding"):t("admin.addDeparture")}</button></div></form>;
}
