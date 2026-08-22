import Link from "next/link";
import { Compass } from "lucide-react";
import { LocaleSwitcher } from "@toms/admin-ui";
import { getServerI18n } from "@/lib/i18n";

export async function AuthCard({ title, description, children, footer }: { title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const { t } = await getServerI18n();
  return <main className="auth-shell">
    <section className="auth-story" aria-label={t("admin.platformLabel")}>
      <div className="auth-story__brand"><span><Compass size={24} /></span><strong>TOMS</strong></div>
      <div><p>{t("app.operationsOs")}</p><h1>{t("app.sloganUnified")}<br />{t("app.sloganTrusted")}<br />{t("app.sloganGlobal")}</h1></div>
    </section>
    <section className="auth-panel">
      <div className="auth-locale"><LocaleSwitcher /></div>
      <div className="auth-card">
        <Link href="/" className="auth-card__mark"><Compass size={20} /> {t("admin.portalLabel")}</Link>
        <h2>{title}</h2><p>{description}</p>
        {children}
        {footer ? <footer>{footer}</footer> : null}
      </div>
    </section>
  </main>;
}
