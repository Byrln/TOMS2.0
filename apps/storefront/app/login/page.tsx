import { MailCheck, ShieldCheck } from "lucide-react";
import { requestTripClaim } from "./actions";
import { getServerI18n } from "@/lib/i18n";
import Link from "next/link";
import { Button, Field, FieldDescription, FieldLabel, Input } from "@toms/storefront-ui";

export default async function TravelerLoginPage({ searchParams }: { searchParams: Promise<{ email?: string; booking?: string; sent?: string; error?: string }> }) {
  const { email = "", booking = "", sent, error } = await searchParams;
  const { t } = await getServerI18n();
  const errorMessage = error === "invalid_link" ? t("auth.invalidLink") : error === "configuration" ? t("auth.configurationMissing") : error;
  return <main className="claim-shell"><section className="claim-card"><span className="claim-icon"><MailCheck size={27} /></span><p className="claim-eyebrow">{t("portal.travelerPortal")}</p><h1>{t("portal.claimTitle")}</h1><p>{t("portal.claimLongDescription")}</p>
    {sent ? <div className="claim-message claim-message--success" role="status">{t("portal.linkSent", { email })}</div> : null}
    {errorMessage ? <div className="claim-message claim-message--error" role="alert">{errorMessage}</div> : null}
    <form action={requestTripClaim} className="claim-form"><Input type="hidden" name="bookingId" value={booking} /><Field><FieldLabel htmlFor="claim-email">{t("portal.verifiedEmail")}</FieldLabel><Input id="claim-email" name="email" type="email" defaultValue={email} autoComplete="email" required placeholder="traveler@example.com" /><FieldDescription>Use the email attached to your booking.</FieldDescription></Field><Button type="submit">{t("portal.getMagicLink")}</Button></form>
    {process.env.TOMS_DEMO_MODE === "1" ? <Button variant="outline" render={<Link href="/account" />}>Open demo traveler portal</Button> : null}
    <div className="claim-trust"><ShieldCheck size={16} /> {t("portal.securitySummary")}</div>
  </section></main>;
}
