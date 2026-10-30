"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Check, Loader2, RotateCcw, ShoppingBag } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import {
  cornerStyles,
  currencies,
  defaultDesign,
  fonts,
  heroCardStyles,
  homeSections,
  isHexColor,
  readableTextOn,
  type StoreSettings,
} from "@/lib/settings-shared";
import { imageAccept } from "@/lib/images";
import { cn } from "@/lib/utils";
import { HeroCardsEditor, type HeroCardProduct } from "./hero-cards-editor";
import { buttonClass, inputClass, secondaryButtonClass } from "./ui";

type SettingsFormProps = {
  values: StoreSettings;
  logoUrl: string | null;
  envBinanceRate: string | null;
  products: HeroCardProduct[];
};

const checkboxClass = "mt-0.5 size-4 shrink-0 accent-[var(--primary)]";

export function SettingsForm({ values, logoUrl, envBinanceRate, products }: SettingsFormProps) {
  const [state, action, pending] = useActionState(updateSettings, undefined);
  const [currency, setCurrency] = useState(values.currency);
  const [primaryColor, setPrimaryColor] = useState(values.primaryColor);
  const [backgroundColor, setBackgroundColor] = useState(values.backgroundColor);
  const [badgeColor, setBadgeColor] = useState(values.badgeColor);
  const [font, setFont] = useState(values.font);
  const [corners, setCorners] = useState(values.corners);
  const [heroCardStyle, setHeroCardStyle] = useState(values.heroCardStyle);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Once saved, the uploaded logo is the current one: clear the file picker so it isn't uploaded again.
  useEffect(() => {
    if (!state?.saved || !logoInputRef.current) return;
    logoInputRef.current.value = "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with the file input cleared above
    setLogoFile(null);
  }, [state]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL must be created and revoked together
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const resetDesign = () => {
    setPrimaryColor(defaultDesign.primaryColor);
    setBackgroundColor(defaultDesign.backgroundColor);
    setBadgeColor(defaultDesign.badgeColor);
    setFont(defaultDesign.font);
    setCorners(defaultDesign.corners);
    setHeroCardStyle(defaultDesign.heroCardStyle);
  };

  const previewFont = fonts.find((option) => option.id === font) ?? fonts[0];
  const previewCorners = cornerStyles.find((style) => style.id === corners) ?? cornerStyles[0];
  const shownLogo = logoFile ? logoPreview : logoUrl;
  const currencyChanged = currency !== values.currency;

  return (
    <form
      // Submitted by hand: a form `action` makes React reset every field after saving, which would show stale choices.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => action(formData));
      }}
      className="grid gap-6 xl:grid-cols-[1fr_340px]"
    >
      <div className="space-y-6">
        <Section title="Brand" description="Your store name and logo appear in the header, footer, browser tab and admin.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Store name
              <input name="storeName" required maxLength={60} defaultValue={values.storeName} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Support email
              <input name="supportEmail" type="email" maxLength={200} defaultValue={values.supportEmail} className={inputClass} />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Tagline <span className="font-normal text-muted-foreground">(shown in the browser tab on the home page)</span>
            <input name="tagline" maxLength={120} defaultValue={values.tagline} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Short description <span className="font-normal text-muted-foreground">(footer and search engines)</span>
            <textarea name="description" rows={2} maxLength={300} defaultValue={values.description} className={`${inputClass} h-auto py-2`} />
          </label>

          <div className="flex flex-wrap items-start gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background">
              {shownLogo ? (
                // eslint-disable-next-line @next/next/no-img-element -- uploaded logos and blob previews skip image optimization
                <img src={shownLogo} alt="Logo preview" className="max-h-16 w-auto max-w-16 object-contain" />
              ) : (
                <span className="px-2 text-center text-[11px] text-muted-foreground">Default logo</span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="block text-sm font-medium">
                Logo <span className="font-normal text-muted-foreground">(PNG, JPG, WebP, GIF or SVG, up to 500 KB; square works best)</span>
                <input
                  ref={logoInputRef}
                  name="logo"
                  type="file"
                  accept={imageAccept}
                  onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                  className="mt-1.5 block w-full text-sm file:me-3 file:h-9 file:cursor-pointer file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-semibold"
                />
              </label>
              {logoUrl && !logoFile && (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="removeLogo" className={checkboxClass} />
                  Remove the uploaded logo and use the default one
                </label>
              )}
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="showNameWithLogo" defaultChecked={values.showNameWithLogo} className={checkboxClass} />
                Show the store name next to the logo
              </label>
            </div>
          </div>
        </Section>

        <Section title="Currency & payments" description="Prices across the store and new orders use this currency.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Store currency
              <select
                name="currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value as StoreSettings["currency"])}
                className={inputClass}
              >
                {currencies.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} · {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Binance Pay rate <span className="font-normal text-muted-foreground">(USDT per 1 {currency})</span>
              <input
                name="binanceUsdtRate"
                inputMode="decimal"
                defaultValue={values.binanceUsdtRate}
                placeholder={envBinanceRate ? `${envBinanceRate} (from Railway variable)` : "e.g. 1.08"}
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex items-start gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm">
            <input type="checkbox" name="localCurrency" defaultChecked={values.localCurrency} className={checkboxClass} />
            <span>
              <span className="block font-medium">Show prices in the visitor&apos;s local currency</span>
              <span className="block text-xs text-muted-foreground">
                Detected from their country or browser language, with a currency picker in the header. Uses fixed exchange
                rates; orders are still charged in {currency}.
              </span>
            </span>
          </label>
          {currencyChanged && (
            <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
              Product prices are not converted. A product priced 19.99 {values.currency} will show as 19.99 {currency}, so
              update your prices in Products after saving. Past orders keep their original currency. Check that your payment
              provider accepts {currency}.
            </p>
          )}
        </Section>

        <Section title="Home page" description="Turn sections on or off, edit the headline and choose the hero cards.">
          <label className="block text-sm font-medium">
            Announcement bar <span className="font-normal text-muted-foreground">(thin banner above the header; leave empty to hide)</span>
            <input name="announcement" maxLength={200} defaultValue={values.announcement} placeholder="e.g. Spring sale: 20% off all templates" className={inputClass} />
          </label>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-medium">Sections</legend>
            {homeSections.map((section) => (
              <label key={section.id} className="flex items-start gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm">
                <input type="checkbox" name={`section-${section.id}`} defaultChecked={values.sections[section.id]} className={checkboxClass} />
                <span>
                  <span className="block font-medium">{section.label}</span>
                  <span className="block text-xs text-muted-foreground">{section.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Hero headline
              <input name="heroTitleLead" maxLength={80} defaultValue={values.heroTitleLead} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Highlighted part <span className="font-normal text-muted-foreground">(in your brand color)</span>
              <input name="heroTitleAccent" maxLength={80} defaultValue={values.heroTitleAccent} className={inputClass} />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Hero subtitle
            <input name="heroSubtitle" maxLength={200} defaultValue={values.heroSubtitle} className={inputClass} />
          </label>
          <HeroCardsEditor initialCards={values.heroCards} products={products} currency={values.currency} storeName={values.storeName} />
        </Section>

        <Section title="Design" description="Colors, font and corner style for the whole store.">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Brand color" name="primaryColor" value={primaryColor} onChange={setPrimaryColor} />
            <ColorField label="Page background" name="backgroundColor" value={backgroundColor} onChange={setBackgroundColor} />
            <ColorField label="Cart badge" name="badgeColor" value={badgeColor} onChange={setBadgeColor} />
            <label className="block text-sm font-medium">
              Font
              <select name="font" value={font} onChange={(event) => setFont(event.target.value as StoreSettings["font"])} className={inputClass}>
                {fonts.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Corners
              <select
                name="corners"
                value={corners}
                onChange={(event) => setCorners(event.target.value as StoreSettings["corners"])}
                className={inputClass}
              >
                {cornerStyles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Hero cards
              <select
                name="heroCardStyle"
                value={heroCardStyle}
                onChange={(event) => setHeroCardStyle(event.target.value as StoreSettings["heroCardStyle"])}
                className={inputClass}
              >
                {heroCardStyles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" onClick={resetDesign} className={secondaryButtonClass}>
            <RotateCcw className="size-4" />
            Reset design to default
          </button>
        </Section>
      </div>

      <div className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Preview</p>
          <div
            className="mt-3 space-y-3 p-4"
            style={{ background: backgroundColor, fontFamily: `var(${previewFont.cssVar})`, borderRadius: previewCorners.cardRadius }}
          >
            <p className="text-lg leading-tight font-semibold tracking-[-0.03em] text-[#0b0b0c]">
              Tools for makers, <span style={{ color: primaryColor }}>delivered.</span>
            </p>
            <div className="bg-white p-3 shadow-sm" style={{ borderRadius: previewCorners.cardRadius }}>
              <p className="text-sm font-semibold text-[#0b0b0c]">Product card</p>
              <p className="text-xs text-[#5f5c5b]">Corners, font and colors</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold"
                style={{ background: primaryColor, color: readableTextOn(primaryColor) }}
              >
                Add to cart
              </span>
              <span className="relative grid size-9 place-items-center text-[#0b0b0c]" aria-label="Cart badge preview">
                <ShoppingBag className="size-5" />
                <span
                  className="absolute -end-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] leading-[18px] font-bold ring-2 ring-white"
                  style={{ background: badgeColor, color: readableTextOn(isHexColor(badgeColor) ? badgeColor : "#000000") }}
                >
                  3
                </span>
              </span>
            </div>
          </div>
        </div>
        {state?.error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state?.saved && !pending && (
          <p role="status" className="flex items-center gap-1.5 rounded-xl bg-signal-emerald/10 px-3 py-2 text-sm text-signal-emerald">
            <Check className="size-4" />
            Settings saved. Changes are live in the store.
          </p>
        )}
        <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save settings
        </button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ColorField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="text-sm font-medium">
      {label}
      <div className="mt-1.5 flex gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={isHexColor(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="block h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1"
        />
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} hex code`}
          pattern="#[0-9a-fA-F]{6}"
          maxLength={7}
          className={cn(inputClass, "mt-0 font-mono")}
        />
      </div>
    </div>
  );
}
