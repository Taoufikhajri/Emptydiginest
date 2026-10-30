import type { Metadata } from "next";
import { StoreTheme } from "@/components/store-theme";
import { CartProvider } from "@/components/store/cart-provider";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.tagline ? `${settings.storeName} | ${settings.tagline}` : settings.storeName,
      template: `%s | ${settings.storeName}`,
    },
    description: settings.description,
    icons: { icon: settings.logoUrl ?? "/favicon.ico" },
  };
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, user, settings] = await Promise.all([getCategories(), getCurrentUser(), getSettings()]);
  const navCategories = categories.map(({ slug, name }) => ({ slug, name }));
  const brand = { name: settings.storeName, logoUrl: settings.logoUrl, showName: settings.showNameWithLogo || !settings.logoUrl };

  return (
    <CartProvider currency={settings.currency}>
      <StoreTheme settings={settings} />
      {settings.announcement && (
        <div className="bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">{settings.announcement}</div>
      )}
      {/* No Suspense here: the header must hydrate with the cart provider, before stored cart items load. */}
      <SiteHeader brand={brand} categories={navCategories} user={user && { name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        brand={brand}
        description={settings.description}
        supportEmail={settings.supportEmail}
        categories={navCategories}
      />
    </CartProvider>
  );
}
