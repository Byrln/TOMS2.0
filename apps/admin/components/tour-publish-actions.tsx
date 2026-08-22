"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@toms/i18n/react";
import { adminApiFetch } from "@/lib/api-client";
export function TourPublishActions({tourId,status}:{tourId:string;status:string}){const router=useRouter();const { t }=useLocale();const [pending,setPending]=useState(false);async function publish(){setPending(true);const response=await adminApiFetch(`/api/v1/admin/tours/${tourId}/publish`,{method:"POST"});setPending(false);if(response.ok)router.refresh()}return <div className="page-header__actions"><Link className="button button--secondary" href={`/departures/new?tourId=${tourId}`}>{t("admin.addDeparture")}</Link><button className="button button--primary" onClick={()=>void publish()} disabled={pending||status==="PUBLISHED"}>{status==="PUBLISHED"?t("admin.published"):pending?t("admin.publishing"):t("admin.publishTour")}</button></div>}
