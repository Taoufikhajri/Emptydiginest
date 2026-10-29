import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Terms of service" };

// Placeholder text: replace with terms reviewed for your business and country.
export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of service"
      intro={`These terms apply to purchases made on ${siteConfig.name}. Replace this placeholder text with your own terms.`}
      sections={[
        { heading: "Orders", body: "An order is confirmed once payment is received. Digital products are delivered on the order page and by email." },
        { heading: "Payments", body: "Payments are processed by third-party crypto payment providers. Prices are shown in euros; crypto amounts are calculated when you pay." },
        { heading: "Refunds", body: "Refunds follow our guarantee policy, described on the Guarantee & refunds page." },
        { heading: "Contact", body: `Questions about these terms can be sent to ${siteConfig.supportEmail}.` },
      ]}
    />
  );
}
