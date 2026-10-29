import Link from "next/link";
import type { Category } from "@/lib/queries";
import { cn } from "@/lib/utils";

type CategoryChipsProps = {
  categories: Category[];
  activeSlug?: string;
  totalCount: number;
};

export function CategoryChips({ categories, activeSlug, totalCount }: CategoryChipsProps) {
  const chips = [
    { slug: undefined, href: "/products", label: "All", count: totalCount },
    ...categories.map((category) => ({
      slug: category.slug,
      href: `/categories/${category.slug}`,
      label: category.name,
      count: category.productCount,
    })),
  ];

  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {chips.map((chip) => {
        const selected = chip.slug === activeSlug;
        return (
          <Link
            key={chip.href}
            href={chip.href}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-all",
              selected
                ? "border-primary bg-primary px-3.5 font-semibold text-primary-foreground shadow-xs"
                : "border-border bg-card font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {chip.label} ({chip.count})
          </Link>
        );
      })}
    </nav>
  );
}
