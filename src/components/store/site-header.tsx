"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, LayoutDashboard, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useI18n } from "@/components/i18n-provider";
import { CURRENCY_COOKIE } from "@/lib/currency";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { useCart } from "./cart-provider";

export type StoreBrand = { name: string; logoUrl: string | null; showName: boolean };

type SiteHeaderProps = {
  brand: StoreBrand;
  // Currencies visitors can switch prices to; null when local prices are turned off.
  currencyOptions: string[] | null;
  languageOptions: { code: string; label: string }[];
  categories: { slug: string; name: string }[];
  user: { name: string; role: string } | null;
};

export function SiteHeader({ brand, currencyOptions, languageOptions, categories, user }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count, ready, pricing } = useCart();
  const { locale, t } = useI18n();
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
        {t("nav.searchProducts")}
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
        placeholder={t("nav.searchPlaceholder")}
        className="h-9 w-full rounded-full border border-border bg-card ps-9 pe-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
      {!autoFocus && (
        <kbd className="pointer-events-none absolute end-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded border border-border text-[10px] text-muted-foreground">
          /
        </kbd>
      )}
    </form>
  );

  const chooseCurrency = (code: string) => {
    document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  const chooseLanguage = (code: string) => {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  const languagePicker = (className: string) => (
    <label className={cn("relative", className)}>
      <span className="sr-only">{t("nav.language")}</span>
      <Globe className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <select
        value={locale}
        onChange={(event) => chooseLanguage(event.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-border bg-card ps-7 pe-7 text-xs font-semibold text-foreground hover:bg-secondary focus:border-primary focus:outline-none"
      >
        {languageOptions.map((option) => (
          // Short codes keep the header compact; the native name shows on hover.
          <option key={option.code} value={option.code} title={option.label}>
            {option.code.toUpperCase()}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </label>
  );

  const currencyPicker = (className: string) =>
    currencyOptions && (
      <label className={cn("relative", className)}>
        <span className="sr-only">{t("nav.currency")}</span>
        <select
          value={pricing.display}
          onChange={(event) => chooseCurrency(event.target.value)}
          className="h-9 cursor-pointer appearance-none rounded-full border border-border bg-card ps-3 pe-7 text-xs font-semibold text-foreground hover:bg-secondary focus:border-primary focus:outline-none"
        >
          {currencyOptions.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </label>
    );

  const cartLink = (
    <Link
      href="/cart"
      aria-label={t("nav.cartAria", { count })}
      className="relative grid size-10 place-items-center rounded-full hover:bg-secondary"
    >
      <ShoppingBag className="size-5" />
      {ready && count > 0 && (
        <span
          key={count}
          className="badge-pop absolute end-0 top-0 grid min-w-[19px] place-items-center rounded-full bg-badge px-1 text-[10px] leading-[19px] font-bold text-badge-foreground shadow-[0_2px_6px_-1px_var(--badge)] ring-2 ring-background"
        >
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:gap-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight">
          <BrandMark logoUrl={brand.logoUrl} className="h-8" />
          <span className={brand.showName ? "text-[17px]" : "sr-only"}>{brand.name}</span>
        </Link>

        <nav className="ms-4 hidden items-center gap-1 text-sm text-foreground/80 lg:flex">
          <div ref={browseRef} className="relative">
            <button
              type="button"
              aria-expanded={browseOpen}
              onClick={() => setBrowseOpen((open) => !open)}
              className="inline-flex h-9 shrink-0 items-center whitespace-nowrap gap-1 rounded-full px-3 hover:bg-secondary hover:text-foreground"
            >
              {t("nav.browse")}
              <ChevronDown className={cn("size-4 transition-transform", browseOpen && "rotate-180")} />
            </button>
            {browseOpen && (
              <div className="absolute start-0 top-11 w-60 rounded-2xl border border-border bg-card p-2 shadow-lg">
                <Link href="/products" className="block rounded-xl px-3 py-2 text-sm hover:bg-secondary">
                  {t("nav.allProducts")}
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
          <Link href="/products" className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-3 hover:bg-secondary hover:text-foreground">
            {t("nav.allProducts")}
          </Link>
          <Link href="/guarantee" className="hidden h-9 shrink-0 items-center whitespace-nowrap rounded-full px-3 hover:bg-secondary hover:text-foreground xl:inline-flex">
            {t("nav.guarantee")}
          </Link>
        </nav>

        {searchForm("mx-auto hidden w-full min-w-0 max-w-[400px] lg:block")}

        <div className="ms-auto flex items-center gap-1 lg:ms-0 lg:gap-2">
          <button
            type="button"
            aria-label={t("nav.search")}
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-full hover:bg-secondary lg:hidden"
          >
            <Search className="size-5" />
          </button>
          {languagePicker("hidden md:block")}
          {currencyPicker("hidden sm:block")}
          {cartLink}
          {user ? (
            <div className="hidden items-center gap-1 lg:flex">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex h-9 shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full border border-border px-3 text-xs font-semibold hover:bg-secondary"
                >
                  <LayoutDashboard className="size-4" />
                  {t("nav.admin")}
                </Link>
              )}
              <Link
                href="/account"
                className="inline-flex h-9 shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full bg-foreground px-3.5 text-sm font-semibold text-background"
              >
                <User className="size-4" />
                {user.name.split(" ")[0]}
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-foreground px-3.5 text-sm font-semibold text-background lg:inline-flex"
            >
              {t("nav.signIn")}
            </Link>
          )}
          <button
            type="button"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
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
          <p className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">{t("nav.browse")}</p>
          <Link href="/products" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
            {t("nav.allProducts")}
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
          <div className="flex items-center justify-between px-2 py-1.5 text-[15px] md:hidden">
            {t("nav.language")}
            {languagePicker("")}
          </div>
          {currencyOptions && (
            <div className="flex items-center justify-between px-2 py-1.5 text-[15px] sm:hidden">
              {t("nav.currency")}
              {currencyPicker("")}
            </div>
          )}
          <Link href="/guarantee" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
            {t("nav.guarantee")}
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
              {t("nav.adminDashboard")}
            </Link>
          )}
          {user ? (
            <>
              <Link href="/account" className="block rounded-xl px-2 py-2.5 text-[15px] hover:bg-secondary">
                {t("nav.myAccount")}
              </Link>
              <form action={logout}>
                <button type="submit" className="mt-3 h-11 w-full rounded-full border border-border text-sm font-semibold">
                  {t("nav.signOut")}
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
