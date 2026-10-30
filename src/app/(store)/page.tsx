import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryChips } from "@/components/store/category-chips";
import { Guarantee } from "@/components/store/guarantee";
import { Hero, type HeroSlide } from "@/components/store/hero";
import { ProductGrid } from "@/components/store/product-card";
import { formatShopPrice } from "@/lib/currency";
import { getPricing } from "@/lib/pricing";
import { getCategories, getProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [categories, featured, all, settings] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true, limit: 8 }),
    getProducts(),
    getSettings(),
  ]);
  const pricing = await getPricing();
  const { sections } = settings;
  const showcase = featured.length > 0 ? featured : all.slice(0, 8);

  // Cards chosen in admin Settings; hidden or deleted products are skipped.
  const chosenSlides = settings.heroCards.flatMap((card, index): HeroSlide[] => {
    const product = card.productId ? all.find((item) => item.id === card.productId) : null;
    if (card.productId && !product) return [];
    if (!product) {
      const title = card.title || "Browse the catalog";
      return [{ key: `card-${index}`, label: card.label, title, detail: card.detail || "All products", largeDetail: false, href: "/products" }];
    }
    return [
      {
        key: `card-${index}`,
        label: card.label,
        title: card.title || product.name,
        detail: card.detail || formatShopPrice(product.priceCents, pricing),
        largeDetail: !card.detail,
        href: `/products/${product.slug}`,
        cartItem:
          card.action === "cart"
            ? {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                icon: product.icon,
                iconColor: product.iconColor,
                imageUrl: product.imageUrl,
              }
            : undefined,
      },
    ];
  });

  const slides: HeroSlide[] =
    chosenSlides.length > 0
      ? chosenSlides
      : [
          {
            key: "intro",
            label: "",
            title: `${all.length} tools for makers and creators`,
            detail: "Delivered automatically",
            largeDetail: false,
            href: "/products",
          },
          ...showcase.slice(0, 4).map((product) => ({
            key: product.slug,
            label: "",
            title: product.name,
            detail: formatShopPrice(product.priceCents, pricing),
            largeDetail: true,
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
                <ProductGrid products={showcase} pricing={pricing} />
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
