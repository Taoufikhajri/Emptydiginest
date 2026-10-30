import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { getProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [{ logoUrl, ...settings }, products] = await Promise.all([getSettings(), getProducts()]);
  return (
    <>
      <PageHeader title="Settings" description="Brand, currency, home page sections and design." />
      <SettingsForm
        values={settings}
        logoUrl={logoUrl}
        envBinanceRate={process.env.BINANCE_PAY_USDT_PER_EUR || null}
        products={products.map(({ id, name, priceCents }) => ({ id, name, priceCents }))}
      />
    </>
  );
}
