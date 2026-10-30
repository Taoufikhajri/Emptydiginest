import { query } from "../db";
import type { StoreSettings } from "../settings-shared";
import { binancePay, binanceUsdtRate } from "./binance";
import { nowPayments } from "./nowpayments";
import type { PaymentProvider, ProviderId } from "./types";

export type { ProviderId } from "./types";

export const providers: Record<ProviderId, PaymentProvider> = {
  nowpayments: nowPayments,
  binance: binancePay,
};

export const isProviderId = (value: unknown): value is ProviderId =>
  typeof value === "string" && value in providers;

// Without API keys a provider runs in demo mode: the order page offers a "simulate payment" button.
export const isDemoProvider = (id: string) => !isProviderId(id) || !providers[id].isConfigured();

// Demo payments mark orders paid for free, so production only allows them when explicitly enabled.
export const demoPaymentsAllowed = () =>
  process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_PAYMENTS === "true";

// Ready to take real payments: keys are set and, for Binance Pay, a USDT rate is known.
const isProviderReady = (id: ProviderId, settings: StoreSettings) =>
  providers[id].isConfigured() && (id !== "binance" || binanceUsdtRate(settings) > 0);

export const isProviderAvailable = (id: ProviderId, settings: StoreSettings) =>
  isProviderReady(id, settings) || demoPaymentsAllowed();

export async function markOrderPaid(publicId: string) {
  await query(
    "UPDATE orders SET status = 'paid', paid_at = now() WHERE public_id = $1 AND status = 'pending'",
    [publicId],
  );
}
