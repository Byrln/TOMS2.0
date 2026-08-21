import type { MetadataRoute } from "next";
import { getTours } from "@/lib/api";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_STOREFRONT_URL??"http://localhost:3001";const tours=await getTours();return[{url:base,changeFrequency:"weekly",priority:1},{url:`${base}/tours`,changeFrequency:"daily",priority:.9},{url:`${base}/promotions`,changeFrequency:"weekly",priority:.7},...tours.map((tour)=>({url:`${base}/tours/${tour.slug}`,changeFrequency:"weekly" as const,priority:.8}))]}

