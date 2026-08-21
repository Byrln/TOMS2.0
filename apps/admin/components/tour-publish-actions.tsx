"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
const apiUrl=process.env.NEXT_PUBLIC_API_URL??"http://localhost:4000";
export function TourPublishActions({tourId,status}:{tourId:string;status:string}){const router=useRouter();const [pending,setPending]=useState(false);async function publish(){setPending(true);const response=await fetch(`${apiUrl}/api/v1/admin/tours/${tourId}/publish`,{method:"POST",headers:{"x-demo-role":"OWNER"}});setPending(false);if(response.ok)router.refresh()}return <div className="page-header__actions"><Link className="button button--secondary" href={`/departures/new?tourId=${tourId}`}>Departure нэмэх</Link><button className="button button--primary" onClick={()=>void publish()} disabled={pending||status==="PUBLISHED"}>{status==="PUBLISHED"?"Нийтлэгдсэн":pending?"Нийтэлж байна...":"Аялал нийтлэх"}</button></div>}
