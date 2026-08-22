"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@toms/i18n/react";
import { adminApiFetch } from "@/lib/api-client";
import { Button, Field, FieldLabel, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@toms/admin-ui";

export function DepartureForm({ tours, selectedTourId = "" }: { tours: Array<{ id:string; name:string }>; selectedTourId?: string }) {
  const router=useRouter(); const [error,setError]=useState(""); const [pending,setPending]=useState(false);
  const { t }=useLocale();
  async function submit(formData:FormData){setPending(true);setError("");const body={tourId:String(formData.get("tourId")),code:String(formData.get("code")),startsOn:String(formData.get("startsOn")),endsOn:String(formData.get("endsOn")),capacity:Number(formData.get("capacity")),priceMinor:Number(formData.get("priceMinor")),currency:String(formData.get("currency"))};const response=await adminApiFetch("/api/v1/admin/departures",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});if(!response.ok){const result=await response.json() as {error?:{message?:string}};setError(result.error?.message??t("admin.createDepartureError"));setPending(false);return;}router.push(`/tours/${body.tourId}`);router.refresh()}
  const field=(name:string,label:string,type="text",defaultValue="")=><Field><FieldLabel htmlFor={name}>{label}</FieldLabel><Input id={name} name={name} type={type} defaultValue={defaultValue} required /></Field>;
  return <form className="entity-form panel" action={(data)=>void submit(data)}><div className="form-section"><h2>{t("admin.departureInfo")}</h2><div className="form-grid"><Field><FieldLabel>{t("admin.tour")}</FieldLabel><Select name="tourId" defaultValue={selectedTourId}><SelectTrigger><SelectValue placeholder={t("admin.selectTour")} /></SelectTrigger><SelectContent>{tours.map((tour)=><SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>)}</SelectContent></Select></Field>{field("code",t("admin.code"),"text","AEJ-2026-10-03")}{field("startsOn",t("admin.startDate"),"date","2026-10-03")}{field("endsOn",t("admin.endDate"),"date","2026-10-09")}{field("capacity",t("admin.capacity"),"number","16")}{field("priceMinor",t("admin.price"),"number","4250000")}<Field><FieldLabel>{t("admin.currency")}</FieldLabel><Select name="currency" defaultValue="MNT"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MNT">MNT</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></Field></div></div>{error?<p className="form-error" role="alert">{error}</p>:null}<div className="form-actions"><Button type="submit" disabled={pending}>{pending?t("admin.adding"):t("admin.addDeparture")}</Button></div></form>;
}
