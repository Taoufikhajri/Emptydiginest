"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, type CartItem } from "./cart-provider";

type AddToCartButtonProps = {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, quantity = 1, className, label = "Add to cart" }: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        add(product, quantity);
        setAdded(true);
      }}
      aria-label={`Add ${product.name} to cart`}
      className={cn(
        "flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary font-semibold text-primary-foreground shadow-xs transition-all hover:opacity-90",
        added && "bg-signal-emerald",
        className,
      )}
    >
      {added ? <Check className="size-3.5" /> : <ShoppingBag className="size-3.5" />}
      <span aria-live="polite">{added ? "Added" : label}</span>
    </button>
  );
}
