"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  GraduationCap,
  Palette,
  Clapperboard,
  Search,
  Timer,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categories,
  discountPercent,
  formatPrice,
  products,
  type CategoryId,
  type Product,
} from "./products";

const categoryIcons: Record<CategoryId, LucideIcon> = {
  design: Palette,
  developer: Code2,
  productivity: Timer,
  media: Clapperboard,
  learning: GraduationCap,
};

type CatalogProps = {
  query: string;
  onQueryChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
};

type DialogState = { product: Product; mode: "details" | "checkout" | "done" } | null;

export function Catalog({ query, onQueryChange, category, onCategoryChange }: CatalogProps) {
  const [dialog, setDialog] = useState<DialogState>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (category === "all" || product.category === category) &&
        (!needle || product.name.toLowerCase().includes(needle)),
    );
  }, [query, category]);

  const chips = [
    { id: "all", label: "All", count: products.length },
    ...categories.map((item) => ({
      id: item.id,
      label: item.label,
      count: products.filter((product) => product.category === item.id).length,
    })),
  ];

  return (
    <section id="catalog" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold tracking-[-0.045em] text-foreground">Catalog</h2>

        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((chip) => {
            const selected = chip.id === category;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onCategoryChange(chip.id)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-all",
                  selected
                    ? "border-primary bg-primary px-3.5 font-semibold text-primary-foreground shadow-xs"
                    : "border-border bg-card font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {chip.label} ({chip.count})
              </button>
            );
          })}
        </div>

        <label className="relative mt-4 block w-full sm:w-80">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search products"
            className="w-full rounded border border-border bg-card py-1.5 ps-9 pe-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </label>

        {visible.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetails={() => setDialog({ product, mode: "details" })}
                onBuy={() => setDialog({ product, mode: "checkout" })}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] bg-card px-6 py-14 text-center">
            <p className="font-semibold">No products match &ldquo;{query}&rdquo;</p>
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                onCategoryChange("all");
              }}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {dialog && <ProductDialog state={dialog} onChange={setDialog} />}
    </section>
  );
}

function ProductCard({
  product,
  onDetails,
  onBuy,
}: {
  product: Product;
  onDetails: () => void;
  onBuy: () => void;
}) {
  const CategoryIcon = categoryIcons[product.category];
  const ProductIcon = product.icon;
  const label = categories.find((item) => item.id === product.category)?.label;
  const discount = discountPercent(product);

  return (
    <div className="store-card group flex flex-col justify-between p-4">
      <div>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
          <CategoryIcon className="size-3" />
          {label}
        </span>
        <div className="my-3 flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary p-2 transition-colors group-hover:border-primary/50">
            <ProductIcon className="size-5" style={{ color: product.iconColor }} />
          </div>
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug font-semibold tracking-[-0.025em] text-foreground transition-colors group-hover:text-primary">
            <button type="button" onClick={onDetails} className="text-start">
              {product.name}
            </button>
          </h3>
        </div>
        {product.features && (
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 truncate">
                <Check className="size-3.5 shrink-0 text-signal-emerald" />
                <span className="truncate">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 border-t border-border/70 pt-3">
        <div className="mb-3">
          {product.buyersThisMonth && (
            <p className="mb-1 text-[11px] text-muted-foreground">
              {product.buyersThisMonth} buyers this month
            </p>
          )}
          <span className="text-xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compareAt && (
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
              <span className="text-muted-foreground tabular-nums line-through">
                {formatPrice(product.compareAt)}
              </span>
              <span className="rounded bg-signal-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold text-signal-emerald">
                {discount}% off
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={onDetails}
            aria-label={`View details for ${product.name}`}
            className="flex min-h-[38px] cursor-pointer items-center justify-center rounded-full border border-border bg-secondary px-3 py-2 font-medium text-secondary-foreground transition-colors hover:bg-muted"
          >
            Details
          </button>
          <button
            type="button"
            onClick={onBuy}
            aria-label={`Buy ${product.name}`}
            className="flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-xs transition-all hover:opacity-90"
          >
            Buy
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDialog({
  state,
  onChange,
}: {
  state: NonNullable<DialogState>;
  onChange: (state: DialogState) => void;
}) {
  const { product, mode } = state;
  const ProductIcon = product.icon;
  const close = () => onChange(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onChange(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onChange]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md rounded-t-[28px] bg-card p-6 shadow-2xl duration-200 sm:rounded-[28px]"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary">
            <ProductIcon className="size-6" style={{ color: product.iconColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="product-dialog-title" className="font-semibold leading-snug tracking-tight">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xl font-semibold tabular-nums">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="grid size-8 place-items-center rounded-full hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>

        {mode === "details" && (
          <>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {(product.features ?? ["Delivered by email in seconds", "Covered by the guarantee"]).map(
                (feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-signal-emerald" />
                    {feature}
                  </li>
                ),
              )}
            </ul>
            <button
              type="button"
              onClick={() => onChange({ product, mode: "checkout" })}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90"
            >
              Buy
              <ArrowRight className="size-4" />
            </button>
          </>
        )}

        {mode === "checkout" && (
          <>
            <div className="mt-5 rounded-2xl bg-secondary p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPrice(product.price)}</span>
              </div>
              <div className="mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(product.price)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo checkout: no payment is taken and nothing is collected.
            </p>
            <button
              type="button"
              onClick={() => onChange({ product, mode: "done" })}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90"
            >
              Place demo order
            </button>
          </>
        )}

        {mode === "done" && (
          <div className="mt-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-signal-emerald/10">
              <Check className="size-6 text-signal-emerald" />
            </div>
            <p className="mt-3 font-semibold">Demo order placed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect a real checkout provider to sell this product.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-5 h-11 w-full rounded-full border border-border bg-secondary font-semibold hover:bg-muted"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
