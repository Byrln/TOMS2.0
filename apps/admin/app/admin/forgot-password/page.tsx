import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { sendStaffRecovery } from "../login/actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  return <AuthCard title="Нууц үг сэргээх" description="Бүртгэлтэй имэйл рүү нэг удаагийн аюулгүй холбоос илгээнэ." footer={<Link href="/admin/login">Нэвтрэх рүү буцах</Link>}>
    {sent ? <p className="auth-message auth-message--success" role="status">Хэрэв бүртгэл байгаа бол сэргээх холбоос илгээгдлээ.</p> : null}
    <form action={sendStaffRecovery} className="auth-form"><label>Имэйл<input name="email" type="email" autoComplete="email" required /></label><button type="submit">Сэргээх холбоос авах</button></form>
  </AuthCard>;
}
