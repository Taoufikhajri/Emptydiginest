"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { useCart } from "./cart-provider";

type SiteHeaderProps = {
  categories: { slug: string; name: string }[];
  user: { name: string; role: string } | null;
};

export function SiteHeader({ categories, user }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count, ready } = useCart();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);

  // Close menus whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setBrowseOpen(false);
    setMobileSearchOpen(false);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setBrowseOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) setBrowseOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
  };

  const searchForm = (className: string, autoFocus = false) => (
    <form role="search" onSubmit={submitSearch} className={cn("relative block", className)}>
      <label className="sr-only" htmlFor={autoFocus ? "mobile-search" : "header-search"}>
        Search products
      </label>
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={autoFocus ? "mobile-search" : "header-search"}
        ref={autoFocus ? undefined : searchRef}
        autoFocus={autoFocus}
        name="q"
        type="search"
        key={searchParams.get("q") ?? ""}
        defaultValue={pathname === "/products" ? (searchParams.get("q") ?? "") : ""}
        placeholder="Search Brushwork, Framecut, Inkpad..."
        className="h-9 w-full rounded-full border border-border bg-card ps-9 pe-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
      {!autoFocus && (
        <kbd className="pointer-events-none absolute end-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded border border-border text-[10px] text-muted-foreground">
          /
        </kbd>
      )}
    </form>
  );

  const cartLink = (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative grid size-10 place-items-center rounded-full hover:bg-secondary"
    >
      <ShoppingBag className="size-5" />
      {ready && count > 0 && (
        <span className="absolute end-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] leading-[18px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:gap-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight">
          <BrandMark className="size-8" />
          <span className="text-[17px]">{siteConfig.name}</span>
        </Link>

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
                <Link href="/products" className="block rounded-xl px-3 py-2 text-sm hover:bg-secondary">
                  All products
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="block rounded-xl px-3 py-2 text-sm hover:bg-secondary"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/products" className="inline-flex h-9 items-center rounded-full px-3 hover:bg-secondary hover:text-foreground">
            All products
          </Link>
          <Link href="/guarantee" className="inline-flex h-9 items-center rounded-full px-3 hover:bg-secondary hover:text-foreground">
            Guarantee
          </Link>
        </nav>

        {searchForm("mx-auto hidden w-full max-w-[400px] lg:block")}

        <div className="ms-auto flex items-center gap-1 lg:ms-0 lg:gap-2">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-full hover:bg-secondary lg:hidden"
          >
            <Search className="size-5" />
          </button>
          {cartLink}
          {user ? (
            <div className="hidden items-center gap-1 lg:flex">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold hover:bg-secondary"
                >
                  <LayoutDashboard className="size-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-sm font-semibold text-background"
              >
                <User className="size-4" />
                {user.name.split(" ")[0]}
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-full bg-foreground px-3.5 text-sm font-semibold text-background lg:inline-flex"
            >
              Sign in
            </Link>
          )}
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

      {mobileSearchOpen && <div className="px-4 pb-3 lg:hidden">{searchForm("w-full", true)}</div>}

      {menuOpen && (
        <div className="max-h-[calc(100svh-64px)] overflow-y-auto border-t border-border bg-background px-4 pt-2 pb-5 lg:hidden">
          <p className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Browse</p>
          <Link href="/products" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
            All products
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary"
            >
              {category.name}
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          <Link href="/guarantee" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
            Guarantee
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
              Admin dashboard
            </Link>
          )}
          {user ? (
            <>
              <Link href="/account" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
                My account
              </Link>
              <form action={logout}>
                <button type="submit" className="mt-3 h-11 w-full rounded-full border border-border text-sm font-semibold">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
