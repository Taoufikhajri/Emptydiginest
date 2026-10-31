"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { createTranslate, type Messages, type Translate } from "@/lib/i18n/translate";

type I18nContextValue = { locale: Locale; t: Translate };

const I18nContext = createContext<I18nContextValue | null>(null);

// Hands the current language's strings to client components; only that one dictionary is sent.
export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: createTranslate(messages) }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
