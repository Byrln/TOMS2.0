import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell, PageHeader } from "@toms/admin-ui";
import type { ReactNode } from "react";
import type { TranslationKey } from "@toms/i18n";
import { getServerI18n } from "@/lib/i18n";

export async function AdminRouteFrame({ activePath, titleKey, descriptionKey, actionKey, actionHref, children }: {
  activePath: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  actionKey?: TranslationKey;
  actionHref?: string;
  children: ReactNode;
}) {
  const { t } = await getServerI18n();
  const actions = actionKey && actionHref ? <>
    <Link className="button button--ghost" href={`${activePath}?export=csv`}>{t("admin.export")}</Link>
    <Link className="button button--primary" href={actionHref}><Plus size={14} /> {t(actionKey)}</Link>
  </> : undefined;
  return <AdminShell activePath={activePath}>
    <PageHeader eyebrow={activePath === "/" ? t("app.operationsOs") : t("admin.workspace")} title={t(titleKey)} description={t(descriptionKey)} actions={actions} />
    {children}
  </AdminShell>;
}
