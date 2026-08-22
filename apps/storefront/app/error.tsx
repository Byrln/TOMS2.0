"use client";
import { useLocale } from "@toms/i18n/react";
import { Button } from "@toms/storefront-ui";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { const { t } = useLocale(); return <main className="error-state"><h1>{t("state.errorTitle")}</h1><p>{t("state.errorDescription")}</p><Button type="button" onClick={reset}>{t("common.retry")}</Button></main>; }
