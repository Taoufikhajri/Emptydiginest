import { CartProvider } from "@/components/store/cart-provider";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);
  const navCategories = categories.map(({ slug, name }) => ({ slug, name }));

  return (
    <CartProvider>
      {/* No Suspense here: the header must hydrate with the cart provider, before stored cart items load. */}
      <SiteHeader categories={navCategories} user={user && { name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={navCategories} />
    </CartProvider>
  );
}
