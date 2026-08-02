// Project category taxonomy — shared by the admin Projects CRUD and every
// public page that renders/filters projects. Kept as a static config (not a
// Firestore collection) since categories rarely change; see Phase 1 CMS plan.
export const PROJECT_CATEGORIES = {
  all: {
    id: "all",
    label: { ar: "جميع المشاريع", en: "All Projects", hi: "सभी परियोजनाएं", ru: "Все проекты", de: "Alle Projekte", es: "Todos los proyectos", fr: "Tous les projets", tr: "Tüm Projeler", ur: "تمام منصوبے", zh: "所有项目" },
    icon: "🏗️",
  },
  commercial: {
    id: "commercial",
    label: { ar: "مكاتب تجارية", en: "Commercial & Offices", hi: "वाणिज्यिक और कार्यालय", ru: "Коммерческие и офисы", de: "Gewerbe & Büros", es: "Comercial y oficinas", fr: "Commercial et bureaux", tr: "Ticari & Ofisler", ur: "تجارتی اور دفاتر", zh: "商业与办公" },
    icon: "🏢",
  },
  residential: {
    id: "residential",
    label: { ar: "سكني وإنشائي", en: "Residential & Construction", hi: "आवासीय और निर्माण", ru: "Жилые и строительство", de: "Wohn- & Bauprojekte", es: "Residencial y construcción", fr: "Résidentiel et construction", tr: "Konut & İnşaat", ur: "رہائشی اور تعمیراتی", zh: "住宅与工程" },
    icon: "🏘️",
  },
  recent: {
    id: "recent",
    label: { ar: "أعمال 2025", en: "Recent Works 2025", hi: "हाल के कार्य 2025", ru: "Недавние работы 2025", de: "Neueste Arbeiten 2025", es: "Trabajos recientes 2025", fr: "Travaux récents 2025", tr: "Son Çalışmalar 2025", ur: "حالیہ کام 2025", zh: "2025近期作品" },
    icon: "✨",
  },
  architectural: {
    id: "architectural",
    label: { ar: "معماري وداخلي", en: "Architectural & Interior", hi: "वास्तुकला और आंतरिक", ru: "Архитектурный и интерьер", de: "Architektur & Innenarchitektur", es: "Arquitectura e interiores", fr: "Architecture et intérieur", tr: "Mimari & İç Mekan", ur: "معمارانہ اور داخلی", zh: "建筑与室内" },
    icon: "🎨",
  },
  archive: {
    id: "archive",
    label: { ar: "مشاريع سابقة", en: "Past Projects", hi: "पूर्व परियोजनाएं", ru: "Прошлые проекты", de: "Frühere Projekte", es: "Proyectos anteriores", fr: "Projets passés", tr: "Geçmiş Projeler", ur: "سابقہ منصوبے", zh: "以往项目" },
    icon: "📁",
  },
};

export function getCategoryLabel(categoryId, lang) {
  const cat = PROJECT_CATEGORIES[categoryId];
  if (!cat) return categoryId || "";
  return cat.label[lang] || cat.label.en || cat.label.ar || categoryId;
}

export const PROJECT_CATEGORY_IDS = Object.keys(PROJECT_CATEGORIES).filter((id) => id !== "all");
