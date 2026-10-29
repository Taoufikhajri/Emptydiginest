import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Mail, ShieldCheck, Zap } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { ProductPurchase } from "@/components/store/product-purchase";
import { DynamicIcon } from "@/lib/icons";
import { discountPercent, formatPrice } from "@/lib/money";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product ? { title: product.name, description: product.description } : { title: "Product not found" };
}

const promises = [
  { icon: Zap, text: "Delivered automatically once payment is confirmed" },
  { icon: Mail, text: "Details on your order page and by email" },
  { icon: ShieldCheck, text: "Replaced or refunded if it doesn't work" },
];

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const discount = discountPercent(product.priceCents, product.compareAtCents);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        {product.categorySlug ? (
          <Link href={`/categories/${product.categorySlug}`} className="hover:text-foreground">
            {product.categoryName}
          </Link>
        ) : (
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div className="flex aspect-[4/3] items-center justify-center rounded-[28px] bg-card shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)]">
          <div className="grid size-32 place-items-center rounded-3xl border border-border bg-secondary sm:size-40">
            <DynamicIcon icon={product.icon} className="size-16 sm:size-20" style={{ color: product.iconColor }} />
          </div>
        </div>

        <div className="rounded-[28px] bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
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
            <p className="mt-2 text-sm text-muted-foreground">{product.buyersThisMonth} buyers this month</p>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatPrice(product.priceCents)}</span>
            {discount > 0 && product.compareAtCents && (
              <>
                <span className="text-muted-foreground tabular-nums line-through">{formatPrice(product.compareAtCents)}</span>
                <span className="rounded bg-signal-emerald/10 px-2 py-0.5 text-xs font-semibold text-signal-emerald">
                  {discount}% off
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
              }}
            />
          </div>

          <ul className="mt-6 space-y-2.5 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            {promises.map(({ icon: PromiseIcon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <PromiseIcon className="size-4 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <section className="rounded-[28px] bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
          <h2 className="font-semibold">About this product</h2>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {product.description || "No description yet."}
          </p>
        </section>
        {product.features.length > 0 && (
          <section className="rounded-[28px] bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
            <h2 className="font-semibold">What&apos;s included</h2>
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
            More in {product.categoryName ?? "the store"}
          </h2>
          <div className="mt-4">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
