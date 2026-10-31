import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Mail, ShieldCheck, Zap } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductVisual } from "@/components/product-visual";
import { formatShopPrice } from "@/lib/currency";
import { getProductLocalizer } from "@/lib/i18n/localize";
import { getI18n } from "@/lib/i18n/server";
import { discountPercent } from "@/lib/money";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { getPricing } from "@/lib/pricing";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getProductBySlug((await params).slug);
  if (!found) return { title: (await getI18n()).t("product.notFound") };
  const product = (await getProductLocalizer())(found);
  return { title: product.name, description: product.description };
}

const promises = [
  { icon: Zap, key: "product.promiseDelivery" },
  { icon: Mail, key: "product.promiseDetails" },
  { icon: ShieldCheck, key: "product.promiseGuarantee" },
] as const;

export default async function ProductPage({ params }: Props) {
  const found = await getProductBySlug((await params).slug);
  if (!found) notFound();
  const product = (await getProductLocalizer())(found);

  const [related, pricing, { t }] = await Promise.all([getRelatedProducts(product), getPricing(), getI18n()]);
  const discount = discountPercent(product.priceCents, product.compareAtCents);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("catalog.home")}
        </Link>
        <span className="mx-1.5">/</span>
        {product.categorySlug ? (
          <Link href={`/categories/${product.categorySlug}`} className="hover:text-foreground">
            {product.categoryName}
          </Link>
        ) : (
          <Link href="/products" className="hover:text-foreground">
            {t("product.products")}
          </Link>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div className="flex aspect-[4/3] items-center justify-center rounded-(--store-radius) bg-card shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)]">
          {product.imageUrl ? (
            <ProductVisual imageUrl={product.imageUrl} icon={product.icon} iconColor={product.iconColor} className="max-h-[70%] max-w-[70%]" />
          ) : (
            <div className="grid size-32 place-items-center rounded-3xl border border-border bg-secondary sm:size-40">
              <ProductVisual icon={product.icon} iconColor={product.iconColor} iconClassName="size-16 sm:size-20" />
            </div>
          )}
        </div>

        <div className="rounded-(--store-radius) bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
          {product.categoryName && (
            <Link
              href={`/categories/${product.categorySlug}`}
              className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-muted"
            >
              {product.categoryName}
            </Link>
          )}
          <h1 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.03em] sm:text-3xl">{product.name}</h1>
          {product.buyersThisMonth > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">{t("product.buyers", { count: product.buyersThisMonth })}</p>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatShopPrice(product.priceCents, pricing)}</span>
            {discount > 0 && product.compareAtCents && (
              <>
                <span className="text-muted-foreground tabular-nums line-through">{formatShopPrice(product.compareAtCents, pricing)}</span>
                <span className="rounded bg-signal-emerald/10 px-2 py-0.5 text-xs font-semibold text-signal-emerald">
                  {t("product.off", { percent: discount })}
                </span>
              </>
            )}
          </div>

          <div className="mt-6">
            <ProductPurchase
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

          <ul className="mt-6 space-y-2.5 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            {promises.map(({ icon: PromiseIcon, key }) => (
              <li key={key} className="flex items-center gap-2.5">
                <PromiseIcon className="size-4 shrink-0 text-primary" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <section className="rounded-(--store-radius) bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
          <h2 className="font-semibold">{t("product.about")}</h2>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {product.description || t("product.noDescription")}
          </p>
        </section>
        {product.features.length > 0 && (
          <section className="rounded-(--store-radius) bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
            <h2 className="font-semibold">{t("product.included")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-signal-emerald" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold tracking-[-0.045em]">
            {product.categoryName ? t("product.moreIn", { category: product.categoryName }) : t("product.moreFromStore")}
          </h2>
          <div className="mt-4">
            <ProductGrid products={related} pricing={pricing} />
          </div>
        </section>
      )}
    </div>
  );
}
