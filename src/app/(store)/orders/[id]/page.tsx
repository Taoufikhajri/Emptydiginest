import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FlaskConical, PackageCheck } from "lucide-react";
import { simulatePayment } from "@/app/actions/checkout";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { demoPaymentsAllowed, isDemoProvider, isProviderId, providers } from "@/lib/payments";
import { getOrderByPublicId, getOrderItems } from "@/lib/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_error?: string }>;
};

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { payment_error: paymentError } = await searchParams;
  const user = await requireUser(`/orders/${id}`);
  const order = await getOrderByPublicId(id);
  if (!order || (order.userId !== user.id && user.role !== "admin")) notFound();

  const items = await getOrderItems(order.id);
  const providerLabel = isProviderId(order.paymentProvider) ? providers[order.paymentProvider].label : order.paymentProvider;
  const demo = isDemoProvider(order.paymentProvider) && demoPaymentsAllowed();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <Link href="/account" className="text-xs text-muted-foreground hover:text-foreground">
        ← My orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Order {order.publicId}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed {order.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {providerLabel}
      </p>

      {order.status === "pending" && (
        <section className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold">Waiting for payment</h2>
          {paymentError && (
            <p className="mt-2 text-sm text-destructive">
              We couldn&apos;t start the payment with {providerLabel}. Try again in a moment or contact support.
            </p>
          )}
          {order.paymentUrl && (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Finish paying {order.paymentAmount ? <strong>{order.paymentAmount}</strong> : formatPrice(order.totalCents)}{" "}
                with {providerLabel}. This page updates once the payment is confirmed.
              </p>
              <a
                href={order.paymentUrl}
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Continue to payment
                <ExternalLink className="size-4" />
              </a>
            </>
          )}
          {demo && (
            <form action={simulatePayment} className="mt-4">
              <input type="hidden" name="orderId" value={order.publicId} />
              <p className="text-sm text-muted-foreground">
                {providerLabel} has no API keys yet, so this order is in demo mode. No real payment is taken.
              </p>
              <button
                type="submit"
                className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90"
              >
                <FlaskConical className="size-4" />
                Simulate successful payment
              </button>
            </form>
          )}
        </section>
      )}

      {order.status === "paid" && (
        <section className="mt-6 rounded-[28px] bg-blue-50 p-6">
          <h2 className="font-semibold">Payment received</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks! We&apos;re preparing your delivery. It will appear here as soon as it&apos;s ready.
          </p>
        </section>
      )}

      {order.status === "delivered" && (
        <section className="mt-6 rounded-[28px] border border-signal-emerald/30 bg-signal-emerald/5 p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <PackageCheck className="size-5 text-signal-emerald" />
            Your delivery
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-card p-4 font-mono text-sm whitespace-pre-wrap">
            {order.deliveryNote || "Delivered. Check your email for details."}
          </pre>
        </section>
      )}

      <section className="mt-6 rounded-[28px] bg-card p-6">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-4 divide-y divide-border/70">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="min-w-0">
                {item.productSlug ? (
                  <Link href={`/products/${item.productSlug}`} className="font-medium hover:text-primary">
                    {item.name}
                  </Link>
                ) : (
                  <span className="font-medium">{item.name}</span>
                )}
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </span>
              <span className="tabular-nums">{formatPrice(item.unitPriceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-border/70 pt-3 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </section>
    </div>
  );
}
