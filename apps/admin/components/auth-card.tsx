import Link from "next/link";
import { Compass } from "lucide-react";

export function AuthCard({ title, description, children, footer }: { title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return <main className="auth-shell">
    <section className="auth-story" aria-label="TOMS platform">
      <div className="auth-story__brand"><span><Compass size={24} /></span><strong>TOMS</strong></div>
      <div><p>TRAVEL OPERATIONS OS</p><h1>Нэгдсэн ажиллагаа.<br />Үнэн зөв мэдээлэл.<br />Дэлхийн хэмжээнд.</h1></div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <Link href="/" className="auth-card__mark"><Compass size={20} /> TOMS Admin</Link>
        <h2>{title}</h2><p>{description}</p>
        {children}
        {footer ? <footer>{footer}</footer> : null}
      </div>
    </section>
  </main>;
}
