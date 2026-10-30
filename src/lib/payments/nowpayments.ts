import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentProvider } from "./types";

// Docs: https://nowpayments.io (API keys and IPN secret are under Store Settings in the dashboard).
const apiBase = () =>
  process.env.NOWPAYMENTS_SANDBOX === "true" ? "https://api-sandbox.nowpayments.io/v1" : "https://api.nowpayments.io/v1";

export const nowPayments: PaymentProvider = {
  id: "nowpayments",
  label: "Crypto (NOWPayments)",
  description: "Pay with BTC, ETH, USDT and 300+ other coins.",
  isConfigured: () => Boolean(process.env.NOWPAYMENTS_API_KEY && process.env.NOWPAYMENTS_IPN_SECRET),

  async createPayment({ order, baseUrl, settings }) {
    const response = await fetch(`${apiBase()}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY ?? "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        price_amount: order.totalCents / 100,
        price_currency: order.currency.toLowerCase(),
        order_id: order.publicId,
        order_description: `${settings.storeName} order ${order.publicId}`,
        ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
        success_url: `${baseUrl}/orders/${order.publicId}`,
        cancel_url: `${baseUrl}/orders/${order.publicId}`,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { id?: string | number; invoice_url?: string; message?: string };
    if (!response.ok || !data.invoice_url) {
      throw new Error(`NOWPayments invoice failed: ${data.message ?? response.status}`);
    }
    return { reference: String(data.id), redirectUrl: data.invoice_url };
  },
};

// NOWPayments signs the JSON body with its keys sorted alphabetically (recursively).
const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
};

export function verifyNowPaymentsSignature(body: unknown, signature: string | null) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(JSON.stringify(sortKeys(body))).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
