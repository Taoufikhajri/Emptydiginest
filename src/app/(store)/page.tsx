import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryChips } from "@/components/store/category-chips";
import { Guarantee } from "@/components/store/guarantee";
import { Hero, type HeroSlide } from "@/components/store/hero";
import { ProductGrid } from "@/components/store/product-card";
import { formatPrice } from "@/lib/money";
import { getCategories, getProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [categories, featured, all, settings] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true, limit: 8 }),
    getProducts(),
    getSettings(),
  ]);
  const { sections } = settings;
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
      detail: formatPrice(product.priceCents, settings.currency),
      href: `/products/${product.slug}`,
    })),
  ];

  return (
    <>
      {sections.hero ? (
        <Hero
          slides={slides}
          content={{
            storeName: settings.storeName,
            titleLead: settings.heroTitleLead,
            titleAccent: settings.heroTitleAccent,
            subtitle: settings.heroSubtitle,
            cardStyle: settings.heroCardStyle,
          }}
        />
      ) : (
        <h1 className="sr-only">{settings.storeName}</h1>
      )}
      {sections.guarantee && <Guarantee />}
      {(sections.categories || sections.popular) && (
        <section className="mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.045em] text-foreground">
              {sections.popular ? "Popular right now" : "Browse by category"}
            </h2>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          {sections.categories && (
            <div className="mt-4">
              <CategoryChips categories={categories} totalCount={all.length} />
            </div>
          )}
          {sections.popular && (
            <div className="mt-6">
              {showcase.length > 0 ? (
                <ProductGrid products={showcase} currency={settings.currency} />
              ) : (
                <p className="rounded-(--store-radius) bg-card px-6 py-14 text-center text-muted-foreground">
                  No products yet. Add some from the admin dashboard.
                </p>
              )}
            </div>
          )}
        </section>
      )}
      {!sections.hero && !sections.guarantee && !sections.categories && !sections.popular && (
        <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
            Browse all products
            <ArrowRight className="size-4" />
          </Link>
        </section>
      )}
    </>
  );
}
