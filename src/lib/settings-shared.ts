// Store settings that admins edit in /admin/settings. Safe to import from client components.

// Two-decimal currencies only: prices are stored in cents.
export const currencies = [
  { code: "EUR", label: "Euro (€)" },
  { code: "USD", label: "US dollar ($)" },
  { code: "GBP", label: "British pound (£)" },
  { code: "CAD", label: "Canadian dollar (CA$)" },
  { code: "AUD", label: "Australian dollar (A$)" },
  { code: "CHF", label: "Swiss franc (CHF)" },
  { code: "AED", label: "UAE dirham (AED)" },
  { code: "SAR", label: "Saudi riyal (SAR)" },
  { code: "MAD", label: "Moroccan dirham (MAD)" },
  { code: "TRY", label: "Turkish lira (TRY)" },
] as const;
export type CurrencyCode = (typeof currencies)[number]["code"];
export const currencyCodes = currencies.map((currency) => currency.code) as [CurrencyCode, ...CurrencyCode[]];

// Each font is loaded in the root layout and exposed as a CSS variable.
export const fonts = [
  { id: "geist", label: "Geist", cssVar: "--font-geist-sans" },
  { id: "inter", label: "Inter", cssVar: "--font-inter" },
  { id: "poppins", label: "Poppins", cssVar: "--font-poppins" },
  { id: "dm-sans", label: "DM Sans", cssVar: "--font-dm-sans" },
] as const;
export type FontId = (typeof fonts)[number]["id"];
export const fontIds = fonts.map((font) => font.id) as [FontId, ...FontId[]];

export const cornerStyles = [
  { id: "round", label: "Round", cardRadius: "28px", uiRadius: "0.625rem" },
  { id: "soft", label: "Soft", cardRadius: "16px", uiRadius: "0.5rem" },
  { id: "square", label: "Square", cardRadius: "6px", uiRadius: "0.25rem" },
] as const;
export type CornerStyle = (typeof cornerStyles)[number]["id"];
export const cornerStyleIds = cornerStyles.map((style) => style.id) as [CornerStyle, ...CornerStyle[]];

export const heroCardStyles = [
  { id: "colorful", label: "Colorful" },
  { id: "brand", label: "Brand color" },
] as const;
export type HeroCardStyle = (typeof heroCardStyles)[number]["id"];

export const heroCardActions = [
  { id: "cart", label: "Add to cart and open the cart" },
  { id: "product", label: "Open the product page" },
] as const;
export type HeroCardAction = (typeof heroCardActions)[number]["id"];

// One rotating card in the hero. Empty text fields fall back to the product (name, price) and the store name.
export type HeroCard = {
  productId: number | null;
  label: string;
  title: string;
  detail: string;
  action: HeroCardAction;
};
export const MAX_HERO_CARDS = 6;

export const homeSections = [
  { id: "hero", label: "Hero", hint: "Big headline with the rotating product cards" },
  { id: "guarantee", label: "Guarantee & payment methods", hint: "\"Replaced or refunded\" block and the Pay with badges" },
  { id: "categories", label: "Category shortcuts", hint: "Category chips above the product grid" },
  { id: "popular", label: "Popular products", hint: "Grid of featured products" },
] as const;
export type HomeSection = (typeof homeSections)[number]["id"];

export type StoreSettings = {
  storeName: string;
  tagline: string;
  description: string;
  supportEmail: string;
  showNameWithLogo: boolean;
  currency: CurrencyCode;
  // USDT per 1 unit of the store currency. Empty means BINANCE_PAY_USDT_PER_EUR is used.
  binanceUsdtRate: string;
  announcement: string;
  sections: Record<HomeSection, boolean>;
  heroTitleLead: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroCardStyle: HeroCardStyle;
  // Empty: the hero shows an intro card plus up to 4 featured products.
  heroCards: HeroCard[];
  primaryColor: string;
  backgroundColor: string;
  font: FontId;
  corners: CornerStyle;
};

export const defaultDesign = {
  primaryColor: "#5433eb",
  backgroundColor: "#f2f4f5",
  font: "geist",
  corners: "round",
  heroCardStyle: "colorful",
} satisfies Partial<StoreSettings>;

export const defaultSettings: StoreSettings = {
  storeName: "Diginest",
  tagline: "Digital tools for makers, delivered instantly",
  description: "Software, templates and creative tools for makers, delivered by email in seconds.",
  supportEmail: "support@diginest.example",
  showNameWithLogo: true,
  currency: "EUR",
  binanceUsdtRate: "",
  announcement: "",
  sections: { hero: true, guarantee: true, categories: true, popular: true },
  heroTitleLead: "Tools for makers,",
  heroTitleAccent: "delivered instantly.",
  heroSubtitle: "Most orders arrive within seconds, on the order page and by email.",
  heroCards: [],
  ...defaultDesign,
};

const hexToRgb = (hex: string) => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);

// WCAG relative luminance, 0 (black) to 1 (white).
export const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Text color with the higher contrast on top of the given color (0.179 is where black and white tie).
export const readableTextOn = (hex: string) => (luminance(hex) > 0.179 ? "#0b0b0c" : "#ffffff");

export const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);
