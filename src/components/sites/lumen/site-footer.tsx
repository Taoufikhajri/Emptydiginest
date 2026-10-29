import { BrandMark } from "./brand-mark";
import { categories } from "./products";
import { siteConfig } from "./site-config";

const legalLinks = ["Terms of service", "Privacy policy", "Guarantee & refunds", "Legal notice"];
const helpLinks = ["Find an order", "Affiliates", "Partner program", "Journal", "Contact"];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <BrandMark className="size-7" />
              {siteConfig.name}
            </a>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
          </div>
          <FooterColumn
            title="Browse"
            links={["All products", ...categories.map((category) => category.label)]}
          />
          <FooterColumn title="Legal" links={legalLinks} />
          <FooterColumn title="Help" links={helpLinks} />
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.copyrightHolder}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="hover:text-foreground">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
