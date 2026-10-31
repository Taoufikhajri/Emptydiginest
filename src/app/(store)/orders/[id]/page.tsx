import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FlaskConical, PackageCheck } from "lucide-react";
import { simulatePayment } from "@/app/actions/checkout";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { getI18n } from "@/lib/i18n/server";
import { demoPaymentsAllowed, isDemoProvider, isProviderId, providers } from "@/lib/payments";
import { getOrderByPublicId, getOrderItems } from "@/lib/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_error?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("order.meta") };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { payment_error: paymentError } = await searchParams;
  const user = await requireUser(`/orders/${id}`);
  const order = await getOrderByPublicId(id);
  if (!order || (order.userId !== user.id && user.role !== "admin")) notFound();

  const [items, { t, info }] = await Promise.all([getOrderItems(order.id), getI18n()]);
  const money = (cents: number) => formatMoney(cents, order.currency, info.intl);
  const providerLabel = isProviderId(order.paymentProvider) ? providers[order.paymentProvider].label : order.paymentProvider;
  const demo = isDemoProvider(order.paymentProvider) && demoPaymentsAllowed();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <Link href="/account" className="text-xs text-muted-foreground hover:text-foreground">
        <span className="rtl:hidden">←</span>
        <span className="hidden rtl:inline">→</span> {t("order.back")}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t("order.title", { id: order.publicId })}</h1>
        <OrderStatusBadge status={order.status} label={t(`status.${order.status}`)} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("order.placed", {
          date: order.createdAt.toLocaleString(info.intl, { dateStyle: "medium", timeStyle: "short" }),
          provider: providerLabel,
        })}
      </p>

      {order.status === "pending" && (
        <section className="mt-6 rounded-(--store-radius) border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold">{t("order.waiting")}</h2>
          {paymentError && (
            <p className="mt-2 text-sm text-destructive">
              {t("order.paymentError", { provider: providerLabel })}
            </p>
          )}
          {order.paymentUrl && (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("order.finish", { amount: order.paymentAmount ?? money(order.totalCents), provider: providerLabel })}
              </p>
              <a
                href={order.paymentUrl}
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {t("order.continue")}
                <ExternalLink className="size-4" />
              </a>
            </>
          )}
          {demo && (
            <form action={simulatePayment} className="mt-4">
              <input type="hidden" name="orderId" value={order.publicId} />
              <p className="text-sm text-muted-foreground">
                {t("order.demo", { provider: providerLabel })}
              </p>
              <button
                type="submit"
                className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90"
              >
                <FlaskConical className="size-4" />
                {t("order.simulate")}
              </button>
            </form>
          )}
        </section>
      )}

      {order.status === "paid" && (
        <section className="mt-6 rounded-(--store-radius) bg-blue-50 p-6">
          <h2 className="font-semibold">{t("order.paid")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("order.paidBody")}
          </p>
        </section>
      )}

      {order.status === "delivered" && (
        <section className="mt-6 rounded-(--store-radius) border border-signal-emerald/30 bg-signal-emerald/5 p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <PackageCheck className="size-5 text-signal-emerald" />
            {t("order.delivery")}
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-card p-4 font-mono text-sm whitespace-pre-wrap">
            {order.deliveryNote || t("order.deliveredFallback")}
          </pre>
        </section>
      )}

      <section className="mt-6 rounded-(--store-radius) bg-card p-6">
        <h2 className="font-semibold">{t("order.items")}</h2>
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
              <span className="tabular-nums">{money(item.unitPriceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-border/70 pt-3 font-semibold">
          <span>{t("order.total")}</span>
          <span className="tabular-nums">{money(order.totalCents)}</span>
        </div>
      </section>
    </div>
  );
}
