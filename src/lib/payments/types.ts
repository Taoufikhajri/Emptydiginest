import type { Order } from "../queries";

export type ProviderId = "nowpayments" | "binance";

export type CreatePaymentInput = {
  order: Order;
  items: { name: string; unitPriceCents: number; quantity: number }[];
  baseUrl: string;
};

export type PaymentProvider = {
  id: ProviderId;
  label: string;
  description: string;
  isConfigured: () => boolean;
  // amount: what the provider will charge, when it differs from the store currency (e.g. "37.25 USDT").
  createPayment: (input: CreatePaymentInput) => Promise<{ reference: string; redirectUrl: string; amount?: string }>;
};
