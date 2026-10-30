"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  demoPaymentsAllowed,
  isDemoProvider,
  isProviderAvailable,
  isProviderId,
  markOrderPaid,
  providers,
} from "@/lib/payments";
import { getOrderByPublicId, toOrder } from "@/lib/queries";
import { getStoredSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/url";

export type CheckoutState = { error?: string } | undefined;

const cartSchema = z
  .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) }))
  .min(1, "Your cart is empty.")
  .max(50);

// Read by the cart provider in the browser to empty the cart once an order exists.
const CLEAR_CART_COOKIE = "dn_clear_cart";

export async function placeOrder(_state: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const settings = await getStoredSettings();
  const provider = formData.get("provider");
  if (!isProviderId(provider) || !isProviderAvailable(provider, settings)) {
    return { error: "Choose an available payment method." };
  }

  let rawCart: unknown;
  try {
    rawCart = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { error: "Your cart couldn't be read. Refresh the page and try again." };
  }
  const parsed = cartSchema.safeParse(rawCart);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Prices always come from the database, never from the browser.
  const ids = parsed.data.map((item) => item.productId);
  const products = await query<{ id: number; name: string; price_cents: number }>(
    "SELECT id, name, price_cents FROM products WHERE active AND id = ANY($1::int[])",
    [ids],
  );
  const items = parsed.data.flatMap((item) => {
    const product = products.find((row) => row.id === item.productId);
    return product
      ? [{ productId: product.id, name: product.name, unitPriceCents: product.price_cents, quantity: item.quantity }]
      : [];
  });
  if (items.length !== parsed.data.length) {
    return { error: "Some items in your cart are no longer available. Review your cart and try again." };
  }
  const totalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);

  const publicId = randomBytes(6).toString("hex").toUpperCase();
  const [row] = await query<Parameters<typeof toOrder>[0]>(
    `INSERT INTO orders (public_id, user_id, email, payment_provider, total_cents, currency)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [publicId, user.id, user.email, provider, totalCents, settings.currency],
  );
  const order = toOrder(row);
  for (const item of items) {
    await query(
      "INSERT INTO order_items (order_id, product_id, name, unit_price_cents, quantity) VALUES ($1, $2, $3, $4, $5)",
      [order.id, item.productId, item.name, item.unitPriceCents, item.quantity],
    );
  }

  (await cookies()).set(CLEAR_CART_COOKIE, "1", { path: "/", maxAge: 600, sameSite: "lax" });

  if (isDemoProvider(provider)) {
    redirect(`/orders/${publicId}`);
  }

  let redirectUrl: string;
  try {
    const payment = await providers[provider].createPayment({ order, items, baseUrl: await getBaseUrl(), settings });
    await query("UPDATE orders SET payment_ref = $1, payment_url = $2, payment_amount = $3 WHERE id = $4", [
      payment.reference,
      payment.redirectUrl,
      payment.amount ?? null,
      order.id,
    ]);
    redirectUrl = payment.redirectUrl;
  } catch (error) {
    console.error(error);
    redirect(`/orders/${publicId}?payment_error=1`);
  }
  redirect(redirectUrl);
}

export async function simulatePayment(formData: FormData) {
  const user = await getCurrentUser();
  const order = await getOrderByPublicId(String(formData.get("orderId") ?? ""));
  const allowed =
    user &&
    order &&
    (order.userId === user.id || user.role === "admin") &&
    isDemoProvider(order.paymentProvider) &&
    demoPaymentsAllowed();
  if (!allowed) throw new Error("Demo payment isn't available for this order.");

  await markOrderPaid(order.publicId);
  redirect(`/orders/${order.publicId}`);
}
