"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  cornerStyleIds,
  currencyCodes,
  fontIds,
  heroCardActions,
  homeSections,
  isHexColor,
  MAX_HERO_CARDS,
  luminance,
  saveLogo,
  saveSettings,
  type StoreSettings,
} from "@/lib/settings";
import { checkImageUpload, readImageUpload } from "@/lib/images";
import type { AdminFormState } from "./admin";


const hexColor = (label: string) => z.string().refine(isHexColor, `Pick a valid ${label}.`);

const heroCardsSchema = z
  .array(
    z.object({
      productId: z.number().int().positive().nullable(),
      label: z.string().trim().max(40),
      title: z.string().trim().max(80),
      detail: z.string().trim().max(60),
      action: z.enum(heroCardActions.map((action) => action.id) as ["cart", "product"]),
    }),
  )
  .max(MAX_HERO_CARDS, `Use up to ${MAX_HERO_CARDS} hero cards.`);

const settingsSchema = z.object({
  storeName: z.string().trim().min(1, "Enter a store name.").max(60),
  tagline: z.string().trim().max(120),
  description: z.string().trim().max(300),
  supportEmail: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid support email."),
  currency: z.enum(currencyCodes),
  binanceUsdtRate: z
    .string()
    .trim()
    .refine((value) => value === "" || Number(value.replace(",", ".")) > 0, "Enter a Binance rate like 1.08, or leave it empty."),
  announcement: z.string().trim().max(200),
  heroTitleLead: z.string().trim().max(80),
  heroTitleAccent: z.string().trim().max(80),
  heroSubtitle: z.string().trim().max(200),
  heroCardStyle: z.enum(["colorful", "brand"]),
  primaryColor: hexColor("brand color"),
  badgeColor: hexColor("cart badge color"),
  backgroundColor: hexColor("background color").refine(
    (value) => luminance(value) >= 0.6,
    "Pick a lighter background color so text stays readable.",
  ),
  font: z.enum(fontIds),
  corners: z.enum(cornerStyleIds),
});

export async function updateSettings(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const logoError = checkImageUpload(formData.get("logo"), "logo");
  if (logoError) return { error: logoError };

  let rawHeroCards: unknown;
  try {
    rawHeroCards = JSON.parse(String(formData.get("heroCards") ?? "[]"));
  } catch {
    return { error: "The hero cards couldn't be read. Reload the page and try again." };
  }
  const heroCards = heroCardsSchema.safeParse(rawHeroCards);
  if (!heroCards.success) return { error: heroCards.error.issues[0].message };

  const settings: StoreSettings = {
    ...parsed.data,
    heroCards: heroCards.data,
    binanceUsdtRate: parsed.data.binanceUsdtRate.replace(",", "."),
    primaryColor: parsed.data.primaryColor.toLowerCase(),
    backgroundColor: parsed.data.backgroundColor.toLowerCase(),
    badgeColor: parsed.data.badgeColor.toLowerCase(),
    localCurrency: formData.get("localCurrency") === "on",
    showNameWithLogo: formData.get("showNameWithLogo") === "on",
    sections: Object.fromEntries(
      homeSections.map((section) => [section.id, formData.get(`section-${section.id}`) === "on"]),
    ) as StoreSettings["sections"],
  };
  await saveSettings(settings);

  const logo = await readImageUpload(formData.get("logo"));
  if (logo) {
    await saveLogo(logo);
  } else if (formData.get("removeLogo") === "on") {
    await saveLogo(null);
  }

  revalidatePath("/", "layout");
  return { saved: true };
}
