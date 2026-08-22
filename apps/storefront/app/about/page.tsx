import Link from "next/link";
import { ArrowRight, Compass, HandHeart, UsersRound } from "lucide-react";
import { Button } from "@toms/storefront-ui";
import { CmsBlocks, type CmsPageData } from "@/components/cms-blocks";
import { getCmsPage } from "@/lib/api";

export const dynamic = "force-dynamic";
export default async function AboutPage() { const page = await getCmsPage<CmsPageData>("about"); return <main><CmsBlocks page={page} /><section className="section values-section"><div className="page-container"><header className="section-header"><div><p className="section-eyebrow">WHAT GUIDES US</p><h2>Travel with depth, warmth and care</h2></div></header><div className="value-grid"><article><Compass /><h3>Local perspective</h3><p>Journeys shaped with people who know each place personally.</p></article><article><UsersRound /><h3>Small by design</h3><p>Human-scale groups make room for genuine encounters.</p></article><article><HandHeart /><h3>Operational care</h3><p>The detail is handled before it becomes your concern.</p></article></div></div></section><section className="section final-cta"><div className="page-container"><h2>Come see the world with us</h2><Button size="lg" render={<Link href="/tours" />}>Explore journeys<ArrowRight /></Button></div></section></main>; }
