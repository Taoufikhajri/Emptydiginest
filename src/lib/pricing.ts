import { cookies, headers } from "next/headers";
import { cache } from "react";
import { CURRENCY_COOKIE, detectCurrency, type Pricing } from "./currency";
import { getStoredSettings } from "./settings";

// The currency this visitor sees prices in. Railway sends no country header, so there the browser
// language decides; Vercel and Cloudflare add the visitor's country.
export const getPricing = cache(async (): Promise<Pricing> => {
  const [settings, cookieStore, headerList] = await Promise.all([getStoredSettings(), cookies(), headers()]);
  if (!settings.localCurrency) return { store: settings.currency, display: settings.currency };
  return {
    store: settings.currency,
    display: detectCurrency({
      chosen: cookieStore.get(CURRENCY_COOKIE)?.value,
      country: headerList.get("x-vercel-ip-country") ?? headerList.get("cf-ipcountry"),
      acceptLanguage: headerList.get("accept-language"),
      store: settings.currency,
    }),
  };
});
