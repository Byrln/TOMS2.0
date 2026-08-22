import Link from "next/link";
import { getServerI18n } from "@/lib/i18n";
export default async function NotFound() { const { t } = await getServerI18n(); return <main className="empty-state"><h1>{t("state.notFoundTitle")}</h1><p>{t("state.notFoundDescription")}</p><Link className="primary-link" href="/tours">{t("state.viewTours")}</Link></main>; }
