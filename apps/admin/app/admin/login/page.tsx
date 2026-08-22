import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signInStaff } from "./actions";
import { getServerI18n } from "@/lib/i18n";
import { Button, Checkbox, Field, FieldLabel, Input } from "@toms/admin-ui";

export default async function StaffLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const { error, reset } = await searchParams;
  const { t } = await getServerI18n();
  const errorMessage = error === "invalid_link" ? t("auth.invalidLink") : error === "configuration" ? t("auth.configurationMissing") : error;
  return <AuthCard title={t("auth.staffSignIn")} description={t("auth.staffDescription")} footer={<span>{t("auth.travelerQuestion")} <a href="http://localhost:3001/login">{t("auth.openTravelerPortal")}</a></span>}>
    {errorMessage ? <p className="auth-message auth-message--error" role="alert">{errorMessage}</p> : null}
    {reset ? <p className="auth-message auth-message--success">{t("auth.resetSuccess")}</p> : null}
    <form action={signInStaff} className="auth-form">
      <Field><FieldLabel htmlFor="email">{t("auth.email")}</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" required placeholder="name@company.mn" /></Field>
      <Field><FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
      <div className="auth-form__row"><Field orientation="horizontal"><Checkbox id="remember" name="remember" /><FieldLabel htmlFor="remember">{t("auth.remember")}</FieldLabel></Field><Link href="/admin/forgot-password">{t("auth.forgotPassword")}</Link></div>
      <Button type="submit">{t("auth.signIn")}</Button>
    </form>
  </AuthCard>;
}
