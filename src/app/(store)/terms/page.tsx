import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Terms of service" };

// Placeholder text: replace with terms reviewed for your business and country.
export default async function TermsPage() {
  const { storeName, supportEmail } = await getSettings();
  return (
    <ContentPage
      title="Terms of service"
      intro={`These terms apply to purchases made on ${storeName}. Replace this placeholder text with your own terms.`}
      sections={[
        { heading: "Orders", body: "An order is confirmed once payment is received. Digital products are delivered on the order page and by email." },
        { heading: "Payments", body: "Payments are processed by third-party crypto payment providers. Prices may be shown in your local currency as an estimate at fixed exchange rates; you are charged the amount shown at checkout in the store currency. Crypto amounts are calculated when you pay." },
        { heading: "Refunds", body: "Refunds follow our guarantee policy, described on the Guarantee & refunds page." },
        { heading: "Contact", body: `Questions about these terms can be sent to ${supportEmail}.` },
      ]}
    />
  );
}
