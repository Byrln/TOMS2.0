import Link from "next/link";
import { MailCheck, MapPinned, ShieldCheck } from "lucide-react";
import { getServerI18n } from "@/lib/i18n";

export default async function AccountPage() {
  const { t } = await getServerI18n();
  return <main><header className="page-hero"><div><h1>{t("portal.myToms")}</h1><p>{t("portal.myTomsDescription")}</p></div></header><section className="section"><div className="page-container account-grid"><article className="portal-panel"><MailCheck /><h2>{t("portal.claimTitle")}</h2><p>{t("portal.claimDescription")}</p><Link className="primary-link" href="/login">{t("portal.getMagicLink")}</Link></article><article className="portal-panel"><MapPinned /><h2>{t("nav.myTrips")}</h2><p>{t("portal.myTripsDescription")}</p><Link className="primary-link" href="/account/trips">{t("portal.openTrips")}</Link></article><article className="portal-panel"><ShieldCheck /><h2>{t("portal.protection")}</h2><p>{t("portal.protectionDescription")}</p></article></div></section></main>;
}
