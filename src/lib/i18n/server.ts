import { cookies, headers } from "next/headers";
import { cache } from "react";
import { detectLocale, localeInfo, LOCALE_COOKIE, type Locale } from "./locales";
import { ar } from "./messages/ar";
import { de } from "./messages/de";
import { en, type Messages } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { createTranslate } from "./translate";

export const dictionaries: Record<Locale, Messages> = { en, fr, ar, es, de };

// The visitor's language for this request: their choice (cookie), then their country when the host
// sends one (Vercel, Cloudflare; Railway doesn't), then their browser languages.
export const getLocale = cache(async (): Promise<Locale> => {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return detectLocale({
    chosen: cookieStore.get(LOCALE_COOKIE)?.value,
    country: headerList.get("x-vercel-ip-country") ?? headerList.get("cf-ipcountry"),
    acceptLanguage: headerList.get("accept-language"),
  });
});

export async function getI18n() {
  const locale = await getLocale();
  const messages = dictionaries[locale];
  return { locale, info: localeInfo(locale), messages, t: createTranslate(messages) };
}
