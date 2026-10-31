import Link from "next/link";
import { Search } from "lucide-react";
import type { Category, Product } from "@/lib/queries";
import { getI18n } from "@/lib/i18n/server";
import { getPricing } from "@/lib/pricing";
import { CategoryChips } from "./category-chips";
import { ProductGrid } from "./product-card";

type CatalogViewProps = {
  title: string;
  description?: string;
  categories: Category[];
  products: Product[];
  totalCount: number;
  activeSlug?: string;
  search?: string;
  // Path the search form submits to, so searching stays within the current category.
  action: string;
};

export async function CatalogView({ title, description, categories, products, totalCount, activeSlug, search, action }: CatalogViewProps) {
  const [pricing, { t }] = await Promise.all([getPricing(), getI18n()]);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("catalog.home")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}

      <div className="mt-6">
        <CategoryChips categories={categories} activeSlug={activeSlug} totalCount={totalCount} />
      </div>

      <form action={action} role="search" className="relative mt-4 block w-full sm:w-80">
        <label htmlFor="catalog-search" className="sr-only">
          {t("catalog.search")}
        </label>
        <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          id="catalog-search"
          name="q"
          type="search"
          defaultValue={search}
          placeholder={t("catalog.search")}
          className="w-full rounded border border-border bg-card py-1.5 ps-9 pe-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </form>

      {search && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("catalog.results", { count: products.length, query: search })}
          <Link href={action} className="ms-2 font-semibold text-primary hover:underline">
            {t("catalog.clear")}
          </Link>
        </p>
      )}

      <div className="mt-6">
        {products.length > 0 ? (
          <ProductGrid products={products} pricing={pricing} />
        ) : (
          <div className="rounded-(--store-radius) bg-card px-6 py-14 text-center">
            <p className="font-semibold">{t("catalog.noResults")}</p>
            <Link href="/products" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              {t("catalog.seeAll")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
