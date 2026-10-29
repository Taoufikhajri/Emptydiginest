import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { BrandMark } from "./brand-mark";

type FooterLink = { label: string; href: string };

export function SiteFooter({ categories }: { categories: { slug: string; name: string }[] }) {
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
    { label: "Contact", href: `mailto:${siteConfig.supportEmail}` },
  ];

  return (
    <footer className="mt-auto border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <BrandMark className="size-7" />
              {siteConfig.name}
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
          </div>
          <FooterColumn title="Browse" links={browse} />
          <FooterColumn title="Legal" links={legal} />
          <FooterColumn title="Help" links={help} />
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
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
