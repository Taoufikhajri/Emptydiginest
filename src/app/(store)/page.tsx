import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryChips } from "@/components/store/category-chips";
import { Guarantee } from "@/components/store/guarantee";
import { Hero, type HeroSlide } from "@/components/store/hero";
import { ProductGrid } from "@/components/store/product-card";
import { formatPrice } from "@/lib/money";
import { getCategories, getProducts } from "@/lib/queries";

export default async function HomePage() {
  const [categories, featured, all] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true, limit: 8 }),
    getProducts(),
  ]);
  const showcase = featured.length > 0 ? featured : all.slice(0, 8);

  const slides: HeroSlide[] = [
    {
      key: "intro",
      title: `${all.length} tools for makers and creators`,
      detail: "Delivered automatically",
      href: "/products",
    },
    ...showcase.slice(0, 4).map((product) => ({
      key: product.slug,
      title: product.name,
      detail: formatPrice(product.priceCents),
      href: `/products/${product.slug}`,
    })),
  ];

  return (
    <>
      <Hero slides={slides} />
      <Guarantee />
      <section className="mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.045em] text-foreground">Popular right now</h2>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-4">
          <CategoryChips categories={categories} totalCount={all.length} />
        </div>
        <div className="mt-6">
          {showcase.length > 0 ? (
            <ProductGrid products={showcase} />
          ) : (
            <p className="rounded-[28px] bg-card px-6 py-14 text-center text-muted-foreground">
              No products yet. Add some from the admin dashboard.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
