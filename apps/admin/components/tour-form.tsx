"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@toms/i18n/react";
import { adminApiFetch } from "@/lib/api-client";

export function TourForm() {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true); setError("");
    const body = {
      name: { mn: String(formData.get("nameMn")), en: String(formData.get("nameEn")) }, slug: String(formData.get("slug")),
      summary: { mn: String(formData.get("summaryMn")), en: String(formData.get("summaryEn")) },
      description: { mn: String(formData.get("descriptionMn")), en: String(formData.get("descriptionEn")) },
      durationDays: Number(formData.get("durationDays")), durationNights: Number(formData.get("durationNights")),
      basePriceMinor: Number(formData.get("basePriceMinor")), currency: String(formData.get("currency")),
      destinations: String(formData.get("destinations")).split(",").map((item) => item.trim()).filter(Boolean),
      category: "ADVENTURE",
      languages: ["mn", "en"],
    };
    const response = await adminApiFetch("/api/v1/admin/tours", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(body) });
    if (!response.ok) { const result = await response.json() as { error?: { message?: string } }; setError(result.error?.message ?? t("admin.createTourError")); setPending(false); return; }
    const tour = await response.json() as { id: string };
    router.push(`/tours/${tour.id}`); router.refresh();
  }
  return <form className="entity-form panel" action={(formData) => void submit(formData)}><div className="form-section"><h2>{t("admin.generalInformation")}</h2><div className="form-grid"><label>{t("admin.tourName")} · MN<input name="nameMn" required placeholder={t("admin.namePlaceholderMn")} /></label><label>{t("admin.tourName")} · EN<input name="nameEn" required placeholder={t("admin.namePlaceholderEn")} /></label><label>{t("admin.slug")}<input name="slug" required pattern="[a-z0-9-]+" placeholder="altai-eagle-journey" /></label><label>{t("admin.destinations")}<input name="destinations" placeholder="Bayan-Ulgii, Altai" required /></label><label>{t("admin.shortDescription")} · MN<input name="summaryMn" required placeholder={t("admin.summaryPlaceholderMn")} /></label><label>{t("admin.shortDescription")} · EN<input name="summaryEn" required placeholder={t("admin.summaryPlaceholderEn")} /></label><label>{t("admin.description")} · MN<textarea name="descriptionMn" required placeholder={t("admin.descriptionPlaceholderMn")} /></label><label>{t("admin.description")} · EN<textarea name="descriptionEn" required placeholder={t("admin.descriptionPlaceholderEn")} /></label></div></div><div className="form-section"><h2>{t("admin.durationAndPrice")}</h2><div className="form-grid form-grid--four"><label>{t("admin.days")}<input name="durationDays" type="number" min="1" defaultValue="7" required /></label><label>{t("admin.nights")}<input name="durationNights" type="number" min="0" defaultValue="6" required /></label><label>{t("admin.basePrice")}<input name="basePriceMinor" type="number" min="0" required /></label><label>{t("admin.currency")}<select name="currency" defaultValue="MNT"><option>MNT</option><option>USD</option></select></label></div></div>{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="form-actions"><button className="button button--primary" type="submit" disabled={pending}>{pending ? t("admin.creating") : t("admin.createTour")}</button></div></form>;
}
