import { cookies } from "next/headers";
import { localeCookieName, normalizeLocale, translate, type TranslationKey } from "@toms/i18n";

export async function getServerI18n() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookieName)?.value);
  return {
    locale,
    t: (key: TranslationKey, params?: Readonly<Record<string, string | number>>) => translate(locale, key, params),
  };
}
