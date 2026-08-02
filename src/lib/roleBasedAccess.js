/* ══════════════════════════════════════════════════════════════
   Role-Based Access Control (RBAC) - Central Configuration
   ══════════════════════════════════════════════════════════════ */

/* ─── Roles Definition ─── */
export const ROLES = {
  // Management
  COMPANY_MANAGER: 'company_manager',
  PROJECT_MANAGER: 'project_manager',
  PROCUREMENT_MANAGER: 'procurement_manager',
  HR_MANAGER: 'hr_manager',
  ACCOUNTANT: 'accountant',
  ENGINEERING_MANAGER: 'engineering_manager',
  
  // Site & Engineering
  SITE_ENGINEER: 'site_engineer',
  SITE_SUPERVISOR: 'site_supervisor',
  
  // External
  SUPPLIER: 'supplier',
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
  [ROLES.PROCUREMENT_MANAGER]: {
    ar: 'مدير المشتريات', en: 'Procurement Manager', hi: 'क्रय प्रबंधक', ru: 'Менеджер по закупкам',
    de: 'Einkaufsleiter', fr: 'Responsable des achats', es: 'Gerente de compras', tr: 'Satınalma Müdürü', ur: 'خریداری مینیجر', zh: '采购经理'
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
  [ROLES.SITE_ENGINEER]: {
    ar: 'مهندس موقع', en: 'Site Engineer', hi: 'साइट इंजीनियर', ru: 'Инженер объекта',
    de: 'Bauingenieur', fr: 'Ingénieur de chantier', es: 'Ingeniero de obra', tr: 'Saha Mühendisi', ur: 'سائٹ انجینئر', zh: '现场工程师'
  },
  [ROLES.SITE_SUPERVISOR]: {
    ar: 'مشرف موقع', en: 'Site Supervisor', hi: 'साइट सुपरवाइज़र', ru: 'Прораб',
    de: 'Bauleiter', fr: 'Conducteur de travaux', es: 'Supervisor de obra', tr: 'Saha Sorumlusu', ur: 'سائٹ سپروائزر', zh: '现场主管'
  },
  [ROLES.SUPPLIER]: {
    ar: 'المورد', en: 'Supplier', hi: 'आपूर्तिकर्ता', ru: 'Поставщик',
    de: 'Lieferant', fr: 'Fournisseur', es: 'Proveedor', tr: 'Tedarikçi', ur: 'سپلائر', zh: '供应商'
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
  '/admin/cameras': {
    ar: 'إدارة الكاميرات', en: 'Camera Management', hi: 'कैमरा प्रबंधन', ru: 'Управление камерами',
    de: 'Kameraverwaltung', fr: 'Gestion des caméras', es: 'Gestión de cámaras', tr: 'Kamera Yönetimi', ur: 'کیمروں کا انتظام', zh: '摄像头管理'
  },
  '/admin/users': {
    ar: 'إدارة المستخدمين', en: 'User Management', hi: 'उपयोगकर्ता प्रबंधन', ru: 'Управление пользователями',
    de: 'Benutzerverwaltung', fr: 'Gestion des utilisateurs', es: 'Gestión de usuarios', tr: 'Kullanıcı Yönetimi', ur: 'صارفین کا انتظام', zh: '用户管理'
  },
  '/admin/suppliers': {
    ar: 'الموردون', en: 'Suppliers', hi: 'आपूर्तिकर्ता', ru: 'Поставщики',
    de: 'Lieferanten', fr: 'Fournisseurs', es: 'Proveedores', tr: 'Tedarikçiler', ur: 'سپلائرز', zh: '供应商'
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
  '/admin/approved': {
    ar: 'المقبولون', en: 'Accepted Applicants', hi: 'स्वीकृत आवेदक', ru: 'Принятые кандидаты',
    de: 'Akzeptierte Bewerber', fr: 'Candidats acceptés', es: 'Candidatos aceptados', tr: 'Kabul Edilenler', ur: 'قبول شدہ امیدوار', zh: '已录取人员'
  },
  '/admin/purchasing': {
    ar: 'إدارة المشتريات', en: 'Purchasing Management', hi: 'क्रय प्रबंधन', ru: 'Управление закупками',
    de: 'Einkaufsmanagement', fr: 'Gestion des achats', es: 'Gestión de compras', tr: 'Satınalma Yönetimi', ur: 'خریداری کا انتظام', zh: '采购管理'
  },
  '/admin/purchasing/requests': {
    ar: 'طلبات الشراء', en: 'Purchase Requests', hi: 'क्रय अनुरोध', ru: 'Запросы на закупку',
    de: 'Kaufanfragen', fr: "Demandes d'achat", es: 'Solicitudes de compra', tr: 'Satınalma Talepleri', ur: 'خریداری کی درخواستیں', zh: '采购请求'
  },
  '/admin/purchasing/orders': {
    ar: 'أوامر الشراء', en: 'Purchase Orders', hi: 'क्रय आदेश', ru: 'Заказы на закупку',
    de: 'Bestellungen', fr: 'Bons de commande', es: 'Órdenes de compra', tr: 'Satınalma Siparişleri', ur: 'خریداری کے احکامات', zh: '采购订单'
  },
  '/admin/purchasing/suppliers': {
    ar: 'الموردين', en: 'Suppliers', hi: 'आपूर्तिकर्ता', ru: 'Поставщики',
    de: 'Lieferanten', fr: 'Fournisseurs', es: 'Proveedores', tr: 'Tedarikçiler', ur: 'سپلائرز', zh: '供应商'
  },
  '/admin/purchasing/rfq': {
    ar: 'المقارنات', en: 'RFQ Comparisons', hi: 'RFQ तुलना', ru: 'Сравнения RFQ',
    de: 'Angebotsvergleiche', fr: 'Comparaisons RFQ', es: 'Comparaciones RFQ', tr: 'Teklif Karşılaştırmaları', ur: 'پیاد موازنہ', zh: 'RFQ 比较'
  },
  '/admin/purchasing/reports': {
    ar: 'تقارير المشتريات', en: 'Purchasing Reports', hi: 'क्रय रिपोर्ट', ru: 'Отчеты по закупкам',
    de: 'Einkaufsberichte', fr: "Rapports d'achats", es: 'Informes de compras', tr: 'Satınalma Raporları', ur: 'خریداری کی رپورٹس', zh: '采购报告'
  },
  '/admin/purchasing/settings': {
    ar: 'إعدادات المشتريات', en: 'Purchasing Settings', hi: 'क्रय सेटिंग्स', ru: 'Настройки закупок',
    de: 'Einkaufseinstellungen', fr: "Paramètres d'achat", es: 'Configuración de compras', tr: 'Satınalma Ayarları', ur: 'خریداری سیٹنگز', zh: '采购设置'
  },
  '/admin/reports': {
    ar: 'التقارير', en: 'Reports', hi: 'रिपोर्ट', ru: 'Отчеты',
    de: 'Berichte', fr: 'Rapports', es: 'Informes', tr: 'Raporlar', ur: 'رپورٹس', zh: '报告'
  },
  '/purchase-request': {
    ar: 'طلب شراء', en: 'Purchase Request', hi: 'क्रय अनुरोध', ru: 'Запрос на закупку',
    de: 'Kaufanfrage', fr: "Demande d'achat", es: 'Solicitud de compra', tr: 'Satınalma Talebi', ur: 'خریداری کی درخواست', zh: '采购申请'
  },
  '/admin/cost-calculator': {
    ar: 'احسب تكلفتك', en: 'Cost Calculator', hi: 'लागत कैलकुलेटर', ru: 'Калькулятор стоимости',
    de: 'Kostenrechner', fr: 'Calculateur de coûts', es: 'Calculadora de costos', tr: 'Maliyet Hesaplayıcı', ur: 'لاگت کیلکولیٹر', zh: '成本计算器'
  },
  '/admin/cost-reports': {
    ar: 'تقارير التكلفة', en: 'Cost Reports', hi: 'लागत रिपोर्ट', ru: 'Отчеты о стоимости',
    de: 'Kostenberichte', fr: 'Rapports de coûts', es: 'Informes de costos', tr: 'Maliyet Raporları', ur: 'لاگت رپورٹس', zh: '成本报告'
  },
};

/* ─── Dashboard Routes per Role ─── */
export const ROLE_DASHBOARDS = {
  [ROLES.COMPANY_MANAGER]: '/admin/dashboard',
  [ROLES.PROJECT_MANAGER]: '/admin/dashboard',
  [ROLES.PROCUREMENT_MANAGER]: '/admin/purchasing',
  [ROLES.HR_MANAGER]: '/admin/jobs',
  [ROLES.ACCOUNTANT]: '/admin/reports',
  [ROLES.ENGINEERING_MANAGER]: '/admin/dashboard',
  [ROLES.SITE_ENGINEER]: '/admin/purchasing',
  [ROLES.SITE_SUPERVISOR]: '/purchase-request',
  [ROLES.SUPPLIER]: '/admin/suppliers',
  [ROLES.CLIENT]: '/admin/dashboard',
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
};

/* ─── Navigation Items per Role ─── */
export const ROLE_NAVIGATION = {
  [ROLES.COMPANY_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/suppliers', label: 'الموردون', icon: 'Users' },
    { href: '/admin/jobs', label: 'طلبات التوظيف', icon: 'Briefcase' },
    { href: '/admin/messages', label: 'رسائل العملاء', icon: 'MessageSquare' },
    { href: '/admin/approved', label: 'المقبولون', icon: 'CheckCircle' },
    { href: '/admin/purchasing', label: 'إدارة المشتريات', icon: 'ShoppingCart' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
    { href: '/admin/cost-calculator', label: 'احسب تكلفتك', icon: 'Calculator' },
    { href: '/admin/cost-reports', label: 'تقارير التكلفة', icon: 'FileText' },
  ],

  [ROLES.PROJECT_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/suppliers', label: 'الموردون', icon: 'Users' },
    { href: '/admin/jobs', label: 'طلبات التوظيف', icon: 'Briefcase' },
    { href: '/admin/purchasing', label: 'إدارة المشتريات', icon: 'ShoppingCart' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
    { href: '/admin/cost-calculator', label: 'احسب تكلفتك', icon: 'Calculator' },
    { href: '/admin/cost-reports', label: 'تقارير التكلفة', icon: 'FileText' },
  ],

  [ROLES.PROCUREMENT_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/purchasing', label: 'إدارة المشتريات', icon: 'ShoppingCart' },
    { href: '/admin/purchasing/requests', label: 'طلبات الشراء', icon: 'ShoppingCart' },
    { href: '/admin/purchasing/orders', label: 'أوامر الشراء', icon: 'ShoppingCart' },
    { href: '/admin/purchasing/suppliers', label: 'الموردين', icon: 'Users' },
    { href: '/admin/purchasing/rfq', label: 'المقارنات', icon: 'BarChart2' },
    { href: '/admin/purchasing/reports', label: 'التقارير', icon: 'BarChart2' },
    { href: '/admin/purchasing/settings', label: 'الإعدادات', icon: 'Settings' },
    { href: '/admin/cost-calculator', label: 'احسب تكلفتك', icon: 'Calculator' },
    { href: '/admin/cost-reports', label: 'تقارير التكلفة', icon: 'FileText' },
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
    { href: '/admin/purchasing', label: 'إدارة المشتريات', icon: 'ShoppingCart' },
    { href: '/admin/purchasing/orders', label: 'أوامر الشراء', icon: 'ShoppingCart' },
    { href: '/admin/purchasing/reports', label: 'التقارير المالية', icon: 'BarChart2' },
    { href: '/admin/reports', label: 'التقارير العامة', icon: 'BarChart2' },
  ],
  
  [ROLES.ENGINEERING_MANAGER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/suppliers', label: 'الموردون', icon: 'Users' },
    { href: '/admin/purchasing', label: 'إدارة المشتريات', icon: 'ShoppingCart' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
    { href: '/admin/cost-calculator', label: 'احسب تكلفتك', icon: 'Calculator' },
    { href: '/admin/cost-reports', label: 'تقارير التكلفة', icon: 'FileText' },
  ],

  [ROLES.SITE_ENGINEER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/purchasing', label: 'إدارة المشتريات', icon: 'ShoppingCart' },
    { href: '/admin/purchasing/requests', label: 'طلبات الشراء', icon: 'ShoppingCart' },
    { href: '/admin/cost-calculator', label: 'احسب تكلفتك', icon: 'Calculator' },
    { href: '/admin/cost-reports', label: 'تقارير التكلفة', icon: 'FileText' },
  ],
  
  [ROLES.SITE_SUPERVISOR]: [
    { href: '/purchase-request', label: 'طلب شراء', icon: 'ShoppingCart' },
  ],
  
  [ROLES.SUPPLIER]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/suppliers', label: 'بياناتي', icon: 'Users' },
    { href: '/admin/purchasing', label: 'العقود', icon: 'ShoppingCart' },
  ],
  
  [ROLES.CLIENT]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/reports', label: 'تقارير المشاريع', icon: 'BarChart2' },
  ],
  
  [ROLES.SUPER_ADMIN]: [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { href: '/admin/content', label: 'إدارة المحتوى', icon: 'PenSquare' },
    { href: '/admin/media', label: 'مكتبة الوسائط', icon: 'ImageIcon' },
    { href: '/admin/cameras', label: 'إدارة الكاميرات', icon: 'Camera' },
    { href: '/admin/users', label: 'إدارة المستخدمين', icon: 'UserCog' },
    { href: '/admin/suppliers', label: 'الموردون', icon: 'Users' },
    { href: '/admin/jobs', label: 'طلبات التوظيف', icon: 'Briefcase' },
    { href: '/admin/messages', label: 'رسائل العملاء', icon: 'MessageSquare' },
    { href: '/admin/approved', label: 'المقبولون', icon: 'CheckCircle' },
    { href: '/admin/purchasing', label: 'إدارة المشتريات', icon: 'ShoppingCart' },
    { href: '/admin/reports', label: 'التقارير', icon: 'BarChart2' },
    { href: '/admin/cost-calculator', label: 'احسب تكلفتك', icon: 'Calculator' },
    { href: '/admin/cost-reports', label: 'تقارير التكلفة', icon: 'FileText' },
  ],
};

/* ─── Allowed Routes per Role ─── */
export const ROLE_ALLOWED_ROUTES = {
  [ROLES.COMPANY_MANAGER]: [
    '/admin/dashboard',
    '/admin/suppliers',
    '/admin/suppliers/*',
    '/admin/jobs',
    '/admin/jobs/*',
    '/admin/messages',
    '/admin/approved',
    '/admin/purchasing',
    '/admin/purchasing/*',
    '/admin/reports',
    '/admin/cost-calculator',
    '/admin/cost-reports',
  ],

  [ROLES.PROJECT_MANAGER]: [
    '/admin/dashboard',
    '/admin/suppliers',
    '/admin/suppliers/*',
    '/admin/jobs',
    '/admin/jobs/*',
    '/admin/purchasing',
    '/admin/purchasing/*',
    '/admin/reports',
    '/admin/cost-calculator',
    '/admin/cost-reports',
  ],

  [ROLES.PROCUREMENT_MANAGER]: [
    '/admin/dashboard',
    '/admin/purchasing',
    '/admin/purchasing/*',
    '/admin/cost-calculator',
    '/admin/cost-reports',
  ],
  
  [ROLES.HR_MANAGER]: [
    '/admin/dashboard',
    '/admin/jobs',
    '/admin/jobs/*',
    '/admin/reports',
  ],
  
  [ROLES.ACCOUNTANT]: [
    '/admin/dashboard',
    '/admin/purchasing',
    '/admin/purchasing/orders',
    '/admin/purchasing/orders/*',
    '/admin/purchasing/reports',
    '/admin/reports',
  ],
  
  [ROLES.ENGINEERING_MANAGER]: [
    '/admin/dashboard',
    '/admin/suppliers',
    '/admin/suppliers/*',
    '/admin/purchasing',
    '/admin/purchasing/*',
    '/admin/reports',
    '/admin/cost-calculator',
    '/admin/cost-reports',
  ],

  [ROLES.SITE_ENGINEER]: [
    '/admin/dashboard',
    '/admin/purchasing',
    '/admin/purchasing/requests',
    '/admin/purchasing/requests/*',
    '/admin/cost-calculator',
    '/admin/cost-reports',
  ],
  
  [ROLES.SITE_SUPERVISOR]: [
    '/purchase-request',
  ],
  
  [ROLES.SUPPLIER]: [
    '/admin/dashboard',
    '/admin/suppliers',
    '/admin/purchasing',
  ],
  
  [ROLES.CLIENT]: [
    '/admin/dashboard',
    '/admin/reports',
  ],
  
  [ROLES.SUPER_ADMIN]: [
    '/admin/*',
  ],
};

/* ─── Roles allowed to use the internal Cost Calculator tool + its reports log ─── */
export const COST_TOOL_ROLES = [
  ROLES.PROJECT_MANAGER,
  ROLES.COMPANY_MANAGER,
  ROLES.SUPER_ADMIN,
  ROLES.ENGINEERING_MANAGER,
  ROLES.SITE_ENGINEER,
  ROLES.PROCUREMENT_MANAGER,
];

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
