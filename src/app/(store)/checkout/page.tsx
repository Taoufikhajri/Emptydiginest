import type { Metadata } from "next";
import { CheckoutForm, type CheckoutProvider } from "@/components/store/checkout-form";
import { requireUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { isDemoProvider, isProviderAvailable, providers } from "@/lib/payments";
import { getStoredSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("checkout.title") };
}

export default async function CheckoutPage() {
  const [user, settings, { t }] = await Promise.all([requireUser("/checkout"), getStoredSettings(), getI18n()]);
  const available: CheckoutProvider[] = Object.values(providers)
    .filter((provider) => isProviderAvailable(provider.id, settings))
    .map((provider) => ({
      id: provider.id,
      label: provider.label,
      description: t(`payment.${provider.id}`),
      demo: isDemoProvider(provider.id),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t("checkout.title")}</h1>
      <div className="mt-6">
        <CheckoutForm providers={available} email={user.email} />
      </div>
    </div>
  );
}
