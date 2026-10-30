import { cache } from "react";
import { query, queryOne } from "./db";
import { cornerStyles, defaultSettings, fonts, readableTextOn, type StoreSettings } from "./settings-shared";

export * from "./settings-shared";

export type StoreSettingsWithLogo = StoreSettings & { logoUrl: string | null };

type SettingsRow = { data: Partial<StoreSettings>; logo_updated_at: Date | null };

// Read once per request; every layout, page and component that asks shares the result.
const getSettingsRow = cache(() =>
  queryOne<SettingsRow>(
    "SELECT data, CASE WHEN logo_data IS NULL THEN NULL ELSE logo_updated_at END AS logo_updated_at FROM store_settings WHERE id = 1",
  ),
);

export async function getStoredSettings(): Promise<StoreSettings> {
  const data = (await getSettingsRow())?.data ?? {};
  return { ...defaultSettings, ...data, sections: { ...defaultSettings.sections, ...data.sections } };
}

export async function getSettings(): Promise<StoreSettingsWithLogo> {
  const [settings, row] = await Promise.all([getStoredSettings(), getSettingsRow()]);
  // The version in the URL lets browsers cache the logo until it changes.
  const logoUrl = row?.logo_updated_at ? `/brand/logo?v=${new Date(row.logo_updated_at).getTime()}` : null;
  return { ...settings, logoUrl };
}

export async function saveSettings(settings: StoreSettings) {
  await query(
    `INSERT INTO store_settings (id, data, updated_at) VALUES (1, $1::jsonb, now())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [JSON.stringify(settings)],
  );
}

export async function saveLogo(logo: { contentType: string; base64: string } | null) {
  await query(
    `INSERT INTO store_settings (id, logo_type, logo_data, logo_updated_at) VALUES (1, $1, $2, now())
     ON CONFLICT (id) DO UPDATE SET logo_type = EXCLUDED.logo_type, logo_data = EXCLUDED.logo_data, logo_updated_at = now()`,
    [logo?.contentType ?? null, logo?.base64 ?? null],
  );
}

export async function getLogo() {
  return queryOne<{ logo_type: string; logo_data: string }>(
    "SELECT logo_type, logo_data FROM store_settings WHERE id = 1 AND logo_data IS NOT NULL",
  );
}

// CSS variables for the brand colors, font and corners. Values are validated when saved.
export function themeCss(settings: StoreSettings) {
  const corners = cornerStyles.find((style) => style.id === settings.corners) ?? cornerStyles[0];
  const font = fonts.find((option) => option.id === settings.font) ?? fonts[0];
  return `:root{--primary:${settings.primaryColor};--primary-foreground:${readableTextOn(settings.primaryColor)};--ring:${settings.primaryColor};--background:${settings.backgroundColor};--secondary:${settings.backgroundColor};--muted:${settings.backgroundColor};--accent:${settings.backgroundColor};--store-radius:${corners.cardRadius};--radius:${corners.uiRadius};--store-font:var(${font.cssVar})}`;
}
