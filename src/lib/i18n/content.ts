import type { Locale } from "./locales";

// Translations for the built-in placeholder catalog (category names, features, durations in product names),
// so the demo catalog reads naturally in every language. Content admins write is translated in the admin.
type Translated = Record<Exclude<Locale, "en">, string>;

const phrases: Record<string, Translated> = {
  // Categories
  "Design & Creative": { fr: "Design et création", ar: "التصميم والإبداع", es: "Diseño y creatividad", de: "Design & Kreatives" },
  "Developer Tools": { fr: "Outils de développement", ar: "أدوات المطورين", es: "Herramientas para desarrolladores", de: "Entwickler-Tools" },
  Productivity: { fr: "Productivité", ar: "الإنتاجية", es: "Productividad", de: "Produktivität" },
  "Audio & Video": { fr: "Audio et vidéo", ar: "الصوت والفيديو", es: "Audio y vídeo", de: "Audio & Video" },
  Learning: { fr: "Apprentissage", ar: "التعلّم", es: "Aprendizaje", de: "Lernen" },
  // Features
  "Instant activation": { fr: "Activation instantanée", ar: "تفعيل فوري", es: "Activación instantánea", de: "Sofortige Aktivierung" },
  "All brush packs included": { fr: "Tous les packs de pinceaux inclus", ar: "جميع حزم الفُرش مشمولة", es: "Todos los packs de pinceles incluidos", de: "Alle Pinsel-Pakete inklusive" },
  "Use on desktop and mobile": { fr: "Sur ordinateur et mobile", ar: "للاستخدام على الكمبيوتر والجوال", es: "Úsalo en ordenador y móvil", de: "Auf Desktop und Mobilgerät nutzbar" },
  "Unlimited exports": { fr: "Exports illimités", ar: "تصدير غير محدود", es: "Exportaciones ilimitadas", de: "Unbegrenzte Exporte" },
  "Full 30 days of Pro features": { fr: "30 jours complets de fonctions Pro", ar: "30 يومًا كاملة من ميزات Pro", es: "30 días completos de funciones Pro", de: "Volle 30 Tage Pro-Funktionen" },
  "Duration: 12 months": { fr: "Durée : 12 mois", ar: "المدة: 12 شهرًا", es: "Duración: 12 meses", de: "Laufzeit: 12 Monate" },
  "Certificate of completion": { fr: "Certificat de réussite", ar: "شهادة إتمام", es: "Certificado de finalización", de: "Abschlusszertifikat" },
  "Cancel any time": { fr: "Résiliable à tout moment", ar: "إلغاء في أي وقت", es: "Cancela cuando quieras", de: "Jederzeit kündbar" },
  "Batch processing": { fr: "Traitement par lots", ar: "معالجة دفعية", es: "Procesamiento por lotes", de: "Stapelverarbeitung" },
  "650 render credits": { fr: "650 crédits de rendu", ar: "650 رصيد عرض", es: "650 créditos de renderizado", de: "650 Render-Credits" },
  "40+ hours of video lessons": { fr: "Plus de 40 heures de cours vidéo", ar: "أكثر من 40 ساعة من الدروس المصورة", es: "Más de 40 horas de clases en vídeo", de: "Über 40 Stunden Videolektionen" },
  "Instant delivery": { fr: "Livraison instantanée", ar: "تسليم فوري", es: "Entrega instantánea", de: "Sofortige Lieferung" },
  "Lifetime updates": { fr: "Mises à jour à vie", ar: "تحديثات مدى الحياة", es: "Actualizaciones de por vida", de: "Lebenslange Updates" },
};

export const translatePhrase = (text: string, locale: Locale) => (locale === "en" ? text : (phrases[text]?.[locale] ?? text));

// "12 months", "1 year", "team license"... at the end of placeholder product names.
const nameSuffixes: { pattern: RegExp; replace: Record<Exclude<Locale, "en">, (count: number) => string> }[] = [
  {
    pattern: /(\d+) months?$/,
    replace: {
      fr: (n) => `${n} mois`,
      ar: (n) => (n === 1 ? "شهر واحد" : n === 12 ? "12 شهرًا" : `${n} أشهر`),
      es: (n) => `${n} ${n === 1 ? "mes" : "meses"}`,
      de: (n) => `${n} ${n === 1 ? "Monat" : "Monate"}`,
    },
  },
  {
    pattern: /(\d+) years?$/,
    replace: {
      fr: (n) => `${n} ${n === 1 ? "an" : "ans"}`,
      ar: (n) => (n === 1 ? "سنة واحدة" : `${n} سنوات`),
      es: (n) => `${n} ${n === 1 ? "año" : "años"}`,
      de: (n) => `${n} ${n === 1 ? "Jahr" : "Jahre"}`,
    },
  },
  { pattern: /team license$/, replace: { fr: () => "licence équipe", ar: () => "ترخيص للفريق", es: () => "licencia de equipo", de: () => "Team-Lizenz" } },
  { pattern: /family plan$/, replace: { fr: () => "offre famille", ar: () => "باقة العائلة", es: () => "plan familiar", de: () => "Familientarif" } },
  { pattern: /lifetime$/, replace: { fr: () => "à vie", ar: () => "مدى الحياة", es: () => "de por vida", de: () => "lebenslang" } },
  { pattern: /(\d+) credits$/, replace: { fr: (n) => `${n} crédits`, ar: (n) => `${n} رصيد`, es: (n) => `${n} créditos`, de: (n) => `${n} Credits` } },
  { pattern: /templates$/, replace: { fr: () => "modèles", ar: () => "قوالب", es: () => "plantillas", de: () => "Vorlagen" } },
];

export function translateProductName(name: string, locale: Locale) {
  if (locale === "en") return name;
  for (const { pattern, replace } of nameSuffixes) {
    const match = name.match(pattern);
    if (match) return name.slice(0, match.index) + replace[locale](Number(match[1]));
  }
  return name;
}

// Placeholder descriptions read "<name>, delivered by email right after payment is confirmed."
const deliveredSuffix = ", delivered by email right after payment is confirmed.";
const deliveredTemplates: Translated = {
  fr: "{name}, livré par e-mail juste après la confirmation du paiement.",
  ar: "{name}، يُسلَّم عبر البريد الإلكتروني فور تأكيد الدفع.",
  es: "{name}, enviado por correo justo después de confirmar el pago.",
  de: "{name}, per E-Mail geliefert, sobald die Zahlung bestätigt ist.",
};

export function translateDescription(description: string, originalName: string, localizedName: string, locale: Locale) {
  if (locale === "en") return description;
  if (description === `${originalName}${deliveredSuffix}`) return deliveredTemplates[locale].replace("{name}", localizedName);
  return phrases[description]?.[locale] ?? description;
}
