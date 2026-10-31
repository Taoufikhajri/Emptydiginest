import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog-view";
import { getI18n } from "@/lib/i18n/server";
import { getCategories, getProducts } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("catalog.allTitle") };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.slice(0, 100) : undefined;
  const [categories, products, all, { t }] = await Promise.all([getCategories(), getProducts({ search }), getProducts(), getI18n()]);

  return (
    <CatalogView
      title={t("catalog.allTitle")}
      description={t("catalog.allDescription")}
      categories={categories}
      products={products}
      totalCount={all.length}
      search={search}
      action="/products"
    />
  );
}
