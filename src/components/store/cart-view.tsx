"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/money";
import { useCart } from "./cart-provider";

export function CartView({ signedIn }: { signedIn: boolean }) {
  const { items, ready, totalCents, currency, setQuantity, remove } = useCart();

  if (!ready) {
    return <div className="h-60 animate-pulse rounded-(--store-radius) bg-card" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-(--store-radius) bg-card px-6 py-16 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 font-semibold">Your cart is empty</p>
        <Link
          href="/products"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Browse the catalog
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-border/70 rounded-(--store-radius) bg-card px-4 sm:px-6">
        {items.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <li key={item.productId} className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
                <Icon className="size-6" style={{ color: item.iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                  {item.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{formatPrice(item.priceCents, currency)} each</p>
              </div>
              <div className="inline-flex items-center rounded-full border border-border">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  className="grid size-8 place-items-center rounded-full hover:bg-secondary"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= 20}
                  className="grid size-8 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <span className="w-20 text-end text-sm font-semibold tabular-nums">
                {formatPrice(item.priceCents * item.quantity, currency)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
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
        <h2 className="font-semibold">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(totalCents, currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-border/70 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(totalCents, currency)}</dd>
          </div>
        </dl>
        <Link
          href={signedIn ? "/checkout" : "/login?next=/checkout"}
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90"
        >
          {signedIn ? "Checkout" : "Sign in to checkout"}
          <ArrowRight className="size-4" />
        </Link>
        <Link href="/products" className="mt-3 block text-center text-sm font-semibold text-muted-foreground hover:text-foreground">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
