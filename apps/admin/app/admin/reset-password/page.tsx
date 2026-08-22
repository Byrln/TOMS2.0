import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { resetStaffPassword } from "../login/actions";
import { getServerI18n } from "@/lib/i18n";
import { Button, Field, FieldDescription, FieldLabel, Input } from "@toms/admin-ui";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { t } = await getServerI18n();
  return <AuthCard title={t("auth.newPassword")} description={t("auth.newPasswordDescription")} footer={<Link href="/admin/login">{t("auth.backToSignIn")}</Link>}>
    {error ? <p className="auth-message auth-message--error" role="alert">{error}</p> : null}
    <form action={resetStaffPassword} className="auth-form"><Field><FieldLabel htmlFor="password">{t("auth.newPassword")}</FieldLabel><Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required /><FieldDescription>12+ characters with a number and symbol</FieldDescription></Field><Field><FieldLabel htmlFor="confirmation">{t("auth.confirmPassword")}</FieldLabel><Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} required /></Field><Button type="submit">{t("auth.updatePassword")}</Button></form>
  </AuthCard>;
}
