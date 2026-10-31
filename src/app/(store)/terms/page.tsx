import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { getI18n } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("terms.title") };
}

// Placeholder text: replace with terms reviewed for your business and country (in lib/i18n/messages).
export default async function TermsPage() {
  const [{ storeName, supportEmail }, { t }] = await Promise.all([getSettings(), getI18n()]);
  return (
    <ContentPage
      title={t("terms.title")}
      intro={t("terms.intro", { store: storeName })}
      sections={[
        { heading: t("terms.orders"), body: t("terms.ordersBody") },
        { heading: t("terms.payments"), body: t("terms.paymentsBody") },
        { heading: t("terms.refunds"), body: t("terms.refundsBody") },
        { heading: t("terms.contact"), body: t("terms.contactBody", { email: supportEmail }) },
      ]}
    />
  );
}
