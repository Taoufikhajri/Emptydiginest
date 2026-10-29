export const CURRENCY = "EUR";

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: CURRENCY }).format(cents / 100);

export const discountPercent = (priceCents: number, compareAtCents: number | null) =>
  compareAtCents && compareAtCents > priceCents
    ? Math.round((1 - priceCents / compareAtCents) * 100)
    : 0;

// Parses "12.50" or "12,50" from admin forms into integer cents.
export const parsePriceToCents = (value: string) => {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
};
