import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/store/catalog-view";
import { getCategoryLocalizer } from "@/lib/i18n/localize";
import { getI18n } from "@/lib/i18n/server";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/queries";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return { title: (await getI18n()).t("catalog.categoryNotFound") };
  return { title: (await getCategoryLocalizer())(category).name };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const search = typeof q === "string" ? q.slice(0, 100) : undefined;
  const [categories, products, all] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: slug, search }),
    getProducts(),
  ]);

  return (
    <CatalogView
      title={(await getCategoryLocalizer())(category).name}
      categories={categories}
      products={products}
      totalCount={all.length}
      activeSlug={slug}
      search={search}
      action={`/categories/${slug}`}
    />
  );
}
