import Link from "next/link";
import { BrandMark } from "./brand-mark";
import type { StoreBrand } from "./site-header";

type FooterLink = { label: string; href: string };

type SiteFooterProps = {
  brand: StoreBrand;
  description: string;
  supportEmail: string;
  categories: { slug: string; name: string }[];
};

export function SiteFooter({ brand, description, supportEmail, categories }: SiteFooterProps) {
  const browse: FooterLink[] = [
    { label: "All products", href: "/products" },
    ...categories.map((category) => ({ label: category.name, href: `/categories/${category.slug}` })),
  ];
  const legal: FooterLink[] = [
    { label: "Terms of service", href: "/terms" },
    { label: "Privacy policy", href: "/privacy" },
    { label: "Guarantee & refunds", href: "/guarantee" },
  ];
  const help: FooterLink[] = [
    { label: "My orders", href: "/account" },
    { label: "Cart", href: "/cart" },
    ...(supportEmail ? [{ label: "Contact", href: `mailto:${supportEmail}` }] : []),
  ];

  return (
    <footer className="mt-auto border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <BrandMark logoUrl={brand.logoUrl} className="h-7" />
              <span className={brand.showName ? undefined : "sr-only"}>{brand.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{description}</p>
          </div>
          <FooterColumn title="Browse" links={browse} />
          <FooterColumn title="Legal" links={legal} />
          <FooterColumn title="Help" links={help} />
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
