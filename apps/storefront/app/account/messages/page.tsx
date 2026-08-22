import Link from "next/link";
import { getServerI18n } from "@/lib/i18n";
export default async function MessagesPage(){const { t }=await getServerI18n();return <main className="claim-shell"><section className="claim-card"><p className="claim-eyebrow">{t("portal.messages")}</p><h1>{t("portal.messages")}</h1><p>{t("portal.messagesDescription")}</p><Link className="primary-link" href="/contact">{t("portal.contactSupport")}</Link></section></main>}
