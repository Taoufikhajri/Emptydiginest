import { createHmac, createVerify, randomBytes } from "node:crypto";
import type { PaymentProvider } from "./types";

// Docs: https://developers.binance.com/docs/binance-pay/introduction
const API_BASE = "https://bpay.binancepay.com";

// Binance Pay charges in crypto, so EUR totals are converted with a rate you set and update.
const usdtPerEur = () => Number(process.env.BINANCE_PAY_USDT_PER_EUR);

const toUsdt = (cents: number) => Math.round((cents / 100) * usdtPerEur() * 100) / 100;

async function signedRequest<T>(path: string, body: unknown): Promise<T> {
  const payload = JSON.stringify(body);
  const timestamp = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const signature = createHmac("sha512", process.env.BINANCE_PAY_SECRET_KEY ?? "")
    .update(`${timestamp}\n${nonce}\n${payload}\n`)
    .digest("hex")
    .toUpperCase();

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "BinancePay-Timestamp": timestamp,
      "BinancePay-Nonce": nonce,
      "BinancePay-Certificate-SN": process.env.BINANCE_PAY_API_KEY ?? "",
      "BinancePay-Signature": signature,
    },
    body: payload,
  });
  const data = (await response.json().catch(() => ({}))) as { status?: string; errorMessage?: string; data?: T };
  if (!response.ok || data.status !== "SUCCESS" || !data.data) {
    throw new Error(`Binance Pay request failed: ${data.errorMessage ?? response.status}`);
  }
  return data.data;
}

export const binancePay: PaymentProvider = {
  id: "binance",
  label: "Binance Pay",
  description: "Pay in USDT from your Binance account or wallet app.",
  isConfigured: () =>
    Boolean(process.env.BINANCE_PAY_API_KEY && process.env.BINANCE_PAY_SECRET_KEY && usdtPerEur() > 0),

  async createPayment({ order, items, baseUrl }) {
    const amount = toUsdt(order.totalCents);
    const data = await signedRequest<{ prepayId: string; checkoutUrl: string }>("/binancepay/openapi/v3/order", {
      env: { terminalType: "WEB" },
      merchantTradeNo: order.publicId,
      orderAmount: amount,
      currency: "USDT",
      description: `Diginest order ${order.publicId}`,
      goodsDetails: items.map((item, index) => ({
        goodsType: "02",
        goodsCategory: "Z000",
        referenceGoodsId: `${order.publicId}-${index + 1}`,
        goodsName: item.name.slice(0, 256),
        goodsUnitAmount: { currency: "USDT", amount: toUsdt(item.unitPriceCents) },
        goodsQuantity: item.quantity,
      })),
      returnUrl: `${baseUrl}/orders/${order.publicId}`,
      cancelUrl: `${baseUrl}/orders/${order.publicId}`,
      webhookUrl: `${baseUrl}/api/webhooks/binance`,
    });
    return { reference: data.prepayId, redirectUrl: data.checkoutUrl, amount: `${amount} USDT` };
  },
};

// Binance signs webhooks with RSA; its public keys come from the certificates endpoint.
let certificateCache: { serial: string; publicKey: string }[] | null = null;

async function getCertificates() {
  certificateCache ??= (
    await signedRequest<{ certSerial: string; certPublic: string }[]>("/binancepay/openapi/certificates", {})
  ).map((cert) => ({ serial: cert.certSerial, publicKey: cert.certPublic }));
  return certificateCache;
}

export async function verifyBinanceSignature(headers: Headers, rawBody: string) {
  const timestamp = headers.get("BinancePay-Timestamp");
  const nonce = headers.get("BinancePay-Nonce");
  const signature = headers.get("BinancePay-Signature");
  const serial = headers.get("BinancePay-Certificate-SN");
  if (!timestamp || !nonce || !signature || !serial) return false;

  const certificate = (await getCertificates()).find((cert) => cert.serial === serial);
  if (!certificate) return false;

  return createVerify("RSA-SHA256")
    .update(`${timestamp}\n${nonce}\n${rawBody}\n`)
    .verify(certificate.publicKey, signature, "base64");
}
