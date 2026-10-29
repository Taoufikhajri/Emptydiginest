// Brand and copy for the storefront. Change these to rebrand the whole page.
export const siteConfig = {
  name: "Lumen Market",
  shortName: "LUMEN",
  tagline: "Digital tools for makers, delivered instantly",
  description:
    "Software, templates and creative tools for makers, delivered by email in seconds.",
  copyrightHolder: "Lumen Market",
  navLinks: [
    { label: "Partner program", href: "#partners" },
    { label: "Journal", href: "#journal" },
  ],
  hero: {
    titleLead: "Tools for makers,",
    titleAccent: "delivered instantly.",
    subtitle: "Most orders arrive within seconds, on the order page and by email.",
  },
  paymentMethods: ["Card", "PayPal", "Apple Pay", "Store credit"],
} as const;
