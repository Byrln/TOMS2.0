import Link from "next/link";
import { MailCheck, ShieldCheck } from "lucide-react";
import { requestTripClaim } from "./actions";

export default async function TravelerLoginPage({ searchParams }: { searchParams: Promise<{ email?: string; booking?: string; sent?: string; error?: string }> }) {
  const { email = "", booking = "", sent, error } = await searchParams;
  return <main className="claim-shell"><section className="claim-card"><span className="claim-icon"><MailCheck size={27} /></span><p className="claim-eyebrow">TRAVELER PORTAL</p><h1>Аяллаа claim хийх</h1><p>Захиалга хийхэд ашигласан баталгаатай имэйлээр magic link авна. Booking ID дангаараа аялал нээх эрх болохгүй.</p>
    {sent ? <div className="claim-message claim-message--success" role="status">{email} рүү аюулгүй холбоос илгээлээ.</div> : null}
    {error ? <div className="claim-message claim-message--error" role="alert">{error}</div> : null}
    <form action={requestTripClaim} className="claim-form"><input type="hidden" name="bookingId" value={booking} /><label>Баталгаатай имэйл<input name="email" type="email" defaultValue={email} autoComplete="email" required placeholder="traveler@example.com" /></label><button type="submit">Magic link авах</button></form>
    <div className="claim-trust"><ShieldCheck size={16} /> Verified email · Secure session · Authorized trips only</div>
    <Link className="claim-demo" href={`/account/trips?email=${encodeURIComponent(email || "bat@example.com")}`}>Demo traveler portal нээх</Link>
  </section></main>;
}
