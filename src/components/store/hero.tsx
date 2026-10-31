"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { HeroCardStyle } from "@/lib/settings-shared";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import { useCart, type CartItem } from "./cart-provider";
import { HeroIntro, type HeroIntroContent } from "./hero-intro";

export type HeroSlide = {
  key: string;
  label: string;
  title: string;
  detail: string;
  // Large detail text for prices; smaller for sentences.
  largeDetail: boolean;
  href: string;
  // Set when clicking the card should add this product to the cart and open the cart.
  cartItem?: Omit<CartItem, "quantity">;
};

export type HeroContent = {
  storeName: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  cardStyle: HeroCardStyle;
};

const gradients = [
  "linear-gradient(135deg, #2a4a9a 0%, #1a2c63 55%, #13204a 100%)",
  "linear-gradient(135deg, #8a3a64 0%, #5e1f45 60%, #3f1430 100%)",
  "linear-gradient(135deg, #e7a48e 0%, #c97a63 60%, #a85c48 100%)",
  "linear-gradient(135deg, #a07a8e 0%, #7a5468 60%, #5a3a4c 100%)",
  "linear-gradient(135deg, #4b3fb0 0%, #33278a 60%, #211a5e 100%)",
];

// "Brand color" cards: shades of the brand color, a little darker for each card.
const brandGradient = (index: number) =>
  `linear-gradient(135deg, color-mix(in oklab, var(--primary), white ${15 - (index % 4) * 5}%) 0%, color-mix(in oklab, var(--primary), black ${35 + (index % 4) * 8}%) 100%)`;

// Back cards fan up and to the right of the active card.
const stackTransforms = [
  "translate(0, 0) rotate(-4deg)",
  "translate(4%, -7%) rotate(-7deg)",
  "translate(8%, -13%) rotate(-10deg)",
];

const INTRO_SEEN_KEY = "dn_intro_seen";

export function Hero({ slides, content, intro }: { slides: HeroSlide[]; content: HeroContent; intro: HeroIntroContent | null }) {
  const router = useRouter();
  const { add } = useCart();
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  // The intro covers the hero on first render; it is dropped right away for repeat visits in the same
  // session and for visitors who prefer reduced motion.
  const [showIntro, setShowIntro] = useState(Boolean(intro));
  const [introRun, setIntroRun] = useState(0);

  useEffect(() => {
    if (!intro) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only preferences after hydration
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShowIntro(false);
  }, [intro]);

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {}
    setShowIntro(false);
    setIntroKey((key) => key + 1);
    setActive(0);
  }, []);

  const go = useCallback(
    (delta: number) => setActive((current) => (current + delta + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => go(1), 4000);
    return () => window.clearInterval(timer);
  }, [go, paused, slides.length]);

  return (
    <section className="relative overflow-x-clip bg-background">
      {intro && showIntro && <HeroIntro key={introRun} content={intro} onDone={finishIntro} />}
      <div className="mx-auto grid min-h-[calc(100svh-64px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:px-8 lg:py-0">
        <div key={introKey} className="order-2 text-center lg:order-1 lg:text-start">
          <h1 className="animate-in fade-in slide-in-from-bottom-3 text-[34px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-foreground duration-700 sm:text-4xl lg:text-6xl">
            {content.titleLead} <span className="text-primary">{content.titleAccent}</span>
          </h1>
          <p className="animate-in fade-in fill-mode-both mx-auto mt-5 max-w-[46ch] text-base leading-relaxed text-pretty text-muted-foreground delay-200 duration-700 sm:mx-0 sm:text-lg">
            {content.subtitle}
          </p>
          <div className="animate-in fade-in fill-mode-both mt-8 flex flex-col items-center gap-3 delay-300 duration-700 sm:flex-row sm:justify-center lg:justify-start lg:gap-5">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t("hero.browse")}
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </Link>
            <button
              type="button"
              onClick={() => {
                if (intro) {
                  window.scrollTo({ top: 0 });
                  setIntroRun((run) => run + 1);
                  setShowIntro(true);
                } else {
                  setIntroKey((key) => key + 1);
                  setActive(0);
                }
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-4" />
              {t("hero.replay")}
            </button>
          </div>
        </div>

        <div
          className="order-1 flex w-full flex-col items-center lg:order-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative aspect-[1.58] w-[86%] max-w-[300px] sm:w-full sm:max-w-[420px] lg:max-w-[520px]">
            {slides.map((slide, index) => {
              const depth = (index - active + slides.length) % slides.length;
              const visible = depth < stackTransforms.length;
              return (
                <Link
                  key={slide.key}
                  href={slide.href}
                  tabIndex={depth === 0 ? 0 : -1}
                  aria-hidden={depth !== 0}
                  aria-label={slide.cartItem ? t("product.addNamed", { name: slide.cartItem.name }) : undefined}
                  onClick={(event) => {
                    if (!slide.cartItem) return;
                    event.preventDefault();
                    add(slide.cartItem);
                    router.push("/cart");
                  }}
                  className="absolute inset-0 flex flex-col justify-between rounded-[calc(var(--store-radius)*0.8)] p-[6%] text-white shadow-[0_30px_60px_-20px_rgba(20,20,60,0.45)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    background: content.cardStyle === "brand" ? brandGradient(index) : gradients[index % gradients.length],
                    transform: visible ? stackTransforms[depth] : "translate(14%, -20%) rotate(-14deg)",
                    opacity: visible ? (depth === 0 ? 1 : 0.85 - depth * 0.15) : 0,
                    zIndex: slides.length - depth,
                    pointerEvents: depth === 0 ? "auto" : "none",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[calc(var(--store-radius)*0.8)] bg-[linear-gradient(115deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_40%)]" />
                  <span className="relative text-[11px] font-medium tracking-[0.25em] opacity-90 sm:text-sm">
                    {slide.label || content.storeName.toUpperCase()}
                  </span>
                  <div className="relative">
                    <div className="mb-4 h-[22%] min-h-8 w-[14%] min-w-10 rounded-md bg-[linear-gradient(135deg,#d9d9d9,#9a9a9a)] p-[3px] shadow-inner sm:mb-6">
                      <div className="grid h-full w-full grid-cols-3 gap-[2px] rounded-sm bg-[linear-gradient(135deg,#cfcfcf,#a5a5a5)] p-[3px]">
                        {Array.from({ length: 6 }, (_, cell) => (
                          <span key={cell} className="rounded-[1px] border border-black/15" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-snug font-semibold sm:text-xl">{slide.title}</p>
                    <p className={cn("mt-1 sm:mt-2", slide.largeDetail ? "text-xl font-semibold sm:text-3xl" : "text-sm sm:text-lg")}>
                      {slide.detail}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {slides.length > 1 && (
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                aria-label={t("hero.previous")}
                onClick={() => go(-1)}
                className="grid size-8 place-items-center rounded-full bg-card text-foreground shadow-sm hover:bg-secondary"
              >
                <ChevronLeft className="size-4 rtl:-scale-x-100" />
              </button>
              <div className="flex items-center gap-1.5">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    type="button"
                    aria-label={t("hero.showCard", { number: index + 1 })}
                    aria-current={index === active}
                    onClick={() => setActive(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === active ? "w-6 bg-primary" : "w-1.5 bg-foreground/15 hover:bg-foreground/30",
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={t("hero.next")}
                onClick={() => go(1)}
                className="grid size-8 place-items-center rounded-full bg-card text-foreground shadow-sm hover:bg-secondary"
              >
                <ChevronRight className="size-4 rtl:-scale-x-100" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
