import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { sendStaffRecovery } from "../login/actions";
import { getServerI18n } from "@/lib/i18n";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  const { t } = await getServerI18n();
  return <AuthCard title={t("auth.recoverTitle")} description={t("auth.recoverDescription")} footer={<Link href="/admin/login">{t("auth.backToSignIn")}</Link>}>
    {sent ? <p className="auth-message auth-message--success" role="status">{t("auth.recoverSent")}</p> : null}
    <form action={sendStaffRecovery} className="auth-form"><label>{t("auth.email")}<input name="email" type="email" autoComplete="email" required /></label><button type="submit">{t("auth.getRecoveryLink")}</button></form>
  </AuthCard>;
}
