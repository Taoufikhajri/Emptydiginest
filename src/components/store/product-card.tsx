import Link from "next/link";
import { Check } from "lucide-react";
import { ProductVisual } from "@/components/product-visual";
import { getProductLocalizer } from "@/lib/i18n/localize";
import { getI18n } from "@/lib/i18n/server";
import { DynamicIcon } from "@/lib/icons";
import { formatShopPrice, type Pricing } from "@/lib/currency";
import { discountPercent } from "@/lib/money";
import type { Product } from "@/lib/queries";
import { AddToCartButton } from "./add-to-cart-button";

export async function ProductCard({ product, pricing }: { product: Product; pricing: Pricing }) {
  const { t } = await getI18n();
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
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary p-1.5 transition-colors group-hover:border-primary/50">
            <ProductVisual imageUrl={product.imageUrl} icon={product.icon} iconColor={product.iconColor} iconClassName="size-5" />
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
            <p className="mb-1 text-[11px] text-muted-foreground">{t("product.buyers", { count: product.buyersThisMonth })}</p>
          )}
          <span className="text-xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatShopPrice(product.priceCents, pricing)}
          </span>
          {discount > 0 && product.compareAtCents && (
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
              <span className="text-muted-foreground tabular-nums line-through">{formatShopPrice(product.compareAtCents, pricing)}</span>
              <span className="rounded bg-signal-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold text-signal-emerald">
                {t("product.off", { percent: discount })}
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href={href}
            aria-label={t("product.viewDetails", { name: product.name })}
            className="flex min-h-[38px] items-center justify-center rounded-full border border-border bg-secondary px-3 py-2 font-medium text-secondary-foreground transition-colors hover:bg-muted"
          >
            {t("product.details")}
          </Link>
          <AddToCartButton
            label={t("product.add")}
            className="min-h-[38px] px-3 py-2"
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              icon: product.icon,
              iconColor: product.iconColor,
              imageUrl: product.imageUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export async function ProductGrid({ products, pricing }: { products: Product[]; pricing: Pricing }) {
  const localize = await getProductLocalizer();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={localize(product)} pricing={pricing} />
      ))}
    </div>
  );
}
