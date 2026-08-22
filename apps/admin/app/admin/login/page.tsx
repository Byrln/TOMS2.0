import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signInStaff } from "./actions";
import { getServerI18n } from "@/lib/i18n";

export default async function StaffLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const { error, reset } = await searchParams;
  const { t } = await getServerI18n();
  const errorMessage = error === "invalid_link" ? t("auth.invalidLink") : error === "configuration" ? t("auth.configurationMissing") : error;
  return <AuthCard title={t("auth.staffSignIn")} description={t("auth.staffDescription")} footer={<span>{t("auth.travelerQuestion")} <a href="http://localhost:3001/login">{t("auth.openTravelerPortal")}</a></span>}>
    {errorMessage ? <p className="auth-message auth-message--error" role="alert">{errorMessage}</p> : null}
    {reset ? <p className="auth-message auth-message--success">{t("auth.resetSuccess")}</p> : null}
    <form action={signInStaff} className="auth-form">
      <label>{t("auth.email")}<input name="email" type="email" autoComplete="email" required placeholder="name@company.mn" /></label>
      <label>{t("auth.password")}<input name="password" type="password" autoComplete="current-password" required /></label>
      <div className="auth-form__row"><label className="auth-check"><input type="checkbox" name="remember" /> {t("auth.remember")}</label><Link href="/admin/forgot-password">{t("auth.forgotPassword")}</Link></div>
      <button type="submit">{t("auth.signIn")}</button>
    </form>
  </AuthCard>;
}
