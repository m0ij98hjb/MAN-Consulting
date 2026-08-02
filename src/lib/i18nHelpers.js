// Resolves a `{field}_ar`/`{field}_en`-style pair to the current language.
// The CMS only edits AR/EN per project (matching every other CMS tab); all
// other site locales fall back to EN, same behavior as the rest of the CMS.
export function getLocalizedText(obj, field, lang) {
  if (!obj) return '';
  return obj[`${field}_${lang}`] || obj[`${field}_en`] || obj[`${field}_ar`] || '';
}
