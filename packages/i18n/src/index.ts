import { en, mn, type TranslationKey } from "./catalog";

export const locales = ["mn", "en"] as const;
export type Locale = typeof locales[number];
export type { TranslationKey } from "./catalog";

export const localeCookieName = "toms-locale";
export const defaultLocale: Locale = "mn";
export const supportedLocales = ["mn-MN", "en-US"] as const;
export type SupportedLocale = typeof supportedLocales[number];

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = { mn, en };

export function normalizeLocale(value: string | null | undefined): Locale {
  const normalized = value?.trim().toLowerCase().replace("_", "-");
  return normalized?.startsWith("en") ? "en" : "mn";
}

export function localeCookieValue(locale: Locale): string {
  return `${localeCookieName}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function intlLocale(locale: Locale): SupportedLocale {
  return locale === "en" ? "en-US" : "mn-MN";
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  params: Readonly<Record<string, string | number>> = {},
): string {
  const template = dictionaries[locale][key] ?? dictionaries[defaultLocale][key];
  return template.replace(/\{(\w+)\}/g, (match, parameter: string) => (
    Object.prototype.hasOwnProperty.call(params, parameter) ? String(params[parameter]) : match
  ));
}

export type LocalizedValue = Readonly<Record<Locale, string>>;

export function resolveLocalized(value: LocalizedValue, locale: Locale): string {
  return value[locale] || value[defaultLocale] || value.en;
}

export function statusLabel(locale: Locale, status: string): string {
  const normalized = status.trim().toUpperCase().replace(/\s+/g, "_");
  const key = `status.${normalized}` as TranslationKey;
  return Object.prototype.hasOwnProperty.call(dictionaries[locale], key)
    ? translate(locale, key)
    : translate(locale, "status.UNKNOWN");
}

export function formatDepartureRange(startsOn: string, endsOn: string, locale: Locale | SupportedLocale, timeZone: string): string {
  const resolvedLocale = locale === "en-US" || locale === "mn-MN" ? locale : intlLocale(locale);
  const formatter = new Intl.DateTimeFormat(resolvedLocale, { year: "numeric", month: "short", day: "numeric", timeZone });
  return `${formatter.format(new Date(`${startsOn}T12:00:00Z`))} – ${formatter.format(new Date(`${endsOn}T12:00:00Z`))}`;
}

export function tenantDateTime(value: string | Date, locale: Locale | SupportedLocale, timeZone: string): string {
  const resolvedLocale = locale === "en-US" || locale === "mn-MN" ? locale : intlLocale(locale);
  return new Intl.DateTimeFormat(resolvedLocale, { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(value));
}
