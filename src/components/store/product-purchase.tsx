"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, Zap } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { useCart, type CartItem } from "./cart-provider";

export function ProductPurchase({ product }: { product: Omit<CartItem, "quantity"> }) {
  const router = useRouter();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Quantity</span>
        <div className="inline-flex items-center rounded-full border border-border bg-card">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid size-9 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
            disabled={quantity <= 1}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((value) => Math.min(20, value + 1))}
            className="grid size-9 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
            disabled={quantity >= 20}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <AddToCartButton product={product} quantity={quantity} className="h-12 text-sm" />
        <button
          type="button"
          onClick={() => {
            add(product, quantity);
            router.push("/cart");
          }}
          className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-foreground text-sm font-semibold text-background hover:opacity-90"
        >
          <Zap className="size-4" />
          Buy now
        </button>
      </div>
    </div>
  );
}
