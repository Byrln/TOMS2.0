"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@toms/i18n/react";
import { adminApiFetch } from "@/lib/api-client";
import { Button, Field, FieldLabel, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@toms/admin-ui";

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
  const field = (name: string, label: string, placeholder: string, type: "text" | "number" = "text", defaultValue?: string) => <Field><FieldLabel htmlFor={name}>{label}</FieldLabel><Input id={name} name={name} type={type} placeholder={placeholder} {...(defaultValue ? { defaultValue } : {})} required /></Field>;
  return <form className="entity-form panel" action={(formData) => void submit(formData)}><div className="form-section"><h2>{t("admin.generalInformation")}</h2><div className="form-grid">{field("nameMn", `${t("admin.tourName")} · MN`, t("admin.namePlaceholderMn"))}{field("nameEn", `${t("admin.tourName")} · EN`, t("admin.namePlaceholderEn"))}{field("slug", t("admin.slug"), "altai-eagle-journey")}{field("destinations", t("admin.destinations"), "Bayan-Ulgii, Altai")}{field("summaryMn", `${t("admin.shortDescription")} · MN`, t("admin.summaryPlaceholderMn"))}{field("summaryEn", `${t("admin.shortDescription")} · EN`, t("admin.summaryPlaceholderEn"))}<Field><FieldLabel htmlFor="descriptionMn">{t("admin.description")} · MN</FieldLabel><Textarea id="descriptionMn" name="descriptionMn" required placeholder={t("admin.descriptionPlaceholderMn")} /></Field><Field><FieldLabel htmlFor="descriptionEn">{t("admin.description")} · EN</FieldLabel><Textarea id="descriptionEn" name="descriptionEn" required placeholder={t("admin.descriptionPlaceholderEn")} /></Field></div></div><div className="form-section"><h2>{t("admin.durationAndPrice")}</h2><div className="form-grid form-grid--four">{field("durationDays", t("admin.days"), "7", "number", "7")}{field("durationNights", t("admin.nights"), "6", "number", "6")}{field("basePriceMinor", t("admin.basePrice"), "4250000", "number")}<Field><FieldLabel>{t("admin.currency")}</FieldLabel><Select name="currency" defaultValue="MNT"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MNT">MNT</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></Field></div></div>{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="form-actions"><Button type="submit" disabled={pending}>{pending ? t("admin.creating") : t("admin.createTour")}</Button></div></form>;
}
