import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { getI18n } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("privacy.title") };
}

// Placeholder text: replace with a privacy policy reviewed for your business and country (in lib/i18n/messages).
export default async function PrivacyPage() {
  const [{ storeName, supportEmail }, { t }] = await Promise.all([getSettings(), getI18n()]);
  return (
    <ContentPage
      title={t("privacy.title")}
      intro={t("privacy.intro", { store: storeName })}
      sections={[
        { heading: t("privacy.stored"), body: t("privacy.storedBody") },
        { heading: t("privacy.payments"), body: t("privacy.paymentsBody") },
        { heading: t("privacy.cookies"), body: t("privacy.cookiesBody") },
        { heading: t("privacy.rights"), body: t("privacy.rightsBody", { email: supportEmail }) },
      ]}
    />
  );
}
