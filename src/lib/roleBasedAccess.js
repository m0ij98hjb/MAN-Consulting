/* ══════════════════════════════════════════════════════════════
   Role-Based Access Control (RBAC) - Central Configuration
   ══════════════════════════════════════════════════════════════ */

/* ─── Roles Definition ─── */
export const ROLES = {
  // Management
  COMPANY_MANAGER: 'company_manager',
  PROJECT_MANAGER: 'project_manager',
  HR_MANAGER: 'hr_manager',
  ACCOUNTANT: 'accountant',
  ENGINEERING_MANAGER: 'engineering_manager',

  // External
  CLIENT: 'client',

  // System
  SUPER_ADMIN: 'super_admin',
};

/* ─── Multi-language Role Labels ─── */
export const ROLE_LABELS_MULTILANG = {
  [ROLES.SUPER_ADMIN]: {
    ar: 'مدير النظام', en: 'Super Admin', hi: 'सुपर एडमिन', ru: 'Супер админ',
    de: 'Super-Admin', fr: 'Super Admin', es: 'Super Admin', tr: 'Süper Yönetici', ur: 'سپر ایڈمن', zh: '超级管理员'
  },
  [ROLES.COMPANY_MANAGER]: {
    ar: 'مدير الشركة', en: 'Company Manager', hi: 'कंपनी प्रबंधक', ru: 'Менеджер компании',
    de: 'Unternehmensleiter', fr: 'Directeur de société', es: 'Gerente de empresa', tr: 'Şirket Müdürü', ur: 'کمپنی مینیجر', zh: '公司经理'
  },
  [ROLES.PROJECT_MANAGER]: {
    ar: 'مدير المشاريع', en: 'Project Manager', hi: 'परियोजना प्रबंधक', ru: 'Менеджер проектов',
    de: 'Projektleiter', fr: 'Chef de projet', es: 'Gerente de proyectos', tr: 'Proje Müdürü', ur: 'پروجیکٹ مینیجر', zh: '项目经理'
  },
  [ROLES.HR_MANAGER]: {
    ar: 'مدير الموارد البشرية', en: 'HR Manager', hi: 'एचआर मैनेजर', ru: 'Менеджер по персоналу',
    de: 'Personalleiter', fr: 'Responsable RH', es: 'Gerente de RRHH', tr: 'IK Müdürü', ur: 'ایچ آر مینیجر', zh: '人力资源经理'
  },
  [ROLES.ACCOUNTANT]: {
    ar: 'المحاسب', en: 'Accountant', hi: 'लेखाकार', ru: 'Бухгалтер',
    de: 'Buchhalter', fr: 'Comptable', es: 'Contador', tr: 'Muhasebeci', ur: 'اکاؤنٹنٹ', zh: '会计'
  },
  [ROLES.ENGINEERING_MANAGER]: {
    ar: 'مدير الهندسة', en: 'Engineering Manager', hi: 'इंजीनियरिंग प्रबंधक', ru: 'Главный инженер',
    de: 'Technischer Leiter', fr: 'Directeur ingénierie', es: 'Gerente de ingeniería', tr: 'Mühendislik Müdürü', ur: 'انجینئرنگ مینیجر', zh: '工程经理'
  },
  [ROLES.CLIENT]: {
    ar: 'العميل', en: 'Client', hi: 'ग्राहक', ru: 'Клиент',
    de: 'Kunde', fr: 'Client', es: 'Cliente', tr: 'Müşteri', ur: 'کلائنٹ', zh: '客户'
  },
};

/* Legacy fallback for ROLE_LABELS */
export const ROLE_LABELS = Object.fromEntries(
  Object.entries(ROLE_LABELS_MULTILANG).map(([k, v]) => [k, v.ar])
);

/* ─── Navigation Labels Multi-language ─── */
export const NAV_LABELS_MULTILANG = {
  '/admin/dashboard': {
    ar: 'لوحة التحكم', en: 'Dashboard', hi: 'डैशबोर्ड', ru: 'Дашборд',
    de: 'Dashboard', fr: 'Tableau de bord', es: 'Panel de control', tr: 'Kontrol Paneli', ur: 'ڈیش بورڈ', zh: '仪表板'
  },
  '/admin/content': {
    ar: 'إدارة المحتوى', en: 'Content Management', hi: 'सामग्री प्रबंधन', ru: 'Управление контентом',
    de: 'Content-Management', fr: 'Gestion du contenu', es: 'Gestión de contenido', tr: 'İçerik Yönetimi', ur: 'مواد کا انتظام', zh: '内容管理'
  },
  '/admin/media': {
    ar: 'مكتبة الوسائط', en: 'Media Library', hi: 'मीडिया लाइब्रेरी', ru: 'Медиатека',
    de: 'Medienbibliothek', fr: 'Bibliothèque média', es: 'Biblioteca multimedia', tr: 'Medya Kütüphanesi', ur: 'میڈیا لائبریری', zh: '媒体库'
  },
  '/admin/users': {
    ar: 'إدارة المستخدمين', en: 'User Management', hi: 'उपयोगकर्ता प्रबंधन', ru: 'Управление пользователями',
    de: 'Benutzerverwaltung', fr: 'Gestion des utilisateurs', es: 'Gestión de usuarios', tr: 'Kullanıcı Yönetimi', ur: 'صارفین کا انتظام', zh: '用户管理'
  },
  '/admin/jobs': {
    ar: 'طلبات التوظيف', en: 'Job Applications', hi: 'नौकरी के आवेदन', ru: 'Заявки на работу',
    de: 'Bewerbungen', fr: 'Candidatures', es: 'Solicitudes de empleo', tr: 'İş Başvuruları', ur: 'نوکری کی درخواستیں', zh: 'Job 申请'
  },
  '/admin/jobs/approved': {
    ar: 'المقبولون للمقابلة', en: 'Interview Candidates', hi: 'साक्षात्कार उम्मीदवार', ru: 'Кандидаты на интервью',
    de: 'Interview-Kandidaten', fr: 'Candidats en entretien', es: 'Candidatos a entrevista', tr: 'Mülakat Adayları', ur: 'انٹرویو کے امیدوار', zh: '面试候选人'
  },
  '/admin/jobs/best': {
    ar: 'أفضل المرشحين', en: 'Top Candidates', hi: 'शीर्ष उम्मीदवार', ru: 'Лучшие кандидаты',
    de: 'Top-Kandidaten', fr: 'Meilleurs candidats', es: 'Mejores candidatos', tr: 'En İyi Adaylar', ur: 'بہترین امیدوار', zh: '最佳候选人'
  },
  '/admin/messages': {
    ar: 'رسائل العملاء', en: 'Customer Messages', hi: 'ग्राहक संदेश', ru: 'Сообщения клиентов',
    de: 'Kundennachrichten', fr: 'Messages clients', es: 'Mensajes de clientes', tr: 'Müşteri Mesajları', ur: 'گاہکوں کے پیغامات', zh: '客户消息'
  },
  '/admin/reports': {
    ar: 'التقارير', en: 'Reports', hi: 'रिपोर्ट', ru: 'Отчеты',
    de: 'Berichte', fr: 'Rapports', es: 'Informes', tr: 'Raporlar', ur: 'رپورٹس', zh: '报告'
  },
};

/* ─── Dashboard Routes per Role ─── */
export const ROLE_DASHBOARDS = {
  [ROLES.COMPANY_MANAGER]: '/admin/dashboard',
  [ROLES.PROJECT_MANAGER]: '/admin/dashboard',
  [ROLES.HR_MANAGER]: '/admin/jobs',
  [ROLES.ACCOUNTANT]: '/admin/reports',
  [ROLES.ENGINEERING_MANAGER]: '/admin/dashboard',
  [ROLES.CLIENT]: '/admin/dashboard',
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
};

/* ─── Navigation Items per Role ─── */
export const ROLE_NAVIGATION = {
  [ROLES.COMPANY_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/jobs', label: 'طلبات التوظيف', icon: 'Briefcase' },
    { href: '/admin/messages', label: 'رسائل العملاء', icon: 'MessageSquare' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
  ],

  [ROLES.PROJECT_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/jobs', label: 'طلبات التوظيف', icon: 'Briefcase' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
  ],

  [ROLES.HR_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/jobs', label: 'طلبات التوظيف', icon: 'Briefcase' },
    { href: '/admin/jobs/approved', label: 'المقبولون للمقابلة', icon: 'CheckCircle' },
    { href: '/admin/jobs/best', label: 'أفضل المرشحين', icon: 'Award' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
  ],

  [ROLES.ACCOUNTANT]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/reports', label: 'التقارير العامة', icon: 'BarChart2' },
  ],

  [ROLES.ENGINEERING_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
  ],

  [ROLES.CLIENT]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/reports', label: 'تقارير المشاريع', icon: 'BarChart2' },
  ],

  [ROLES.SUPER_ADMIN]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/content', label: 'إدارة المحتوى', icon: 'PenSquare' },
    { href: '/admin/media', label: 'مكتبة الوسائط', icon: 'ImageIcon' },
    { href: '/admin/users', label: 'إدارة المستخدمين', icon: 'UserCog' },
    { href: '/admin/jobs', label: 'طلبات التوظيف', icon: 'Briefcase' },
    { href: '/admin/messages', label: 'رسائل العملاء', icon: 'MessageSquare' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
  ],
};

/* ─── Allowed Routes per Role ─── */
export const ROLE_ALLOWED_ROUTES = {
  [ROLES.COMPANY_MANAGER]: [
    '/admin/dashboard',
    '/admin/jobs',
    '/admin/jobs/*',
    '/admin/messages',
    '/admin/reports',
  ],

  [ROLES.PROJECT_MANAGER]: [
    '/admin/dashboard',
    '/admin/jobs',
    '/admin/jobs/*',
    '/admin/reports',
  ],

  [ROLES.HR_MANAGER]: [
    '/admin/dashboard',
    '/admin/jobs',
    '/admin/jobs/*',
    '/admin/reports',
  ],

  [ROLES.ACCOUNTANT]: [
    '/admin/dashboard',
    '/admin/reports',
  ],

  [ROLES.ENGINEERING_MANAGER]: [
    '/admin/dashboard',
    '/admin/reports',
  ],

  [ROLES.CLIENT]: [
    '/admin/dashboard',
    '/admin/reports',
  ],

  [ROLES.SUPER_ADMIN]: [
    '/admin/*',
  ],
};

/* ─── Helper Functions ─── */

/**
 * Get the dashboard route for a given role
 */
export function getDashboardForRole(role) {
  return ROLE_DASHBOARDS[role] || '/admin/dashboard';
}

/**
 * Get navigation items for a given role (localized)
 */
export function getNavigationForRole(role, lang = 'ar') {
  const items = ROLE_NAVIGATION[role] || [];
  return items.map(item => {
    const locMap = NAV_LABELS_MULTILANG[item.href];
    const localizedLabel = locMap ? (locMap[lang] || locMap.en || item.label) : item.label;
    return {
      ...item,
      label: localizedLabel,
    };
  });
}

/**
 * Check if a role can access a specific route
 */
export function canRoleAccessRoute(role, pathname) {
  const allowedRoutes = ROLE_ALLOWED_ROUTES[role] || [];

  for (const route of allowedRoutes) {
    if (route === pathname) return true;
    if (route.endsWith('/*')) {
      const prefix = route.slice(0, -2);
      if (pathname.startsWith(prefix)) return true;
    }
  }

  return false;
}

/**
 * Get role label in active language
 */
export function getRoleLabel(role, lang = 'ar') {
  const locMap = ROLE_LABELS_MULTILANG[role];
  if (locMap) {
    return locMap[lang] || locMap.en || role;
  }
  return ROLE_LABELS[role] || role;
}

/**
 * Get all available roles
 */
export function getAllRoles() {
  return Object.values(ROLES);
}
