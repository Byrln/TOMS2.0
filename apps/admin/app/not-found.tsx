import Link from "next/link";
import { getServerI18n } from "@/lib/i18n";
export default async function NotFound() { const { t } = await getServerI18n(); return <main className="error-state"><h1>{t("state.notFoundTitle")}</h1><p>{t("state.adminNotFoundDescription")}</p><Link className="button button--primary" href="/">{t("nav.dashboard")}</Link></main>; }
