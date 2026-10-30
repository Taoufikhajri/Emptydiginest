import { themeCss, type StoreSettings } from "@/lib/settings";

// Applies the brand colors, font and corner style chosen in admin Settings.
export function StoreTheme({ settings }: { settings: StoreSettings }) {
  return <style>{themeCss(settings)}</style>;
}
