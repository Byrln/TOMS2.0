import { MailCheck, ShieldCheck } from "lucide-react";
import { requestTripClaim } from "./actions";
import { getServerI18n } from "@/lib/i18n";

export default async function TravelerLoginPage({ searchParams }: { searchParams: Promise<{ email?: string; booking?: string; sent?: string; error?: string }> }) {
  const { email = "", booking = "", sent, error } = await searchParams;
  const { t } = await getServerI18n();
  const errorMessage = error === "invalid_link" ? t("auth.invalidLink") : error === "configuration" ? t("auth.configurationMissing") : error;
  return <main className="claim-shell"><section className="claim-card"><span className="claim-icon"><MailCheck size={27} /></span><p className="claim-eyebrow">{t("portal.travelerPortal")}</p><h1>{t("portal.claimTitle")}</h1><p>{t("portal.claimLongDescription")}</p>
    {sent ? <div className="claim-message claim-message--success" role="status">{t("portal.linkSent", { email })}</div> : null}
    {errorMessage ? <div className="claim-message claim-message--error" role="alert">{errorMessage}</div> : null}
    <form action={requestTripClaim} className="claim-form"><input type="hidden" name="bookingId" value={booking} /><label>{t("portal.verifiedEmail")}<input name="email" type="email" defaultValue={email} autoComplete="email" required placeholder="traveler@example.com" /></label><button type="submit">{t("portal.getMagicLink")}</button></form>
    <div className="claim-trust"><ShieldCheck size={16} /> {t("portal.securitySummary")}</div>
  </section></main>;
}
