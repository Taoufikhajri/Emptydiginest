import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog-view";
import { getCategories, getProducts } from "@/lib/queries";

export const metadata: Metadata = { title: "All products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.slice(0, 100) : undefined;
  const [categories, products, all] = await Promise.all([getCategories(), getProducts({ search }), getProducts()]);

  return (
    <CatalogView
      title="All products"
      description="Every tool in the store, delivered by email right after payment."
      categories={categories}
      products={products}
      totalCount={all.length}
      search={search}
      action="/products"
    />
  );
}
