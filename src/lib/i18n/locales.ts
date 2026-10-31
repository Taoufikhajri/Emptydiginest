// Storefront languages. The admin dashboard stays in English.
export const locales = [
  { code: "en", label: "English", dir: "ltr", intl: "en-IE" },
  { code: "fr", label: "Français", dir: "ltr", intl: "fr-FR" },
  { code: "ar", label: "العربية", dir: "rtl", intl: "ar-u-nu-latn" },
  { code: "es", label: "Español", dir: "ltr", intl: "es-ES" },
  { code: "de", label: "Deutsch", dir: "ltr", intl: "de-DE" },
] as const;
export type Locale = (typeof locales)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "dn_lang";

export const isLocale = (value: string | null | undefined): value is Locale =>
  locales.some((locale) => locale.code === value);

export const localeInfo = (code: Locale) => locales.find((locale) => locale.code === code) ?? locales[0];

const countryLocale: Record<string, Locale> = {
  ...Object.fromEntries(
    ["FR", "BE", "LU", "MC", "MA", "DZ", "TN", "SN", "CI", "CM", "ML", "BF", "NE", "TG", "BJ", "GA", "CG", "CD", "MG", "HT"].map(
      (country) => [country, "fr" as const],
    ),
  ),
  ...Object.fromEntries(
    ["SA", "AE", "EG", "QA", "KW", "BH", "OM", "JO", "LB", "IQ", "LY", "SD", "YE", "SY", "PS", "MR"].map((country) => [country, "ar" as const]),
  ),
  ...Object.fromEntries(
    ["ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "UY", "PY", "BO", "CR", "PA", "DO", "GT", "HN", "NI", "SV", "CU"].map(
      (country) => [country, "es" as const],
    ),
  ),
  ...Object.fromEntries(["DE", "AT", "LI", "CH"].map((country) => [country, "de" as const])),
};

// Picks the visitor's language: their own choice, then their country (when the host sends it),
// then their browser languages, else English.
export function detectLocale(input: { chosen?: string; country?: string | null; acceptLanguage?: string | null }): Locale {
  if (isLocale(input.chosen)) return input.chosen;
  const fromCountry = input.country && countryLocale[input.country.toUpperCase()];
  if (fromCountry) return fromCountry;
  for (const part of (input.acceptLanguage ?? "").split(",")) {
    const language = part.split(";")[0].trim().split("-")[0].toLowerCase();
    if (isLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}
