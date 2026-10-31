"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Camera,
  Check,
  Cloud,
  Code2,
  Copy,
  KeyRound,
  Layers,
  Music,
  Palette,
  Pause,
  PenTool,
  Play,
  SkipForward,
  Sparkles,
  Terminal,
  Video,
  Zap,
} from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";

export type HeroIntroContent = {
  storeName: string;
  logoUrl: string | null;
  tagline: string;
  titleLead: string;
  titleAccent: string;
  productName: string;
  productPrice: string;
  // Product images shown on the floating tiles; tiles without one show an icon.
  tileImages: string[];
};

// Scene timings in milliseconds of timeline time; the timeline plays SPEED times faster than real time.
const SCENES = { typing: 0, checkout: 3400, delivery: 7800, brand: 11400, end: 13600 };
const SPEED = 1.6;
const FADE_MS = 400;
// CSS transitions are written in real time, so shorten them to keep pace with the timeline.
const realMs = (ms: number) => `${Math.round(ms / SPEED)}ms`;
// The checkout and delivery scenes are drawn on a fixed 720×360 stage, scaled to fit the screen.
const STAGE_W = 720;
const STAGE_H = 360;

const tiles = [
  { icon: Sparkles, color: "#f59f00", x: 8, y: 14 },
  { icon: Code2, color: "#1c7ed6", x: 24, y: 6 },
  { icon: Palette, color: "#e8590c", x: 44, y: 9 },
  { icon: Bot, color: "#0ca678", x: 62, y: 5 },
  { icon: Zap, color: "#7048e8", x: 80, y: 12 },
  { icon: Music, color: "#d6336c", x: 91, y: 30 },
  { icon: Terminal, color: "#495057", x: 6, y: 76 },
  { icon: Layers, color: "#1098ad", x: 22, y: 86 },
  { icon: Video, color: "#f03e3e", x: 40, y: 80 },
  { icon: PenTool, color: "#5c7cfa", x: 60, y: 88 },
  { icon: Camera, color: "#2b8a3e", x: 76, y: 80 },
  { icon: Cloud, color: "#339af0", x: 92, y: 74 },
];

const LICENSE_KEY = "DGN-7Q4K-9KHZ-TV8R-X3LP";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const progress = (time: number, start: number, length: number) => clamp01((time - start) / length);

// A short animated walkthrough shown over the hero: headline, checkout, delivery, brand.
export function HeroIntro({ content, onDone }: { content: HeroIntroContent; onDone: () => void }) {
  const { t } = useI18n();
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [scale, setScale] = useState(1);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  // Advance the timeline while playing.
  useEffect(() => {
    if (!playing || leaving) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      setTime((current) => current + (now - last) * SPEED);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, leaving]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the timeline reached its end
    if (time >= SCENES.end && !leaving) setLeaving(true);
  }, [time, leaving]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => doneRef.current(), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  // The stage only exists during the checkout and delivery scenes, so measure it whenever it mounts.
  const measureStage = useCallback((box: HTMLDivElement | null) => {
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / STAGE_W)));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const scene = time < SCENES.checkout ? "typing" : time < SCENES.delivery ? "checkout" : time < SCENES.brand ? "delivery" : "brand";
  const sceneStart = SCENES[scene];
  const sceneEnd = { typing: SCENES.checkout, checkout: SCENES.delivery, delivery: SCENES.brand, brand: SCENES.end }[scene];
  // Each scene fades in over 300ms and out over its last 300ms.
  const sceneOpacity = Math.min(progress(time, sceneStart, 300), 1 - progress(time, sceneEnd - 300, 300));

  const typed = content.titleAccent.slice(0, Math.round(progress(time, 500, 1500) * content.titleAccent.length));

  // Checkout scene: cursor clicks Buy, the checkout panel slides in, cursor clicks Pay.
  const c = time - SCENES.checkout;
  // Targets are button centres on the stage, minus the pointer tip's offset (4, 2).
  const checkoutOpen = c > 1700;
  const emailTicked = c > 2300;
  const paid = c > 3500;
  const checkoutCursor = c < 700 ? { x: 560, y: 340 } : c < 1700 ? { x: 228, y: 210 } : c < 2600 ? { x: 364, y: 161 } : { x: 516, y: 246 };
  const checkoutClick = (c > 1400 && c < 1700) || (c > 3300 && c < 3600);

  // Delivery scene: the key appears, cursor clicks Copy.
  const d = time - SCENES.delivery;
  const keyShown = LICENSE_KEY.slice(0, Math.round(progress(d, 600, 1200) * LICENSE_KEY.length));
  const copied = d > 2700;
  const deliveryCursor = d < 1500 ? { x: 600, y: 350 } : { x: 585, y: 221 };
  const deliveryClick = d > 2500 && d < 2800;

  const cursor = scene === "checkout" ? checkoutCursor : deliveryCursor;
  const clicking = scene === "checkout" ? checkoutClick : deliveryClick;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-background px-4 transition-opacity duration-[400ms]",
        leaving && "pointer-events-none opacity-0",
      )}
    >
      <div className="w-full max-w-5xl" style={{ opacity: sceneOpacity }}>
        {scene === "typing" && (
          <div className="relative mx-auto h-[min(70svh,520px)]">
            {tiles.map(({ icon: Icon, color, x, y }, index) => {
              const image = content.tileImages[index];
              return (
                <span
                  key={index}
                  className="intro-float absolute grid size-11 place-items-center overflow-hidden rounded-xl bg-card shadow-[0_6px_16px_-6px_rgba(0,0,0,0.18)] sm:size-12"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    animationDelay: `${(index % 6) * -0.6}s`,
                    opacity: progress(time, index * 90, 400),
                  }}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small product images from our own media route
                    <img src={image} alt="" className="size-full object-contain p-1.5" />
                  ) : (
                    <Icon className="size-5" style={{ color }} />
                  )}
                </span>
              );
            })}
            <h2 className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-foreground">
              {content.titleLead}
              <br />
              <span className="text-primary">{typed}</span>
              <span className="intro-caret ms-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] bg-primary align-baseline" />
            </h2>
          </div>
        )}

        {(scene === "checkout" || scene === "delivery") && (
          <div ref={measureStage} className="mx-auto w-full max-w-[720px]">
            <div className="relative mx-auto" style={{ width: STAGE_W * scale, height: STAGE_H * scale }}>
              <div className="absolute start-0 top-0 origin-top-left rtl:origin-top-right" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}>
                {scene === "checkout" ? (
                  <>
                    <div className="absolute top-[70px] left-[20px] w-[290px] rounded-2xl bg-card p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)]">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{t("intro.bestSeller")}</span>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold">{content.productName}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{content.productPrice}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <span className="grid h-9 place-items-center rounded-full border border-border bg-secondary font-medium">{t("product.details")}</span>
                        <span className={cn("grid h-9 place-items-center rounded-full bg-primary font-semibold text-primary-foreground", c > 1400 && c < 1700 && "scale-95")}>
                          {t("intro.buy")}
                        </span>
                      </div>
                    </div>
                    <div
                      className="absolute top-[30px] left-[340px] w-[360px] rounded-2xl bg-card p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] transition-all"
                      style={{ transitionDuration: realMs(500), opacity: checkoutOpen ? 1 : 0, transform: `translateY(${checkoutOpen ? 0 : 16}px)` }}
                    >
                      <p className="font-semibold">{t("checkout.title")}</p>
                      <p className="mt-3 text-[11px] font-medium text-muted-foreground">{t("intro.email")}</p>
                      <div className="mt-1 h-9 rounded-lg border border-border bg-background px-3 text-sm leading-9 text-muted-foreground">you@example.com</div>
                      <p className="mt-3 flex items-center gap-2 text-xs">
                        <span className={cn("grid size-4 place-items-center rounded border", emailTicked ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                          {emailTicked && <Check className="size-3" />}
                        </span>
                        {t("intro.sendCopy")}
                      </p>
                      <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                        <span>{t("checkout.total")}</span>
                        <span className="tabular-nums">{content.productPrice}</span>
                      </div>
                      <div
                        className={cn(
                          "mt-3 flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                          paid ? "bg-signal-emerald text-white" : "bg-primary text-primary-foreground",
                          c > 3300 && c < 3600 && "scale-95",
                        )}
                      >
                        {paid ? (
                          <>
                            <Check className="size-4" /> {t("intro.paid")}
                          </>
                        ) : (
                          t("intro.payCrypto")
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-3 opacity-80">
                        {["bitcoin", "ethereum", "usdt", "binance-pay"].map((coin) => (
                          // eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs
                          <img key={coin} src={`/payments/${coin}.svg`} alt="" className="size-4" />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute top-[60px] left-[60px] w-[600px] space-y-3">
                    <div className="rounded-2xl bg-card p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)]">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="flex items-center gap-1 rounded-full bg-signal-emerald/10 px-2 py-0.5 font-semibold text-signal-emerald">
                          <Check className="size-3" /> {t("status.delivered")}
                        </span>
                        <span className="text-muted-foreground">#A7F3Q2</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{content.productName}</p>
                    </div>
                    <div className="rounded-2xl bg-card p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)]">
                      <p className="flex items-center gap-2 text-xs font-semibold">
                        <KeyRound className="size-4 text-primary" /> {t("intro.license")}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2.5">
                        <span className="font-mono text-sm tracking-wide" dir="ltr">
                          {keyShown}
                          {keyShown.length < LICENSE_KEY.length && <span className="intro-caret ms-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-foreground" />}
                        </span>
                        <span
                          className={cn(
                            "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                            copied ? "border-signal-emerald/40 text-signal-emerald" : "border-border bg-card",
                            deliveryClick && "scale-95",
                          )}
                        >
                          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          {copied ? t("intro.copied") : t("intro.copy")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pointer, kept left-to-right so the stage coordinates stay valid. */}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="absolute size-6 drop-shadow transition-all ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transitionDuration: realMs(700), left: cursor.x, top: cursor.y, transform: `scale(${clicking ? 0.85 : 1})` }}
                >
                  <path d="M4 2l15 9.5-6.6 1.3L9 19.6z" fill="#0b0b0c" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="mt-6 text-center text-base font-semibold text-foreground sm:text-lg">
              {scene === "checkout" ? t("intro.payCaption") : t("intro.deliveryCaption")}
            </p>
          </div>
        )}

        {scene === "brand" && (
          <div className="flex flex-col items-center text-center" style={{ transform: `scale(${0.94 + 0.06 * progress(time, SCENES.brand, 500)})` }}>
            <div className="flex items-center gap-3">
              <BrandMark logoUrl={content.logoUrl} className="h-14" />
              <span className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{content.storeName}</span>
            </div>
            {content.tagline && <p className="mt-4 max-w-md text-muted-foreground">{content.tagline}</p>}
          </div>
        )}
      </div>

      <div className="absolute start-4 bottom-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLeaving(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold shadow-sm hover:bg-secondary"
        >
          <SkipForward className="size-3.5 rtl:-scale-x-100" />
          {t("intro.skip")}
        </button>
        <button
          type="button"
          aria-label={playing ? t("intro.pause") : t("intro.play")}
          onClick={() => setPlaying((value) => !value)}
          className="grid size-9 place-items-center rounded-full border border-border bg-card shadow-sm hover:bg-secondary"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
