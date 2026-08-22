"use client";
import { useLocale } from "@toms/i18n/react";
export default function Loading() { const { t } = useLocale(); return <div className="skeleton" role="status" aria-label={t("state.loading")} />; }
