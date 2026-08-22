import Link from "next/link";
import { getServerI18n } from "@/lib/i18n";
export default async function ProfilePage(){const { t }=await getServerI18n();return <main className="claim-shell"><section className="claim-card"><p className="claim-eyebrow">{t("portal.profile")}</p><h1>{t("portal.profile")}</h1><p>{t("portal.profileDescription")}</p><Link className="primary-link" href="/account/trips">{t("nav.myTrips")}</Link></section></main>}
