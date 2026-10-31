"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductVisual } from "@/components/product-visual";
import { formatMoney, formatShopPrice } from "@/lib/currency";
import { useI18n } from "@/components/i18n-provider";
import { useCart } from "./cart-provider";

export function CartView({ signedIn }: { signedIn: boolean }) {
  const { items, ready, totalCents, pricing, setQuantity, remove } = useCart();
  const { t } = useI18n();

  if (!ready) {
    return <div className="h-60 animate-pulse rounded-(--store-radius) bg-card" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-(--store-radius) bg-card px-6 py-16 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 font-semibold">{t("cart.empty")}</p>
        <Link
          href="/products"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t("cart.browse")}
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-border/70 rounded-(--store-radius) bg-card px-4 sm:px-6">
        {items.map((item) => {
          return (
            <li key={item.productId} className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap">
              <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary p-1.5">
                <ProductVisual imageUrl={item.imageUrl} icon={item.icon} iconColor={item.iconColor} iconClassName="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                  {item.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{t("cart.each", { price: formatShopPrice(item.priceCents, pricing) })}</p>
              </div>
              <div className="inline-flex items-center rounded-full border border-border">
                <button
                  type="button"
                  aria-label={t("cart.decrease", { name: item.name })}
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  className="grid size-8 place-items-center rounded-full hover:bg-secondary"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={t("cart.increase", { name: item.name })}
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= 20}
                  className="grid size-8 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <span className="w-20 text-end text-sm font-semibold tabular-nums">
                {formatShopPrice(item.priceCents * item.quantity, pricing)}
              </span>
              <button
                type="button"
                aria-label={t("cart.remove", { name: item.name })}
                onClick={() => remove(item.productId)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-(--store-radius) bg-card p-6 lg:sticky lg:top-20">
        <h2 className="font-semibold">{t("cart.summary")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
            <dd className="tabular-nums">{formatShopPrice(totalCents, pricing)}</dd>
          </div>
          <div className="flex justify-between border-t border-border/70 pt-2 text-base font-semibold">
            <dt>{t("cart.total")}</dt>
            <dd className="tabular-nums">{formatShopPrice(totalCents, pricing)}</dd>
          </div>
          {pricing.display !== pricing.store && (
            <p className="text-xs text-muted-foreground">
              {t("cart.approximate", { amount: formatMoney(totalCents, pricing.store, pricing.intl), currency: pricing.store })}
            </p>
          )}
        </dl>
        <Link
          href={signedIn ? "/checkout" : "/login?next=/checkout"}
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90"
        >
          {signedIn ? t("cart.checkout") : t("cart.signInToCheckout")}
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </Link>
        <Link href="/products" className="mt-3 block text-center text-sm font-semibold text-muted-foreground hover:text-foreground">
          {t("cart.continue")}
        </Link>
      </aside>
    </div>
  );
}
