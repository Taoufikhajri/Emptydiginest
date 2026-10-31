import type { CurrencyCode } from "./settings-shared";

// Fixed exchange rates: units of each currency per 1 EUR, taken on 30 Oct 2026 (ECB reference rates;
// AED, SAR and MAD from open.er-api.com). They never update by themselves: edit this table to refresh them.
export const RATES_DATE = "30 Oct 2026";
export const ratesPerEur: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.1172,
  GBP: 0.8338,
  CAD: 1.5606,
  AUD: 1.5904,
  CHF: 0.9194,
  AED: 4.0991,
  SAR: 4.1856,
  MAD: 10.9653,
  TRY: 55.8015,
};

const isCurrency = (value: string | null | undefined): value is CurrencyCode =>
  Boolean(value && value in ratesPerEur);

// Prices are stored and charged in the store currency; visitors may see them converted to their own,
// formatted for their language (intl is a BCP 47 locale such as "fr-FR").
export type Pricing = { store: CurrencyCode; display: CurrencyCode; intl: string };

export const convertCents = (cents: number, from: CurrencyCode, to: CurrencyCode) =>
  from === to ? cents : Math.round((cents / ratesPerEur[from]) * ratesPerEur[to]);

export const formatMoney = (cents: number, currency: string, intl = "en-IE") =>
  new Intl.NumberFormat(intl, { style: "currency", currency }).format(cents / 100);

// A store price shown in the visitor's currency.
export const formatShopPrice = (cents: number, pricing: Pricing) =>
  formatMoney(convertCents(cents, pricing.store, pricing.display), pricing.display, pricing.intl);

const euroCountries = [
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
  "MC", "SM", "VA", "AD", "ME", "XK",
];
const countryCurrency: Record<string, CurrencyCode> = {
  ...Object.fromEntries(euroCountries.map((country) => [country, "EUR" as const])),
  US: "USD", PR: "USD", EC: "USD", SV: "USD", PA: "USD",
  GB: "GBP", IM: "GBP", JE: "GBP", GG: "GBP",
  CA: "CAD",
  AU: "AUD",
  CH: "CHF", LI: "CHF",
  AE: "AED",
  SA: "SAR",
  MA: "MAD",
  TR: "TRY",
};

export const CURRENCY_COOKIE = "dn_currency";

// Picks the visitor's currency: their own choice, then the hosting platform's country header,
// then the region in their browser language (fr-MA → MAD), else the store currency.
export function detectCurrency(input: {
  chosen?: string;
  country?: string | null;
  acceptLanguage?: string | null;
  store: CurrencyCode;
}): CurrencyCode {
  if (isCurrency(input.chosen)) return input.chosen;
  const fromCountry = input.country && countryCurrency[input.country.toUpperCase()];
  if (fromCountry) return fromCountry;
  for (const part of (input.acceptLanguage ?? "").split(",")) {
    const region = part.split(";")[0].trim().split("-")[1];
    const fromLanguage = region && countryCurrency[region.toUpperCase()];
    if (fromLanguage) return fromLanguage;
  }
  return input.store;
}
