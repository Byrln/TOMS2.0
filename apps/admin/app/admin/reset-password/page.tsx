import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { resetStaffPassword } from "../login/actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthCard title="Шинэ нууц үг" description="Доод тал нь 12 тэмдэгттэй нууц үг сонгоно уу." footer={<Link href="/admin/login">Нэвтрэх рүү буцах</Link>}>
    {error ? <p className="auth-message auth-message--error" role="alert">{error}</p> : null}
    <form action={resetStaffPassword} className="auth-form"><label>Шинэ нууц үг<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><label>Давтах<input name="confirmation" type="password" autoComplete="new-password" minLength={12} required /></label><button type="submit">Нууц үг шинэчлэх</button></form>
  </AuthCard>;
}
