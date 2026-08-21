"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function TourForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true); setError("");
    const body = {
      name: String(formData.get("name")), slug: String(formData.get("slug")),
      summary: String(formData.get("summary")), description: String(formData.get("description")),
      durationDays: Number(formData.get("durationDays")), durationNights: Number(formData.get("durationNights")),
      basePriceMinor: Number(formData.get("basePriceMinor")), currency: String(formData.get("currency")),
      destinations: String(formData.get("destinations")).split(",").map((item) => item.trim()).filter(Boolean)
    };
    const response = await fetch(`${apiUrl}/api/v1/admin/tours`, { method:"POST", headers:{"content-type":"application/json","x-demo-role":"OWNER"}, body:JSON.stringify(body) });
    if (!response.ok) { const result = await response.json() as { error?: { message?: string } }; setError(result.error?.message ?? "Tour үүсгэж чадсангүй"); setPending(false); return; }
    const tour = await response.json() as { id: string };
    router.push(`/tours/${tour.id}`); router.refresh();
  }
  return <form className="entity-form panel" action={(formData) => void submit(formData)}><div className="form-section"><h2>Ерөнхий мэдээлэл</h2><div className="form-grid"><label>Аяллын нэр<input name="name" required defaultValue="Altai Eagle Journey" /></label><label>Slug<input name="slug" required pattern="[a-z0-9-]+" defaultValue="altai-eagle-journey" /></label><label className="form-span">Товч тайлбар<input name="summary" required defaultValue="Western Mongolia expedition" /></label><label className="form-span">Дэлгэрэнгүй<textarea name="description" required defaultValue="A seven-day small-group journey through the Mongolian Altai." /></label></div></div><div className="form-section"><h2>Хугацаа ба үнэ</h2><div className="form-grid form-grid--four"><label>Өдөр<input name="durationDays" type="number" min="1" defaultValue="7" required /></label><label>Шөнө<input name="durationNights" type="number" min="0" defaultValue="6" required /></label><label>Үндсэн үнэ<input name="basePriceMinor" type="number" min="0" defaultValue="4250000" required /></label><label>Валют<select name="currency" defaultValue="MNT"><option>MNT</option><option>USD</option></select></label></div><label>Чиглэлүүд<input name="destinations" defaultValue="Bayan-Ulgii, Altai" required /></label></div>{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="form-actions"><button className="button button--primary" type="submit" disabled={pending}>{pending ? "Үүсгэж байна..." : "Аялал үүсгэх"}</button></div></form>;
}
