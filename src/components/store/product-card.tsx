import Link from "next/link";
import { Check } from "lucide-react";
import { DynamicIcon } from "@/lib/icons";
import { discountPercent, formatPrice } from "@/lib/money";
import type { Product } from "@/lib/queries";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product, currency }: { product: Product; currency: string }) {
  const discount = discountPercent(product.priceCents, product.compareAtCents);
  const href = `/products/${product.slug}`;

  return (
    <div className="store-card group flex flex-col justify-between p-4">
      <div>
        {product.categoryName && (
          <Link
            href={`/categories/${product.categorySlug}`}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted"
          >
            <DynamicIcon icon={product.categoryIcon} className="size-3" />
            {product.categoryName}
          </Link>
        )}
        <div className="my-3 flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary p-2 transition-colors group-hover:border-primary/50">
            <DynamicIcon icon={product.icon} className="size-5" style={{ color: product.iconColor }} />
          </div>
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug font-semibold tracking-[-0.025em] text-foreground transition-colors group-hover:text-primary">
            <Link href={href}>{product.name}</Link>
          </h3>
        </div>
        {product.features.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {product.features.slice(0, 3).map((feature) => (
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
          {product.buyersThisMonth > 0 && (
            <p className="mb-1 text-[11px] text-muted-foreground">{product.buyersThisMonth} buyers this month</p>
          )}
          <span className="text-xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatPrice(product.priceCents, currency)}
          </span>
          {discount > 0 && product.compareAtCents && (
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
              <span className="text-muted-foreground tabular-nums line-through">{formatPrice(product.compareAtCents, currency)}</span>
              <span className="rounded bg-signal-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold text-signal-emerald">
                {discount}% off
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href={href}
            aria-label={`View details for ${product.name}`}
            className="flex min-h-[38px] items-center justify-center rounded-full border border-border bg-secondary px-3 py-2 font-medium text-secondary-foreground transition-colors hover:bg-muted"
          >
            Details
          </Link>
          <AddToCartButton
            label="Add"
            className="min-h-[38px] px-3 py-2"
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              icon: product.icon,
              iconColor: product.iconColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products, currency }: { products: Product[]; currency: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currency={currency} />
      ))}
    </div>
  );
}
