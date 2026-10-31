import { cache } from "react";
import { query } from "../db";
import type { Category, Product } from "../queries";
import { defaultSettings, getSettings, translatableFields, type StoreSettings, type TranslatableField } from "../settings";
import { translateDescription, translatePhrase, translateProductName } from "./content";
import type { Locale } from "./locales";
import { getI18n } from "./server";
import type { MessageKey, Translate } from "./translate";

// While a field still has its built-in English text, the built-in translation is used.
const defaultKeys: Partial<Record<TranslatableField, MessageKey>> = {
  tagline: "site.defaultTagline",
  description: "site.defaultDescription",
  heroTitleLead: "hero.defaultLead",
  heroTitleAccent: "hero.defaultAccent",
  heroSubtitle: "hero.defaultSubtitle",
};

// The text a field shows in a language when the admin hasn't written a translation for it.
export function fallbackText(settings: StoreSettings, field: TranslatableField, t: Translate) {
  const key = defaultKeys[field];
  return key && settings[field] === defaultSettings[field] ? t(key) : settings[field];
}

export function localizeSettings<T extends StoreSettings>(settings: T, locale: Locale, t: Translate): T {
  const own = locale === "en" ? undefined : settings.translations[locale];
  const localized = { ...settings };
  for (const field of translatableFields) {
    localized[field] = own?.[field]?.trim() || fallbackText(settings, field, t);
  }
  return localized;
}

export const getLocalizedSettings = cache(async () => {
  const [settings, { locale, t }] = await Promise.all([getSettings(), getI18n()]);
  return localizeSettings(settings, locale, t);
});

type TranslationRow = { product_id: number; name: string; description: string; features: string[] };

// Returns a function that shows a product in the visitor's language: the admin's translation when there
// is one, else the built-in translation of placeholder text, else the English text.
export const getProductLocalizer = cache(async () => {
  const { locale } = await getI18n();
  if (locale === "en") return (product: Product) => product;
  const rows = await query<TranslationRow>(
    "SELECT product_id, name, description, features FROM product_translations WHERE locale = $1",
    [locale],
  );
  const byProduct = new Map(rows.map((row) => [row.product_id, row]));
  return (product: Product): Product => {
    const own = byProduct.get(product.id);
    const name = own?.name.trim() || translateProductName(product.name, locale);
    const features = Array.isArray(own?.features) && own.features.length > 0 ? own.features : product.features;
    return {
      ...product,
      name,
      description: own?.description.trim() || translateDescription(product.description, product.name, name, locale),
      features: features.map((feature) => translatePhrase(feature, locale)),
      categoryName: product.categoryName && translatePhrase(product.categoryName, locale),
    };
  };
});

export const getCategoryLocalizer = cache(async () => {
  const { locale } = await getI18n();
  return <C extends Pick<Category, "name">>(category: C): C => ({ ...category, name: translatePhrase(category.name, locale) });
});
