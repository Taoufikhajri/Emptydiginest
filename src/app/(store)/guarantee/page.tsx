import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Guarantee & refunds" };

export default async function GuaranteePage() {
  const { supportEmail } = await getSettings();
  return (
    <ContentPage
      title="Guarantee & refunds"
      intro="Every order is covered. If something doesn't work as described, we replace it or refund you."
      sections={[
        {
          heading: "Replaced",
          body: "If a product stops working or doesn't match its description, contact us with your order number. We'll fix it or send a replacement for the same plan.",
        },
        {
          heading: "Refunded",
          body: "If we can't fix it, you get back the unused part of what you paid. If it never worked, you get the full amount back.",
        },
        {
          heading: "How to make a claim",
          body: `Email ${supportEmail} with your order number and a short description of the problem. Most claims are answered within one business day.`,
        },
      ]}
    />
  );
}
