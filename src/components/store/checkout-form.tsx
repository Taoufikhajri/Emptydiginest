"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { placeOrder } from "@/app/actions/checkout";
import { ProductVisual } from "@/components/product-visual";
import { formatMoney, formatShopPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-provider";

export type CheckoutProvider = { id: string; label: string; description: string; demo: boolean };

export function CheckoutForm({ providers, email }: { providers: CheckoutProvider[]; email: string }) {
  const { items, ready, totalCents, pricing } = useCart();
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const [provider, setProvider] = useState(providers[0]?.id ?? "");

  if (!ready) return <div className="h-60 animate-pulse rounded-(--store-radius) bg-card" />;

  if (items.length === 0) {
    return (
      <div className="rounded-(--store-radius) bg-card px-6 py-14 text-center">
        <p className="font-semibold">Your cart is empty</p>
        <Link href="/products" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
          Browse the catalog
        </Link>
      </div>
    );
  }

  const cart = JSON.stringify(items.map(({ productId, quantity }) => ({ productId, quantity })));

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <input type="hidden" name="cart" value={cart} />
      <div className="space-y-6">
        <section className="rounded-(--store-radius) bg-card p-6">
          <h2 className="font-semibold">Delivery</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your order details will be on the order page and sent to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </section>

        <fieldset className="rounded-(--store-radius) bg-card p-6">
          <legend className="sr-only">Payment method</legend>
          <h2 className="font-semibold">Payment method</h2>
          {providers.length === 0 ? (
            <p className="mt-3 text-sm text-destructive">No payment method is set up yet. Please contact support.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {providers.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                    provider === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={option.id}
                    checked={provider === option.id}
                    onChange={() => setProvider(option.id)}
                    className="mt-1 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {option.label}
                      {option.demo && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                          Demo mode
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      </div>

      <aside className="h-fit rounded-(--store-radius) bg-card p-6 lg:sticky lg:top-20">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            return (
              <li key={item.productId} className="flex items-center gap-3 text-sm">
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-secondary p-1">
                  <ProductVisual imageUrl={item.imageUrl} icon={item.icon} iconColor={item.iconColor} iconClassName="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="tabular-nums">{formatShopPrice(item.priceCents * item.quantity, pricing)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border/70 pt-3 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatShopPrice(totalCents, pricing)}</span>
        </div>
        {pricing.display !== pricing.store && (
          <div className="mt-2 flex justify-between rounded-xl bg-secondary px-3 py-2 text-sm">
            <span>You&apos;ll be charged</span>
            <span className="font-semibold tabular-nums">{formatMoney(totalCents, pricing.store)}</span>
          </div>
        )}
        {state?.error && (
          <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending || providers.length === 0}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {pending ? "Creating your order..." : "Place order and pay"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Final prices are confirmed on the server when you place the order.
        </p>
      </aside>
    </form>
  );
}
