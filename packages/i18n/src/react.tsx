"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  localeCookieValue,
  normalizeLocale,
  translate,
  type Locale,
  type TranslationKey,
} from "./index";

export type Translator = (key: TranslationKey, params?: Readonly<Record<string, string | number>>) => string;

interface LocaleContextValue {
  locale: Locale;
  setLocale(locale: Locale): void;
  t: Translator;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale | string; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => normalizeLocale(initialLocale));
  const setLocale = useCallback((nextLocale: Locale) => {
    document.cookie = localeCookieValue(nextLocale);
    setLocaleState(nextLocale);
    window.location.reload();
  }, []);
  const t = useCallback<Translator>((key, params) => translate(locale, key, params), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
