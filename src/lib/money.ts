// The store currency is an admin setting; past orders keep the currency they were placed in.
export const formatPrice = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(cents / 100);

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
