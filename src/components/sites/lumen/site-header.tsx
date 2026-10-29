"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { categories } from "./products";
import { siteConfig } from "./site-config";

type SiteHeaderProps = {
  query: string;
  onSearch: (query: string) => void;
  onSelectCategory: (category: string) => void;
};

export function SiteHeader({ query, onSearch, onSelectCategory }: SiteHeaderProps) {
  const [browseOpen, setBrowseOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);

  // "/" focuses the search field, as on the reference site.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(target.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setBrowseOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) {
        setBrowseOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const pickCategory = (id: string) => {
    onSelectCategory(id);
    setBrowseOpen(false);
    setMenuOpen(false);
    // Wait for the menu to collapse so the scroll target is measured after layout shifts.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }),
      ),
    );
  };

  const searchField = (className: string, autoFocus = false) => (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Search products</span>
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={autoFocus ? undefined : searchRef}
        autoFocus={autoFocus}
        type="search"
        value={query}
        placeholder="Search Brushwork, Framecut, Inkpad..."
        onChange={(event) => onSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="h-9 w-full rounded-full border border-border bg-card ps-9 pe-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
      {!autoFocus && (
        <kbd className="pointer-events-none absolute end-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded border border-border text-[10px] text-muted-foreground">
          /
        </kbd>
      )}
    </label>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:gap-3 lg:px-8">
        <a href="#" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight">
          <BrandMark className="size-8" />
          <span className="text-[17px]">{siteConfig.name}</span>
        </a>

        <nav className="ms-4 hidden items-center gap-1 text-sm text-foreground/80 lg:flex">
          <div ref={browseRef} className="relative">
            <button
              type="button"
              aria-expanded={browseOpen}
              onClick={() => setBrowseOpen((open) => !open)}
              className="inline-flex h-9 items-center gap-1 rounded-full px-3 hover:bg-secondary hover:text-foreground"
            >
              Browse
              <ChevronDown className={cn("size-4 transition-transform", browseOpen && "rotate-180")} />
            </button>
            {browseOpen && (
              <div className="absolute start-0 top-11 w-60 rounded-2xl border border-border bg-card p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => pickCategory("all")}
                  className="block w-full rounded-xl px-3 py-2 text-start text-sm hover:bg-secondary"
                >
                  All products
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => pickCategory(category.id)}
                    className="block w-full rounded-xl px-3 py-2 text-start text-sm hover:bg-secondary"
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {siteConfig.navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex h-9 items-center rounded-full px-3 hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {searchField("mx-auto hidden w-full max-w-[440px] lg:block")}

        <div className="ms-auto flex items-center gap-1 lg:ms-0 lg:gap-3">
          <button
            type="button"
            onClick={() => setNotice("Language and currency options aren't wired up yet.")}
            className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold lg:inline-flex"
          >
            <Globe className="size-4" />
            EN · EUR
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-full hover:bg-secondary lg:hidden"
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setNotice("Accounts aren't part of this demo.")}
            className="hidden h-9 rounded-full bg-foreground px-3.5 text-sm font-semibold text-background lg:block"
          >
            Sign in
          </button>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-full hover:bg-secondary lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="px-4 pb-3 lg:hidden">{searchField("w-full", true)}</div>
      )}

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 pt-2 pb-5 lg:hidden">
          <p className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Browse</p>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => pickCategory(category.id)}
              className="block w-full rounded-xl px-2 py-2.5 text-start text-[15px] hover:bg-secondary"
            >
              {category.label}
            </button>
          ))}
          <div className="my-2 h-px bg-border" />
          {siteConfig.navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setNotice("Accounts aren't part of this demo.")}
            className="mt-3 h-11 w-full rounded-full bg-foreground text-sm font-semibold text-background"
          >
            Sign in
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="fixed start-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg"
        >
          {notice}
        </div>
      )}
    </header>
  );
}
