import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { getI18n } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("guaranteePage.title") };
}

export default async function GuaranteePage() {
  const [{ supportEmail }, { t }] = await Promise.all([getSettings(), getI18n()]);
  return (
    <ContentPage
      title={t("guaranteePage.title")}
      intro={t("guaranteePage.intro")}
      sections={[
        { heading: t("guaranteePage.replaced"), body: t("guaranteePage.replacedBody") },
        { heading: t("guaranteePage.refunded"), body: t("guaranteePage.refundedBody") },
        { heading: t("guaranteePage.claim"), body: t("guaranteePage.claimBody", { email: supportEmail }) },
      ]}
    />
  );
}
