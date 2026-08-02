// Site Statistics Configuration
// These values are pulled from actual project data

export const siteStats = {
  projects: {
    value: 230, // Total completed projects
    label: {
      ar: "مشروع",
      en: "Projects",
      zh: "项目",
      es: "Proyectos",
      fr: "Projets",
      de: "Projekte",
      tr: "Proje",
      ur: "منصوبے",
      hi: "परियोजनाएं",
      ru: "Проекты"
    }
  },
  satisfaction: {
    value: 99,
    label: {
      ar: "رضى العملاء",
      en: "Client Satisfaction",
      zh: "客户满意度",
      es: "Satisfacción del cliente",
      fr: "Satisfaction client",
      de: "Kundenzufriedenheit",
      tr: "Müşteri Memnuniyeti",
      ur: "صارفین کا اطمینان",
      hi: "ग्राहक संतुष्टि",
      ru: "Удовлетворённость клиентов"
    },
    suffix: "%"
  },
  designs: {
    value: 104, // Total designs/images from projects
    label: {
      ar: "تصميم",
      en: "Designs",
      zh: "设计",
      es: "Diseños",
      fr: "Designs",
      de: "Designs",
      tr: "Tasarım",
      ur: "ڈیزائن",
      hi: "डिज़ाइन",
      ru: "Дизайны"
    },
    suffix: "+",
    displayValue: (val) => val
  }
};

export const getStatLabel = (statKey, lang) => {
  return siteStats[statKey]?.label[lang] || siteStats[statKey]?.label.en;
};

export const getStatValue = (statKey) => {
  return siteStats[statKey]?.value;
};

export const getStatSuffix = (statKey) => {
  return siteStats[statKey]?.suffix || "+";
};
