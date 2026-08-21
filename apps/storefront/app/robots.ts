import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:"*",allow:["/","/tours/","/promotions","/about","/contact"],disallow:["/checkout/","/booking-confirmation/","/trips/"]}],sitemap:"http://localhost:3001/sitemap.xml"}}

