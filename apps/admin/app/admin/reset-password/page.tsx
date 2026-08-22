import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { resetStaffPassword } from "../login/actions";
import { getServerI18n } from "@/lib/i18n";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { t } = await getServerI18n();
  return <AuthCard title={t("auth.newPassword")} description={t("auth.newPasswordDescription")} footer={<Link href="/admin/login">{t("auth.backToSignIn")}</Link>}>
    {error ? <p className="auth-message auth-message--error" role="alert">{error}</p> : null}
    <form action={resetStaffPassword} className="auth-form"><label>{t("auth.newPassword")}<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><label>{t("auth.confirmPassword")}<input name="confirmation" type="password" autoComplete="new-password" minLength={12} required /></label><button type="submit">{t("auth.updatePassword")}</button></form>
  </AuthCard>;
}
