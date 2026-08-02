"use client";

import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { BarChart3, MessageCircle, FileText, Bell, Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

/* ─── Translations ─────────────────────────────────────────── */
const C = {
  ar: {
    badge: "تطبيق الجوال الرسمي",
    title1: "حمّل تطبيق",
    title2: "MNC",
    desc: "تابع مشاريعك، تواصل مع فريقنا الهندسي، واستعرض وثائقك في أي وقت ومن أي مكان.",
    soon: "قريباً",
    stat1n: "١٢+", stat1l: "مشروع نشط",
    stat2n: "٥٠٠+", stat2l: "عميل راضٍ",
    stat3n: "١٥+", stat3l: "سنة خبرة",
    featuresBadge: "لماذا التطبيق؟",
    featuresTitle: "كل شيء في جيبك",
    features: [
      { icon: BarChart3,     title: "متابعة المشاريع",  desc: "تتبّع نسب الإنجاز لحظةً بلحظة مع تقارير مرئية دقيقة وتحديثات آنية." },
      { icon: MessageCircle, title: "التواصل المباشر",  desc: "تحدّث مع فريق MNC الهندسي مباشرةً في أي وقت دون انتظار." },
      { icon: FileText,      title: "عرض المستندات",    desc: "استعرض العقود والمخططات الهندسية والتقارير من هاتفك فوراً." },
      { icon: Bell,          title: "إشعارات فورية",    desc: "احصل على تنبيهات آنية لكل تحديث أو تغيير في مشروعك." },
    ],
    ctaBadge: "ابدأ الآن",
    ctaTitle: "جاهز لتجربة تطبيق MNC؟",
    ctaDesc: "حمّل التطبيق الآن وابدأ إدارة مشاريعك بأسلوب احترافي جديد.",
    ratingLabel: "٤.٩ تقييم التطبيق",
  },
  en: {
    badge: "Official Mobile App",
    title1: "Download",
    title2: "MNC App",
    desc: "Track your projects, communicate with our engineering team, and access documents anytime, anywhere.",
    soon: "Coming Soon",
    stat1n: "12+", stat1l: "Active Projects",
    stat2n: "500+", stat2l: "Happy Clients",
    stat3n: "38+", stat3l: "Years of Experience",
    featuresBadge: "Why the App?",
    featuresTitle: "Everything in Your Pocket",
    features: [
      { icon: BarChart3,     title: "Project Tracking",      desc: "Monitor your project progress in real-time with precise visual reports." },
      { icon: MessageCircle, title: "Direct Communication",  desc: "Talk directly with the MNC engineering team anytime without waiting." },
      { icon: FileText,      title: "Document Viewer",       desc: "Access contracts, blueprints, and reports instantly from your phone." },
      { icon: Bell,          title: "Instant Notifications", desc: "Get real-time alerts for every update or change in your project." },
    ],
    ctaBadge: "Get Started",
    ctaTitle: "Ready to experience MNC App?",
    ctaDesc: "Download the app now and start managing your projects in a new professional way.",
    ratingLabel: "4.9 App Rating",
  },
  hi: {
    badge: "आधिकारिक मोबाइल ऐप",
    title1: "डाउनलोड करें",
    title2: "MNC ऐप",
    desc: "अपनी परियोजनाओं को ट्रैक करें, हमारी इंजीनियरिंग टीम से संवाद करें और कभी भी, कहीं भी दस्तावेज़ एक्सेस करें।",
    soon: "शीघ्र उपलब्ध",
    stat1n: "12+", stat1l: "सक्रिय परियोजनाएं",
    stat2n: "500+", stat2l: "संतुष्ट ग्राहक",
    stat3n: "38+", stat3l: "वर्षों का अनुभव",
    featuresBadge: "ऐप क्यों?",
    featuresTitle: "आपकी जेब में सब कुछ",
    features: [
      { icon: BarChart3,     title: "परियोजना ट्रैकिंग",  desc: "सटीक दृश्य रिपोर्ट और रीयल-टाइम अपडेट के साथ अपनी परियोजना की प्रगति की निगरानी करें।" },
      { icon: MessageCircle, title: "प्रत्यक्ष संचार",      desc: "बिना प्रतीक्षा किए किसी भी समय सीधे MNC इंजीनियरिंग टीम से बात करें।" },
      { icon: FileText,      title: "दस्तावेज़ दर्शक",    desc: "अपने फ़ोन से तुरंत अनुबंध, ब्लूप्रिंट और रिपोर्ट एक्सेस करें।" },
      { icon: Bell,          title: "तत्काल सूचनाएं",    desc: "अपनी परियोजना में हर अपडेट या बदलाव के लिए रीयल-टाइम अलर्ट प्राप्त करें।" },
    ],
    ctaBadge: "अभी शुरू करें",
    ctaTitle: "MNC ऐप का अनुभव करने के लिए तैयार हैं?",
    ctaDesc: "अभी ऐप डाउनलोड करें और एक नए पेशेवर तरीके से अपनी परियोजनाओं का प्रबंधन शुरू करें।",
    ratingLabel: "4.9 ऐप रेटिंग",
  },
  ru: {
    badge: "Официальное мобильное приложение",
    title1: "Скачать",
    title2: "Приложение MNC",
    desc: "Отслеживайте свои проекты, общайтесь с нашей инженерной командой и получайте доступ к документам в любое время и в любом месте.",
    soon: "Скоро",
    stat1n: "12+", stat1l: "Активных проектов",
    stat2n: "500+", stat2l: "Довольных клиентов",
    stat3n: "38+", stat3l: "Лет опыта",
    featuresBadge: "Почему приложение?",
    featuresTitle: "Всё в вашем кармане",
    features: [
      { icon: BarChart3,     title: "Отслеживание проектов", desc: "Мониторинг прогресса проектов в реальном времени с точными отчетами." },
      { icon: MessageCircle, title: "Прямая связь",          desc: "Общайтесь напрямую с инженерной командой MNC в любое время." },
      { icon: FileText,      title: "Просмотр документов",   desc: "Доступ к контрактам, чертежам и отчетам со своего телефона." },
      { icon: Bell,          title: "Мгновенные уведомления", desc: "Получайте оповещения о каждом обновлении или изменении в вашем проекте." },
    ],
    ctaBadge: "Начать сейчас",
    ctaTitle: "Готовы опробовать приложение MNC?",
    ctaDesc: "Скачайте приложение прямо сейчас и начните управлять своими проектами по-новому.",
    ratingLabel: "4.9 Рейтинг приложения",
  },
  de: {
    badge: "Offizielle Mobile App",
    title1: "Herunterladen",
    title2: "MNC App",
    desc: "Verfolgen Sie Ihre Projekte, kommunizieren Sie mit unserem Ingenieurteam und greifen Sie jederzeit auf Dokumente zu.",
    soon: "Demnächst",
    stat1n: "12+", stat1l: "Aktive Projekte",
    stat2n: "500+", stat2l: "Zufriedene Kunden",
    stat3n: "38+", stat3l: "Jahre Erfahrung",
    featuresBadge: "Warum die App?",
    featuresTitle: "Alles in Ihrer Tasche",
    features: [
      { icon: BarChart3,     title: "Projektverfolgung",      desc: "Überwachen Sie den Projektfortschritt in Echtzeit mit präzisen Berichten." },
      { icon: MessageCircle, title: "Direkte Kommunikation",  desc: "Sprechen Sie jederzeit ohne Wartezeit direkt mit dem MNC-Ingenieurteam." },
      { icon: FileText,      title: "Dokumentenanzeige",      desc: "Greifen Sie sofort von Ihrem Telefon auf Verträge und Baupläne zu." },
      { icon: Bell,          title: "Sofortbenachrichtigungen", desc: "Erhalten Sie Echtzeit-Benachrichtigungen für jedes Update." },
    ],
    ctaBadge: "Jetzt starten",
    ctaTitle: "Bereit für die MNC App?",
    ctaDesc: "Laden Sie die App jetzt herunter und verwalten Sie Ihre Projekte auf neue, professionelle Weise.",
    ratingLabel: "4.9 App-Bewertung",
  },
  fr: {
    badge: "Application Mobile Officielle",
    title1: "Télécharger",
    title2: "l'App MNC",
    desc: "Suivez vos projets, communiquez avec notre équipe d'ingénieurs et accédez aux documents à tout moment.",
    soon: "Bientôt disponible",
    stat1n: "12+", stat1l: "Projets Actifs",
    stat2n: "500+", stat2l: "Clients Satisfaits",
    stat3n: "38+", stat3l: "Ans d'Expérience",
    featuresBadge: "Pourquoi l'App ?",
    featuresTitle: "Tout dans votre poche",
    features: [
      { icon: BarChart3,     title: "Suivi de Projet",        desc: "Suivez l'avancement de votre projet en temps réel avec des rapports précis." },
      { icon: MessageCircle, title: "Communication Directe",  desc: "Parlez directement avec l'équipe d'ingénieurs MNC à tout moment." },
      { icon: FileText,      title: "Lecteur de Documents",   desc: "Accédez instantanément aux contrats et plans depuis votre téléphone." },
      { icon: Bell,          title: "Notifications Instantanées", desc: "Recevez des alertes en temps réel pour chaque mise à jour." },
    ],
    ctaBadge: "Commencer",
    ctaTitle: "Prêt à essayer l'App MNC ?",
    ctaDesc: "Téléchargez l'application dès maintenant et gérez vos projets de manière professionnelle.",
    ratingLabel: "4.9 Note de l'App",
  },
  es: {
    badge: "Aplicación Móvil Oficial",
    title1: "Descargar",
    title2: "App MNC",
    desc: "Siga sus proyectos, comuníquese con nuestro equipo de ingeniería y acceda a documentos en cualquier momento.",
    soon: "Próximamente",
    stat1n: "12+", stat1l: "Proyectos Activos",
    stat2n: "500+", stat2l: "Clientes Satisfechos",
    stat3n: "38+", stat3l: "Años de Experiencia",
    featuresBadge: "¿Por qué la App?",
    featuresTitle: "Todo en su bolsillo",
    features: [
      { icon: BarChart3,     title: "Seguimiento de Proyectos", desc: "Supervise el progreso de su proyecto en tiempo real con informes precisos." },
      { icon: MessageCircle, title: "Comunicación Directa",     desc: "Hable directamente con el equipo de ingeniería de MNC en cualquier momento." },
      { icon: FileText,      title: "Visor de Documentos",      desc: "Acceda a contratos y planos al instante desde su teléfono." },
      { icon: Bell,          title: "Notificaciones Instantáneas", desc: "Reciba alertas en tiempo real de cada actualización." },
    ],
    ctaBadge: "Empezar",
    ctaTitle: "¿Listo para probar la App MNC?",
    ctaDesc: "Descargue la aplicación ahora y comience a gestionar sus proyectos de forma profesional.",
    ratingLabel: "4.9 Calificación de la App",
  },
  tr: {
    badge: "Resmi Mobil Uygulama",
    title1: "İndir",
    title2: "MNC Uygulaması",
    desc: "Projelerinizi takip edin, mühendislik ekibimizle iletişim kurun ve belgelere her yerden erişin.",
    soon: "Yakında",
    stat1n: "12+", stat1l: "Aktif Proje",
    stat2n: "500+", stat2l: "Mutlu Müşteri",
    stat3n: "38+", stat3l: "Yıllık Deneyim",
    featuresBadge: "Neden Uygulama?",
    featuresTitle: "Her Şey Cebinizde",
    features: [
      { icon: BarChart3,     title: "Proje Takibi",          desc: "Hassas görsel raporlarla proje ilerlemenizi gerçek zamanlı izleyin." },
      { icon: MessageCircle, title: "Doğrudan İletişim",     desc: "MNC mühendislik ekibiyle beklemeden doğrudan konuşun." },
      { icon: FileText,      title: "Belge Görüntüleyici",   desc: "Sözleşmelere ve planlara telefonunuzdan anında erişin." },
      { icon: Bell,          title: "Anlık Bildirimler",     desc: "Projenizdeki her güncelleme için anlık bildirimler alın." },
    ],
    ctaBadge: "Şimdi Başlayın",
    ctaTitle: "MNC Uygulamasını denemeye hazır mısınız?",
    ctaDesc: "Uygulamayı hemen indirin ve projelerinizi yeni profesyonel bir yöntemle yönetin.",
    ratingLabel: "4.9 Uygulama Puanı",
  },
  ur: {
    badge: "آفیشل موبائل ایپ",
    title1: "ڈاؤن لوڈ کریں",
    title2: "MNC ایپ",
    desc: "اپنے منصوبوں کو ٹریک کریں، ہماری انجینئرنگ ٹیم سے رابطہ کریں اور دستاویزات تک رسائی حاصل کریں۔",
    soon: "عنقریب",
    stat1n: "۱۲+", stat1l: "فعال منصوبے",
    stat2n: "۵۰۰+", stat2l: "مطمئن گاہک",
    stat3n: "۳۸+", stat3l: "سال کا تجربہ",
    featuresBadge: "ایپ کیوں؟",
    featuresTitle: "سب کچھ آپ کی جیب میں",
    features: [
      { icon: BarChart3,     title: "منصوبے کی ٹریکنگ",   desc: "درست بصری رپورٹس کے ساتھ اپنے منصوبے کی پیشرفت کی نگرانی کریں۔" },
      { icon: MessageCircle, title: "براہ راست رابطہ",    desc: "بغیر انتظار کے کسی بھی وقت MNC انجینئرنگ ٹیم سے بات کریں۔" },
      { icon: FileText,      title: "دستاویزات کا نظارہ", desc: "اپنے فون سے معاہدوں اور نقشوں تک فوری رسائی حاصل کریں۔" },
      { icon: Bell,          title: "فوری اطلاعات",        desc: "اپنے منصوبے میں ہر اپ ڈیٹ کے لیے فوری الرٹس حاصل کریں۔" },
    ],
    ctaBadge: "ابھی شروع کریں",
    ctaTitle: "MNC ایپ کا تجربہ کرنے کے لیے تیار ہیں؟",
    ctaDesc: "ایپ ابھی ڈاؤن لوڈ کریں اور اپنے منصوبوں کا انتظام پیشہ ورانہ انداز میں کریں۔",
    ratingLabel: "۴.۹ ایپ ریٹنگ",
  },
  zh: {
    badge: "官方移动应用",
    title1: "下载",
    title2: "MNC 应用",
    desc: "随时随地跟踪您的项目，与我们的工程团队沟通并访问文档。",
    soon: "即将推出",
    stat1n: "12+", stat1l: "进行中项目",
    stat2n: "500+", stat2l: "满意客户",
    stat3n: "38+", stat3l: "年行业经验",
    featuresBadge: "为什么选择应用？",
    featuresTitle: "一切尽在口袋中",
    features: [
      { icon: BarChart3,     title: "项目跟踪",        desc: "通过精准的视觉报告实时监控您的项目进度。" },
      { icon: MessageCircle, title: "直接沟通",        desc: "随时与 MNC 工程团队直接交流，无需等待。" },
      { icon: FileText,      title: "文档查看",        desc: "从手机即时查看合同、图纸和报告。" },
      { icon: Bell,          title: "即时通知",        desc: "获取有关您项目每次更新的实时提醒。" },
    ],
    ctaBadge: "立即开始",
    ctaTitle: "准备好体验 MNC 应用了吗？",
    ctaDesc: "立即下载应用，以全新专业的方式管理您的项目。",
    ratingLabel: "4.9 应用评分",
  },
};

const FEAT_COLORS = ["#C9A34D", "#60a5fa", "#34d399", "#f472b6"];

/* ─── Apple Icon ──────────────────────────────────────────── */
function AppleIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

/* ─── Google Play Colorful Icon ────────────────────────────── */
function GooglePlayColorIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      {/* Left / top-left — Cyan */}
      <path d="M3 21.5V2.5L14.5 12Z" fill="#32BBFF" />
      {/* Bottom — Yellow/Orange */}
      <path d="M3 21.5L14.5 12L17.5 15L5.8 22Z" fill="#FFBC00" />
      {/* Top — Green */}
      <path d="M3 2.5L14.5 12L17.5 9L5.8 2Z" fill="#1BE874" />
      {/* Right tip — Red */}
      <path d="M17.5 9L14.5 12L17.5 15L21 13.1C21.9 12.6 21.9 11.4 21 10.9Z" fill="#FF4747" />
    </svg>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function AppPage() {
  const { lang, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { data: appCms } = useSiteContent('app');
  const isLightMode = theme === 'dark';
  const isAr = lang === "ar" || lang === "ur";
  const c = C[lang] || C.en;
  const ta = isRTL ? "text-right" : "text-left";

  const heroTitle = isAr ? (appCms?.hero_title_ar || c.title1) : (appCms?.hero_title_en || c.title1);
  const heroDesc  = isAr ? (appCms?.hero_desc_ar  || c.desc)   : (appCms?.hero_desc_en  || c.desc);

  const stats = [
    { n: appCms?.stat1_value ?? c.stat1n, l: isAr ? (appCms?.stat1_label_ar ?? c.stat1l) : (appCms?.stat1_label_en ?? c.stat1l) },
    { n: appCms?.stat2_value ?? c.stat2n, l: isAr ? (appCms?.stat2_label_ar ?? c.stat2l) : (appCms?.stat2_label_en ?? c.stat2l) },
    { n: appCms?.stat3_value ?? c.stat3n, l: isAr ? (appCms?.stat3_label_ar ?? c.stat3l) : (appCms?.stat3_label_en ?? c.stat3l) },
  ];

  const FEAT_ICONS = [BarChart3, MessageCircle, FileText, Bell];
  const features = [1, 2, 3, 4].map((n, i) => ({
    icon: FEAT_ICONS[i],
    title: isAr ? (appCms?.[`feat${n}_title_ar`] || c.features[i].title) : (appCms?.[`feat${n}_title_en`] || c.features[i].title),
    desc:  isAr ? (appCms?.[`feat${n}_desc_ar`]  || c.features[i].desc)  : (appCms?.[`feat${n}_desc_en`]  || c.features[i].desc),
  }));

  const appstoreUrl    = appCms?.appstore_url    || null;
  const googleplayUrl  = appCms?.googleplay_url  || null;

  return (
    <main className={`min-h-screen font-cairo ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#0D1B2A]'}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="image-hero relative min-h-screen flex items-start lg:items-center pt-20 lg:pt-28 pb-4 sm:pb-14 lg:pb-20 overflow-hidden">

        {/* ── Background image ── */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/asstes/hero-app.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          {/* Light overlay — let the image breathe */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(4,13,24,0.45) 0%,rgba(7,22,38,0.30) 50%,rgba(4,13,24,0.50) 100%)" }} />
          {/* Top border line */}
          <div className="absolute top-0 left-0 w-full h-[2px]"
            style={{ background: "linear-gradient(90deg,transparent,rgba(201,163,77,0.5),transparent)" }} />
        </div>

        <div className="relative container mx-auto px-6 max-w-7xl">
          {/* Two columns — image on left, text on right */}
          <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-10 lg:gap-12 xl:gap-20" style={{ direction: "ltr" }}>

            {/* ────────────────────────────────────────────────
                IMAGE COLUMN (LEFT)
            ──────────────────────────────────────────────── */}
            <div className="relative flex-shrink-0 flex items-center justify-center lg:justify-start order-2 lg:order-1 w-full sm:w-auto">

              {/* Background glow rings — hidden on mobile to prevent overflow */}
              <div className="absolute w-[420px] h-[420px] rounded-full border border-[#C9A34D]/8 pointer-events-none hidden sm:block" />
              <div className="absolute w-[320px] h-[320px] rounded-full border border-[#C9A34D]/12 pointer-events-none hidden sm:block" />
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at center, rgba(201,163,77,0.13) 0%, transparent 65%)" }} />

              {/* Floating card — top right */}
              <div className="absolute -top-6 -right-8 z-20 bg-[#0a1828]/90 border border-[#C9A34D]/25 rounded-2xl px-4 py-3 backdrop-blur-md shadow-2xl hidden sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C9A34D]/15 border border-[#C9A34D]/25 flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={14} className="text-[#C9A34D]" />
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">{isAr ? "٧٥٪ منجز" : "75% Done"}</div>
                    <div className="text-white/40 text-[10px]">{isAr ? "مشروع جدة" : "Jeddah Project"}</div>
                  </div>
                </div>
                <div className="mt-2.5 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-[#C9A34D] rounded-full" />
                </div>
              </div>

              {/* Floating card — bottom left */}
              <div className="absolute -bottom-4 -left-6 z-20 bg-[#0a1828]/90 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md shadow-2xl hidden sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Bell size={13} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">{isAr ? "إشعار جديد" : "New Notification"}</div>
                    <div className="text-white/40 text-[10px]">{isAr ? "تحديث المشروع" : "Project Update"}</div>
                  </div>
                </div>
              </div>

              {/* App screenshot — framed */}
              <div className="relative z-10">
                {/* Outer glow */}
                <div className="absolute inset-[-18px] rounded-[2.8rem] pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, rgba(201,163,77,0.18) 0%, transparent 70%)" }} />
                {/* Frame border */}
                <div
                  className="relative rounded-[1.6rem] sm:rounded-[2.4rem] p-[4px] sm:p-[5px]"
                  style={{
                    background: "linear-gradient(145deg,rgba(201,163,77,0.55) 0%,rgba(201,163,77,0.10) 40%,rgba(255,255,255,0.06) 60%,rgba(201,163,77,0.35) 100%)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,163,77,0.15) inset, 0 8px 32px rgba(201,163,77,0.12)",
                  }}
                >
                  {/* Inner container with rounded clip */}
                  <div className="rounded-[1.2rem] sm:rounded-[2rem] overflow-hidden"
                    style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.5) inset" }}>
                    <Image
                      src="/asstes/Appph.png"
                      alt="MNC App"
                      width={480}
                      height={500}
                      className="w-[150px] xs:w-[170px] sm:w-[300px] lg:w-[440px] xl:w-[480px] h-auto block"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────────────────────────────────────
                TEXT COLUMN (RIGHT)
            ──────────────────────────────────────────────── */}
            <div className={`flex-1 ${ta} order-1 lg:order-2`} dir={isRTL ? "rtl" : "ltr"}>

              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 border border-[#C9A34D]/35 bg-[#C9A34D]/8 backdrop-blur-sm rounded-full px-5 py-2 mb-3 sm:mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A34D] animate-pulse block" />
                <span className="text-[#C9A34D] text-[11px] font-bold tracking-[0.2em] uppercase">{c.badge}</span>
              </div>

              {/* Headline */}
              <h1 className="text-[1.75rem] xs:text-[2rem] sm:text-5xl lg:text-[4.5rem] xl:text-7xl font-black text-white leading-[1.06] mb-2 sm:mb-5">
                {heroTitle}
                <br />
                <span className="relative inline-block">
                  <span className="text-[#C9A34D]">{c.title2}</span>
                  <span
                    className="absolute left-0 -bottom-2 w-full h-[3px] rounded-full"
                    style={{ background: "linear-gradient(90deg,#C9A34D,rgba(201,163,77,0.2))" }}
                  />
                </span>
              </h1>

              {/* Description */}
              <p className="text-white/55 text-[0.82rem] sm:text-[1.05rem] leading-relaxed sm:max-w-[420px] mb-3 sm:mb-10">{heroDesc}</p>

              {/* ── Store Buttons ── */}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4 mb-3 sm:mb-10">
                {/* App Store */}
                {appstoreUrl ? (
                  <a href={appstoreUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 bg-black text-white px-6 sm:px-7 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 transition-all duration-300 hover:bg-[#111] hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_30px_rgba(0,0,0,0.5)] w-full sm:w-auto">
                    <AppleIcon size={26} />
                    <div className="text-start leading-none">
                      <div className="text-[9px] text-white/45 uppercase tracking-[0.15em] mb-0.5">Download on the</div>
                      <div className="text-[15px] font-black">App Store</div>
                    </div>
                  </a>
                ) : (
                  <button className="group flex items-center justify-center gap-3 bg-black text-white px-6 sm:px-7 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 transition-all duration-300 hover:bg-[#111] hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_30px_rgba(0,0,0,0.5)] w-full sm:w-auto">
                    <AppleIcon size={26} />
                    <div className="text-start leading-none">
                      <div className="text-[9px] text-white/45 uppercase tracking-[0.15em] mb-0.5">{c.soon}</div>
                      <div className="text-[15px] font-black">App Store</div>
                    </div>
                  </button>
                )}

                {/* Google Play */}
                {googleplayUrl ? (
                  <a href={googleplayUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 bg-[#1a1a1a] text-white px-6 sm:px-7 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 transition-all duration-300 hover:bg-[#222] hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_30px_rgba(0,0,0,0.5)] w-full sm:w-auto">
                    <GooglePlayColorIcon size={26} />
                    <div className="text-start leading-none">
                      <div className="text-[9px] text-white/45 uppercase tracking-[0.15em] mb-0.5">Get it on</div>
                      <div className="text-[15px] font-black">Google Play</div>
                    </div>
                  </a>
                ) : (
                  <button className="group flex items-center justify-center gap-3 bg-[#1a1a1a] text-white px-6 sm:px-7 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 transition-all duration-300 hover:bg-[#222] hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_30px_rgba(0,0,0,0.5)] w-full sm:w-auto">
                    <GooglePlayColorIcon size={26} />
                    <div className="text-start leading-none">
                      <div className="text-[9px] text-white/45 uppercase tracking-[0.15em] mb-0.5">{c.soon}</div>
                      <div className="text-[15px] font-black">Google Play</div>
                    </div>
                  </button>
                )}
              </div>

              {/* ── Stars + Rating ── */}
              <div className={`flex items-center gap-3 mb-2 sm:mb-12 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-[#C9A34D] fill-[#C9A34D]" />
                  ))}
                </div>
                <span className="text-white/40 text-xs sm:text-sm font-medium">{c.ratingLabel}</span>
              </div>

              {/* ── Stats row ── */}
              <div className={`flex flex-wrap gap-4 sm:gap-8 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                {stats.map((s, i) => (
                  <div key={i} className={`${ta}`}>
                    <div className="text-xl sm:text-2xl font-black text-white">{s.n}</div>
                    <div className="text-white/40 text-[10px] sm:text-xs mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section className={`py-16 sm:py-20 lg:py-28 relative overflow-hidden ${isLightMode ? 'bg-[#f0f4f8]' : ''}`}>
        {/* Separator line */}
        <div className="absolute top-0 left-0 w-full h-[1px]"
          style={{ background: "linear-gradient(90deg,transparent,rgba(201,163,77,0.2),transparent)" }} />
        {/* Background tint — dark mode only */}
        {!isLightMode && (
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(180deg,rgba(9,19,32,0.7) 0%,rgba(13,27,42,0) 100%)" }} />
        )}

        <div className="relative container mx-auto px-6 max-w-7xl">

          {/* Section header */}
          <div className={`${ta} mb-10 lg:mb-16`}>
            <div className="inline-flex items-center gap-2.5 border border-[#C9A34D]/25 bg-[#C9A34D]/6 rounded-full px-5 py-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A34D] animate-pulse block" />
              <span className="text-[#C9A34D] text-[11px] font-bold tracking-[0.2em] uppercase">{c.featuresBadge}</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black ${isLightMode ? 'text-[#1e293b]' : 'text-white'}`}>{c.featuresTitle}</h2>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              const color = FEAT_COLORS[i];
              return (
                <div
                  key={i}
                  className="group relative rounded-3xl p-5 sm:p-7 transition-all duration-500 hover:-translate-y-2 cursor-default"
                  style={isLightMode ? {
                    background: "#ffffff",
                    border: "1px solid rgba(15,23,42,0.08)",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                  } : {
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  data-aos="fade-up"
                  data-aos-delay={i * 80}
                >
                  {/* Hover glow overlay */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `linear-gradient(135deg,${color}0c,transparent 60%)`, border: `1px solid ${color}28` }}
                  />

                  {/* Number badge */}
                  <div className="absolute top-5 right-5 text-[10px] font-black opacity-15 group-hover:opacity-40 transition-opacity duration-300"
                    style={{ color }}>
                    0{i + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ width: 52, height: 52, background: `${color}12`, border: `1px solid ${color}28` }}
                  >
                    <Icon size={23} style={{ color }} />
                  </div>

                  <h3 className={`font-black text-[17px] mb-3 leading-snug ${ta} ${isLightMode ? 'text-[#1e293b]' : 'text-white'}`}>{feat.title}</h3>
                  <p className={`text-sm leading-relaxed ${ta} ${isLightMode ? 'text-slate-500' : 'text-white/42'}`}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DOWNLOAD CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="image-hero no-mobile-vh py-10 sm:py-20 lg:py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background: same style as cost-calculator hero — always dark in both modes */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0d1526] to-black" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #D5B25D 0%, transparent 60%), radial-gradient(circle at 70% 30%, #B8923A 0%, transparent 50%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D5B25D]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(to right, #D5B25D 1px, transparent 1px), linear-gradient(to bottom, #D5B25D 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-[#C9A34D]/10 border border-[#C9A34D]/25 rounded-full px-5 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A34D] animate-pulse block" />
            <span className="text-[#C9A34D] text-[11px] font-bold tracking-[0.2em] uppercase">{c.ctaBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-5 leading-tight text-white">{c.ctaTitle}</h2>
          <p className="text-base sm:text-lg max-w-lg mx-auto mb-10 sm:mb-14 leading-relaxed text-white/70">{c.ctaDesc}</p>

          {/* Buttons */}
          <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center">

            {/* App Store */}
            <button className="group flex items-center justify-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border bg-black border-white/10 hover:bg-[#111] shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] w-full xs:w-auto">
              <AppleIcon size={26} color="#ffffff" />
              <div className="text-start leading-none">
                <div className="text-[9px] uppercase tracking-[0.15em] mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.soon}</div>
                <div className="text-[15px] font-black" style={{ color: '#ffffff' }}>App Store</div>
              </div>
            </button>

            {/* Google Play */}
            <button className="group flex items-center justify-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border bg-[#1a1a1a] border-white/10 hover:bg-[#222] shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] w-full xs:w-auto">
              <GooglePlayColorIcon size={26} />
              <div className="text-start leading-none">
                <div className="text-[9px] uppercase tracking-[0.15em] mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.soon}</div>
                <div className="text-[15px] font-black" style={{ color: '#ffffff' }}>Google Play</div>
              </div>
            </button>

          </div>
        </div>
      </section>
    </main>
  );
}
