"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  cornerStyleIds,
  currencyCodes,
  fontIds,
  homeSections,
  isHexColor,
  luminance,
  saveLogo,
  saveSettings,
  type StoreSettings,
} from "@/lib/settings";
import type { AdminFormState } from "./admin";

const MAX_LOGO_BYTES = 500 * 1024;
const logoTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

const hexColor = (label: string) => z.string().refine(isHexColor, `Pick a valid ${label}.`);

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

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (!logoTypes.includes(logo.type)) return { error: "Upload the logo as PNG, JPG, WebP, GIF or SVG." };
    if (logo.size > MAX_LOGO_BYTES) return { error: "The logo must be 500 KB or smaller." };
  }

  const settings: StoreSettings = {
    ...parsed.data,
    binanceUsdtRate: parsed.data.binanceUsdtRate.replace(",", "."),
    primaryColor: parsed.data.primaryColor.toLowerCase(),
    backgroundColor: parsed.data.backgroundColor.toLowerCase(),
    showNameWithLogo: formData.get("showNameWithLogo") === "on",
    sections: Object.fromEntries(
      homeSections.map((section) => [section.id, formData.get(`section-${section.id}`) === "on"]),
    ) as StoreSettings["sections"],
  };
  await saveSettings(settings);

  if (logo instanceof File && logo.size > 0) {
    await saveLogo({ contentType: logo.type, base64: Buffer.from(await logo.arrayBuffer()).toString("base64") });
  } else if (formData.get("removeLogo") === "on") {
    await saveLogo(null);
  }

  revalidatePath("/", "layout");
  return { saved: true };
}
