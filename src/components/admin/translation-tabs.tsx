"use client";

import { useState } from "react";
import { translationLocales, type TranslationLocale } from "@/lib/settings-shared";
import { cn } from "@/lib/utils";

// One tab per store language. Every panel stays in the form (inactive ones are hidden) so all
// languages are saved together.
export function TranslationTabs({ children }: { children: (locale: TranslationLocale) => React.ReactNode }) {
  const [active, setActive] = useState<TranslationLocale>(translationLocales[0].code);

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1.5">
        {translationLocales.map((locale) => (
          <button
            key={locale.code}
            type="button"
            role="tab"
            aria-selected={active === locale.code}
            onClick={() => setActive(locale.code)}
            className={cn(
              "h-8 rounded-full border px-3 text-xs font-semibold transition-colors",
              active === locale.code ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
            )}
          >
            {locale.label}
          </button>
        ))}
      </div>
      {translationLocales.map((locale) => (
        <div
          key={locale.code}
          role="tabpanel"
          hidden={active !== locale.code}
          dir={locale.code === "ar" ? "rtl" : undefined}
          className="mt-3 space-y-3"
        >
          {children(locale.code)}
        </div>
      ))}
    </div>
  );
}
