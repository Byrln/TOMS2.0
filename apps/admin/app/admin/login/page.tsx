import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signInStaff } from "./actions";

export default async function StaffLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const { error, reset } = await searchParams;
  return <AuthCard title="Системд нэвтрэх" description="Байгууллагын staff эрхээр аюулгүй нэвтэрнэ үү." footer={<span>Аялагч уу? <a href="http://localhost:3001/login">Traveler portal руу очих</a></span>}>
    {error ? <p className="auth-message auth-message--error" role="alert">{error}</p> : null}
    {reset ? <p className="auth-message auth-message--success">Нууц үг шинэчлэгдлээ.</p> : null}
    <form action={signInStaff} className="auth-form">
      <label>Имэйл<input name="email" type="email" autoComplete="email" required placeholder="name@company.mn" /></label>
      <label>Нууц үг<input name="password" type="password" autoComplete="current-password" required /></label>
      <div className="auth-form__row"><label className="auth-check"><input type="checkbox" name="remember" /> Сануулах</label><Link href="/admin/forgot-password">Нууц үгээ мартсан?</Link></div>
      <button type="submit">Нэвтрэх</button>
    </form>
    <Link className="auth-demo" href="/?demo=1">Demo admin нээх</Link>
  </AuthCard>;
}
