// Locale-aware date/number/currency formatting, keyed off the app's `lang`
// code (from useLanguage()) rather than the browser's default locale.
// Generalizes the ar/en-only pattern that used to live inline in
// cost-calculator/page.js so every screen formats consistently across all
// 10 supported languages.
//
// `numberingSystem: 'latn'` is always forced so ar/ur/hi never silently
// switch to native digit glyphs (Arabic-Indic, Devanagari) — this keeps
// today's shipped digit rendering unchanged while still localizing month
// names, weekday names, and date ordering.

const LOCALE_MAP = {
  ar: "ar-SA",
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  tr: "tr-TR",
  ur: "ur-PK",
  ru: "ru-RU",
  hi: "hi-IN",
};

export function toBCP47(lang) {
  return LOCALE_MAP[lang] || LOCALE_MAP.en;
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value, lang, options = {}) {
  return toDate(value).toLocaleDateString(toBCP47(lang), {
    numberingSystem: "latn",
    ...options,
  });
}

export function formatDateTime(value, lang, options = {}) {
  return toDate(value).toLocaleString(toBCP47(lang), {
    numberingSystem: "latn",
    ...options,
  });
}

export function formatTime(value, lang, options = {}) {
  return toDate(value).toLocaleTimeString(toBCP47(lang), {
    numberingSystem: "latn",
    ...options,
  });
}

export function formatNumber(value, lang, options = {}) {
  return new Intl.NumberFormat(toBCP47(lang), {
    numberingSystem: "latn",
    ...options,
  }).format(Number(value) || 0);
}

export function formatCurrency(value, lang, currency = "SAR") {
  return new Intl.NumberFormat(toBCP47(lang), {
    numberingSystem: "latn",
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
