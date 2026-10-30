import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy policy" };

// Placeholder text: replace with a privacy policy reviewed for your business and country.
export default async function PrivacyPage() {
  const { storeName, supportEmail } = await getSettings();
  return (
    <ContentPage
      title="Privacy policy"
      intro={`How ${storeName} handles your data. Replace this placeholder text with your own policy.`}
      sections={[
        { heading: "What we store", body: "Your name, email address, a securely hashed password, and the orders you place." },
        { heading: "Payments", body: "Payments happen on the payment provider's site. We never see or store your wallet keys or card details." },
        { heading: "Cookies", body: "We use one cookie to keep you signed in and your browser's storage to remember your cart." },
        { heading: "Your rights", body: `To see or delete your data, email ${supportEmail}.` },
      ]}
    />
  );
}
