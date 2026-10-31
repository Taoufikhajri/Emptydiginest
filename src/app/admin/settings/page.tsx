import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { dictionaries } from "@/lib/i18n/server";
import { fallbackText } from "@/lib/i18n/localize";
import { createTranslate } from "@/lib/i18n/translate";
import { getProducts } from "@/lib/queries";
import { getSettings, translatableFields, translationLocales } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [{ logoUrl, ...settings }, products] = await Promise.all([getSettings(), getProducts()]);
  const translationPlaceholders = Object.fromEntries(
    translationLocales.map(({ code }) => {
      const t = createTranslate(dictionaries[code]);
      return [code, Object.fromEntries(translatableFields.map((field) => [field, fallbackText(settings, field, t)]))];
    }),
  ) as React.ComponentProps<typeof SettingsForm>["translationPlaceholders"];
  return (
    <>
      <PageHeader title="Settings" description="Brand, currency, home page sections and design." />
      <SettingsForm
        values={settings}
        logoUrl={logoUrl}
        envBinanceRate={process.env.BINANCE_PAY_USDT_PER_EUR || null}
        products={products.map(({ id, name, priceCents }) => ({ id, name, priceCents }))}
        translationPlaceholders={translationPlaceholders}
      />
    </>
  );
}
