"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export type HeroSlide = { key: string; title: string; detail: string; href: string };

const gradients = [
  "linear-gradient(135deg, #2a4a9a 0%, #1a2c63 55%, #13204a 100%)",
  "linear-gradient(135deg, #8a3a64 0%, #5e1f45 60%, #3f1430 100%)",
  "linear-gradient(135deg, #e7a48e 0%, #c97a63 60%, #a85c48 100%)",
  "linear-gradient(135deg, #a07a8e 0%, #7a5468 60%, #5a3a4c 100%)",
  "linear-gradient(135deg, #4b3fb0 0%, #33278a 60%, #211a5e 100%)",
];

// Back cards fan up and to the right of the active card.
const stackTransforms = [
  "translate(0, 0) rotate(-4deg)",
  "translate(4%, -7%) rotate(-7deg)",
  "translate(8%, -13%) rotate(-10deg)",
];

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [introKey, setIntroKey] = useState(0);

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
    <section className="overflow-x-clip bg-background">
      <div className="mx-auto grid min-h-[calc(100svh-64px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:px-8 lg:py-0">
        <div key={introKey} className="order-2 text-center lg:order-1 lg:text-start">
          <h1 className="animate-in fade-in slide-in-from-bottom-3 text-[34px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-foreground duration-700 sm:text-4xl lg:text-6xl">
            {siteConfig.hero.titleLead} <span className="text-primary">{siteConfig.hero.titleAccent}</span>
          </h1>
          <p className="animate-in fade-in fill-mode-both mx-auto mt-5 max-w-[46ch] text-base leading-relaxed text-pretty text-muted-foreground delay-200 duration-700 sm:mx-0 sm:text-lg">
            {siteConfig.hero.subtitle}
          </p>
          <div className="animate-in fade-in fill-mode-both mt-8 flex flex-col items-center gap-3 delay-300 duration-700 sm:flex-row sm:justify-center lg:justify-start lg:gap-5">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Browse the catalog
              <ArrowRight className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setIntroKey((key) => key + 1);
                setActive(0);
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-4" />
              Watch the intro again
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
                  className="absolute inset-0 flex flex-col justify-between rounded-[22px] p-[6%] text-white shadow-[0_30px_60px_-20px_rgba(20,20,60,0.45)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    background: gradients[index % gradients.length],
                    transform: visible ? stackTransforms[depth] : "translate(14%, -20%) rotate(-14deg)",
                    opacity: visible ? (depth === 0 ? 1 : 0.85 - depth * 0.15) : 0,
                    zIndex: slides.length - depth,
                    pointerEvents: depth === 0 ? "auto" : "none",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(115deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_40%)]" />
                  <span className="relative text-[11px] font-medium tracking-[0.25em] opacity-90 sm:text-sm">
                    {siteConfig.shortName}
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
                    <p className={cn("mt-1 sm:mt-2", index === 0 ? "text-sm sm:text-lg" : "text-xl font-semibold sm:text-3xl")}>
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
                aria-label="Previous card"
                onClick={() => go(-1)}
                className="grid size-8 place-items-center rounded-full bg-card text-foreground shadow-sm hover:bg-secondary"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    type="button"
                    aria-label={`Show card ${index + 1}`}
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
                aria-label="Next card"
                onClick={() => go(1)}
                className="grid size-8 place-items-center rounded-full bg-card text-foreground shadow-sm hover:bg-secondary"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
