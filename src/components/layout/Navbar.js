"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, Sun, Moon, Calculator, Home, Info, Briefcase, FolderOpen, PhoneCall, Globe, Users, UserCircle, UserCog, LogOut, LayoutDashboard, Bell, Ruler, FileCheck, ClipboardList, Eye, Newspaper, Building2, Compass, FolderKanban, Sofa } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { HiDocumentText } from "react-icons/hi";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isSuperAdmin } = useAuth();

  // Fetch name from adminUsers collection for non-super-admin users
  const [adminProfile, setAdminProfile] = useState(null);
  useEffect(() => {
    if (!user || isSuperAdmin) { setAdminProfile(null); return; }
    const unsub = onSnapshot(doc(db, 'adminUsers', user.uid), snap => {
      setAdminProfile(snap.exists() ? snap.data() : null);
    });
    return unsub;
  }, [user, isSuperAdmin]);

  // Display name priority:
  // 1. adminUsers.name (from super admin's form)
  // 2. Firebase Auth displayName
  // 3. Fallback: "مدير الشركة"
  const adminDisplayName = isSuperAdmin
    ? 'SUPER ADMIN'
    : (adminProfile?.name || user?.displayName || t('admin.managerTitle'));

  const adminJobTitle = isSuperAdmin
    ? 'SUPER ADMIN'
    : (adminProfile?.jobTitle || t('admin.managerTitle'));

  const portalTooltips = {
    ar: "بوابة الموظفين",
    en: "Staff Portal",
    es: "Portal del personal",
    fr: "Portail du personnel",
    de: "Mitarbeiterportal",
    tr: "Personel Portalı",
    ur: "اسٹاف پورٹل",
    zh: "员工门户",
    ru: "Портал сотрудников"
  };
  const portalTooltipText = portalTooltips[lang] || portalTooltips['en'];

  const handlePortalClick = () => {
    if (!user) {
      router.push('/admin/login');
    } else {
      router.push('/admin/dashboard');
    }
  };
  const notif = useNotifications();
  const { allNotifications = [], unreadCount = 0, markBellOpened } = notif ?? {};
  const isLightMode = theme === 'dark';
  const isAdmin = user !== null && user !== undefined;
  const isAdminPage = pathname.startsWith('/admin');
  const langDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);
  const bellDropdownRef = useRef(null);
  const moreDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target)) {
        setIsAdminOpen(false);
      }
      if (bellDropdownRef.current && !bellDropdownRef.current.contains(e.target)) {
        setIsBellOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoTap = (e) => {
    if (window.innerWidth >= 1024) return; // desktop: use Ctrl+Shift+A instead
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    if (logoTapCount.current >= 3) {
      e.preventDefault();
      logoTapCount.current = 0;
      router.push('/admin/login');
      return;
    }
    logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 2000);
  };

  const handleAdminLogout = async () => {
    setIsAdminOpen(false);
    setIsOpen(false);
    await logout();
    router.replace('/admin/login');
  };

  const navLinks = [
    { name: t('nav.home'),     href: "/",                icon: Home },
    { name: t('nav.about'),    href: "/us",              icon: Info },
    { name: t('nav.services'), href: "/#services",       icon: Briefcase, isServicesDropdown: true },
    { name: t('nav.engineeringDesign'), href: "/engineering-design", icon: Ruler },
    { name: t('nav.projects'), href: "/projects",        icon: FolderOpen },
    { name: t('nav.careers'), href: "/careers",          icon: Users },
    { name: t('nav.contact'), href: "/contact",          icon: PhoneCall },
    { name: t('nav.buildingPermits'),    href: "/building-permits",    icon: FileCheck,     isSecondary: true },
    { name: t('nav.engineeringReports'), href: "/engineering-reports", icon: ClipboardList, isSecondary: true },
    { name: t('nav.siteSupervision'),    href: "/site-supervision",    icon: Eye,           isSecondary: true },
    { name: t('nav.blog'),    href: "/blog",            icon: Newspaper,          isSecondary: true },
  ];

  /* ── Engineering Services dropdown items — the 4 core service pages,
       same slugs/labels as the homepage services teaser. ── */
  const servicesList = [
    { name: t('servicesSection.items.construction.title'), href: "/services/contracting",         icon: Building2 },
    { name: t('servicesSection.items.architecture.title'), href: "/services/architectural-design", icon: Compass },
    { name: t('servicesSection.items.management.title'),   href: "/services/project-management",  icon: FolderKanban },
    { name: t('servicesSection.items.interior.title'),     href: "/services/interior-design",      icon: Sofa },
  ];

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const portfolioTranslations = {
    ar: { ar: 'النسخة العربية',  en: 'النسخة الإنجليزية' },
    en: { ar: 'Arabic Version',  en: 'English Version' },
    zh: { ar: '阿拉伯语版本',     en: '英语版本' },
    es: { ar: 'Versión árabe',   en: 'Versión inglesa' },
    fr: { ar: 'Version arabe',   en: 'Version anglaise' },
    de: { ar: 'Arabische Version', en: 'Englische Version' },
    tr: { ar: 'Arapça Sürümü',  en: 'İngilizce Sürümü' },
    ur: { ar: 'عربی ورژن',       en: 'انگریزی ورژن' },
  };
  const tPortfolio = portfolioTranslations[lang] || portfolioTranslations['en'];

  return (
    <>
      {/* ═══ MAIN NAVBAR ═══ */}
      <nav className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
        scrolled
          ? isLightMode
            ? "bg-white/97 border-b border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
            : "border-b"
          : isLightMode
            ? "bg-white/80 border-b border-slate-100/70"
            : "border-b"
      }`}
      style={isLightMode ? undefined : scrolled ? {
        backgroundColor: 'rgba(80, 86, 92, 0.96)',
        boxShadow: '0 10px 35px rgba(0,0,0,.28)',
        borderBottomColor: 'rgba(242,178,51,.18)',
        transition: 'background-color .35s ease, box-shadow .35s ease, border-color .35s ease',
      } : {
        backgroundColor: 'rgba(40, 44, 48, 0.72)',
        borderBottomColor: 'rgba(255,255,255,.08)',
        transition: 'background-color .35s ease, box-shadow .35s ease, border-color .35s ease',
      }}>
        <div className="w-full max-w-7xl lg:max-w-[1440px] mx-auto flex items-center lg:grid lg:grid-cols-[minmax(150px,auto)_1fr_auto] nav-container-responsive px-4 sm:px-6 md:px-8 lg:px-[40px] py-3 sm:py-3.5 lg:py-0 lg:h-[92px]">

          {/* ── Zone 1 — Logo ── */}
          <div className="flex items-center lg:justify-center flex-shrink-0 nav-logo-responsive lg:pe-6">
            <Link href="/" onClick={handleLogoTap} className="flex items-center flex-shrink-0">
              <Image
                src="/brand/logo-navbar-real.png"
                alt="MAN Engineering Consultancy"
                width={1029}
                height={461}
                unoptimized
                className="h-11 sm:h-12 lg:h-11 xl:h-12 w-auto object-contain transition-all duration-500"
                priority
              />
            </Link>
          </div>

          {/* ── Zone 2 — Center Nav, perfectly centered ── */}
          <div className="hidden lg:flex items-center lg:justify-center gap-4">
            <nav className="flex items-center gap-4" aria-label={t('nav.ariaLabel')}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                if (link.isSpecial) {
                  return (
                    <Link key={link.name} href={link.href}
                      className={`flex items-center gap-1.5 text-[12px] xl:text-[13.5px] font-extrabold px-3.5 xl:px-4 py-[7px] xl:py-2 mx-1 xl:mx-1.5 rounded-full border transition-all duration-300 whitespace-nowrap nav-link-special-responsive ${
                        isActive
                          ? "bg-[#F2B233] text-black border-transparent shadow-[0_4px_20px_rgba(242,178,51,0.45)]"
                          : "bg-[#F2B233]/[0.07] text-[#F2B233] border-[#F2B233]/28 hover:bg-[#F2B233]/[0.13] hover:border-[#F2B233]/45 hover:shadow-[0_2px_14px_rgba(242,178,51,0.13)]"
                      }`}>
                      <Calculator size={11} />
                      <span>{link.name}</span>
                    </Link>
                  );
                }

                if (link.isServicesDropdown) {
                  const isServicesActive = servicesList.some(s => pathname === s.href);
                  return (
                    <div key={link.name} className="relative" ref={servicesDropdownRef}>
                      <button
                        onClick={() => setIsServicesOpen(v => !v)}
                        className={`relative flex items-center gap-1 text-[19px] py-2.5 transition-colors duration-200 whitespace-nowrap font-semibold tracking-[0.018em] nav-link-responsive ${
                          isServicesActive
                            ? "text-[#F2B233]"
                            : isLightMode
                              ? "text-slate-500 hover:text-[#F2B233]"
                              : "text-white hover:text-[#F2B233]"
                        }`}
                      >
                        {link.name}
                        <ChevronDown size={13} className={`transition-transform duration-300 ${isServicesOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`absolute top-[calc(100%+10px)] ${isRTL ? 'right-0' : 'left-0'} w-[240px] rounded-2xl overflow-hidden z-50 transition-all duration-250 ${
                        isServicesOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                      }`}
                        style={{ background: isLightMode ? '#ffffff' : '#5F6368', border: `1px solid ${isLightMode ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.14)'}`, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
                      >
                        {servicesList.map(svc => {
                          const isSvcActive = pathname === svc.href;
                          return (
                            <Link
                              key={svc.href}
                              href={svc.href}
                              onClick={() => setIsServicesOpen(false)}
                              className={`flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold transition-colors ${
                                isSvcActive
                                  ? "text-[#F2B233]"
                                  : isLightMode
                                    ? "text-slate-600 hover:bg-slate-50 hover:text-[#F2B233]"
                                    : "text-white hover:bg-white/[0.08] hover:text-[#F2B233]"
                              }`}
                            >
                              <svc.icon size={14} className="shrink-0" />
                              {svc.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link key={link.name} href={link.href}
                    className={`relative text-[19px] py-2.5 transition-colors duration-200 whitespace-nowrap group font-semibold tracking-[0.018em] nav-link-responsive ${
                      isActive
                        ? "text-[#F2B233]"
                        : isLightMode
                          ? "text-slate-500 hover:text-[#F2B233]"
                          : "text-white hover:text-[#F2B233]"
                    } ${link.isSecondary ? "hidden min-[1650px]:inline-flex" : ""}`}>
                    {link.name}
                    {/* Underline indicator */}
                    <span className={`absolute bottom-[5px] left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-5 opacity-100 bg-gradient-to-r from-transparent via-[#F2B233] to-transparent'
                        : 'w-0 opacity-0 group-hover:w-3 group-hover:opacity-30 bg-[#F2B233]'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            {/* ── "More" dropdown — holds the secondary links below the 1650px
                 breakpoint where they'd otherwise vanish with no way to reach
                 them (e.g. Careers, Blog, the 4 engineering sub-pages). ── */}
            <div className="relative min-[1650px]:hidden" ref={moreDropdownRef}>
              <button
                onClick={() => setIsMoreOpen(v => !v)}
                className={`relative flex items-center gap-1 text-[19px] py-2.5 transition-colors duration-200 whitespace-nowrap font-semibold tracking-[0.018em] nav-link-responsive ${
                  isLightMode ? "text-slate-500 hover:text-[#F2B233]" : "text-white hover:text-[#F2B233]"
                }`}
              >
                {t('nav.more')}
                <ChevronDown size={13} className={`transition-transform duration-300 ${isMoreOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-[calc(100%+10px)] ${isRTL ? 'left-0' : 'right-0'} w-[220px] rounded-2xl overflow-hidden z-50 transition-all duration-250 ${
                isMoreOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
                style={{ background: isLightMode ? '#ffffff' : '#5F6368', border: `1px solid ${isLightMode ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.14)'}`, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
              >
                {navLinks.filter(l => l.isSecondary).map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold transition-colors ${
                        isActive
                          ? "text-[#F2B233]"
                          : isLightMode
                            ? "text-slate-600 hover:bg-slate-50 hover:text-[#F2B233]"
                            : "text-white hover:bg-white/[0.08] hover:text-[#F2B233]"
                      }`}
                    >
                      <link.icon size={14} className="shrink-0" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Zone 3 — Admin Controls ── */}
          <div className="hidden lg:flex items-center lg:justify-center lg:ps-4 nav-actions-responsive gap-2 flex-shrink-0">

            {/* ── ADMIN MODE ── */}
            {isAdmin ? (
              <>
                {/* Language Selector — stays visible */}
                <div className="relative" ref={langDropdownRef}>
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 xl:py-2 rounded-lg border border-[#F2B233]/22 hover:border-[#F2B233]/42 hover:bg-[#F2B233]/7 transition-all duration-300 nav-action-btn-responsive ${isLightMode ? 'text-slate-600' : 'text-white/65 hover:text-white'}`}
                  >
                    <span className="text-base leading-none">{currentLang.flag}</span>
                    <span className="text-[11px] font-bold tracking-widest uppercase">{currentLang.code.toUpperCase()}</span>
                    <Globe size={12} className="text-[#F2B233]/45" />
                  </button>
                  <div className={`absolute top-[calc(100%+10px)] ${isRTL ? 'left-0' : 'right-0'} w-[262px] bg-white border border-[#F2B233]/12 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isLangOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"
                  }`}>
                    <div className="p-3">
                      <p className="text-[9px] text-slate-400 font-medium tracking-[2.5px] uppercase mb-2.5 px-1">
                        {lang === 'ar' || lang === 'ur' ? 'اختر اللغة' : 'Select Language'}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {LANGUAGES.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => { setLang(language.code); setIsLangOpen(false); }}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-all duration-200 text-start ${
                              lang === language.code
                                ? "bg-[#F2B233]/10 border border-[#F2B233]/22 text-[#F2B233]"
                                : "hover:bg-slate-50 border border-transparent text-slate-500 hover:text-[#1F2937]"
                            }`}
                          >
                            <span className="text-xl leading-none">{language.flag}</span>
                            <div>
                              <p className="text-[11.5px] font-bold leading-tight">{language.nativeName}</p>
                              <p className="text-[9px] opacity-40 uppercase tracking-wide">{language.dir.toUpperCase()}</p>
                            </div>
                            {lang === language.code && (
                              <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#F2B233] flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bell Notifications — admin pages only */}
                {isAdminPage && notif && (
                  <div className="relative" ref={bellDropdownRef}>
                    <button
                      onClick={() => {
                        const opening = !isBellOpen;
                        setIsBellOpen(opening);
                        if (opening && markBellOpened) markBellOpened();
                      }}
                      className="relative flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-lg border border-[#F2B233]/22 text-[#F2B233]/70 hover:text-[#F2B233] hover:bg-[#F2B233]/10 hover:border-[#F2B233]/40 transition-all duration-300 active:scale-95 nav-action-icon-btn-responsive"
                    >
                      <Bell size={15} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -end-1.5 min-w-[17px] h-[17px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none shadow-lg shadow-red-500/40">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Bell dropdown */}
                    <div
                      className={`absolute top-[calc(100%+10px)] ${isRTL ? 'left-0' : 'right-0'} w-[300px] rounded-2xl overflow-hidden z-50 transition-all duration-250 ${
                        isBellOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                      style={{ background: '#5F6368', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
                        <p className="text-white text-xs font-bold">{t('admin.notifications')}</p>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 rounded-full px-2 py-0.5">
                            {unreadCount} {t('admin.newBadge')}
                          </span>
                        )}
                      </div>
                      <div className="max-h-[340px] overflow-y-auto divide-y divide-white/[0.08]">
                        {allNotifications.length === 0 ? (
                          <div className="text-center py-8">
                            <Bell size={20} className="text-white/15 mx-auto mb-2" />
                            <p className="text-white/40 text-xs">{t('admin.noNotifications')}</p>
                          </div>
                        ) : allNotifications.map(n => (
                          <Link
                            key={n.id}
                            href="/admin/jobs"
                            onClick={() => setIsBellOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#F2B233]/12 border border-[#F2B233]/25">
                              <Briefcase size={12} className="text-[#F2B233]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-semibold truncate">
                                {n.fullName}
                              </p>
                              <p className="text-white/40 text-[11px] mt-0.5 truncate">
                                {t('admin.jobReqLabel')} · {n.position || ''}
                              </p>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F2B233]/60 shrink-0 mt-1.5" />
                          </Link>
                        ))}
                      </div>
                      {allNotifications.length > 0 && (
                        <div className="border-t border-slate-100 px-4 py-2.5">
                          <Link href="/admin/jobs" onClick={() => setIsBellOpen(false)}
                            className="block text-center text-[11px] text-[#F2B233]/70 hover:text-[#F2B233] transition-colors font-semibold">
                            {t('admin.jobsMenu')}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Portfolio icon — only when browsing site pages (not /admin/*) */}
                {!isAdminPage && (
                  <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1.5 group">
                      <span className="flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 border border-[#F2B233]/22 text-[#F2B233] rounded-lg transition-all duration-300 group-hover:bg-[#F2B233]/10 group-hover:border-[#F2B233]/40 active:scale-95 nav-action-icon-btn-responsive">
                        <HiDocumentText size={17} />
                      </span>
                      <span className="bg-[#F2B233] text-black px-3 xl:px-4 py-[7px] xl:py-2 rounded-lg font-bold text-[12.5px] xl:text-[13.5px] shadow-[0_2px_12px_rgba(242,178,51,0.25)] transition-all duration-300 hover:bg-[#F6C55C] hover:shadow-[0_4px_20px_rgba(242,178,51,0.35)] active:scale-95 flex items-center gap-1.5 whitespace-nowrap nav-action-btn-responsive">
                        {t('nav.profile')}
                        <ChevronDown size={11} className={`transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                      </span>
                    </button>
                    <div className={`absolute top-[calc(100%+10px)] ${isRTL ? 'left-0' : 'right-0'} w-[178px] bg-white border border-[#F2B233]/14 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                      isProfileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}>
                      <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#F2B233] hover:bg-[#F2B233]/8 transition-colors"
                        onClick={() => setIsProfileOpen(false)}>
                        {tPortfolio.ar}
                      </a>
                      <div className="h-px bg-slate-100 mx-3" />
                      <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#F2B233] hover:bg-[#F2B233]/8 transition-colors"
                        onClick={() => setIsProfileOpen(false)}>
                        {tPortfolio.en}
                      </a>
                    </div>
                  </div>
                )}

                {/* Staff Portal Icon */}
                <div className="relative group flex items-center justify-center">
                  <button
                    id="staff-portal-btn-admin"
                    onClick={handlePortalClick}
                    className="flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-lg border border-[#F2B233]/22 text-[#F2B233]/70 hover:text-[#F2B233] hover:bg-[#F2B233]/10 hover:border-[#F2B233]/40 transition-all duration-300 active:scale-95 nav-action-icon-btn-responsive"
                  >
                    <Briefcase size={15} />
                  </button>
                  <div className={`absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 whitespace-nowrap bg-white/95 border border-[#F2B233]/30 text-[#F2B233] text-[10.5px] font-black py-1.5 px-3 rounded-lg shadow-lg`}>
                    {portalTooltipText}
                  </div>
                </div>

                {/* Admin user dropdown */}
                <div className="relative" ref={adminDropdownRef}>
                  <button
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    className="flex items-center gap-1.5 px-2.5 xl:px-3 py-2 xl:py-2 rounded-lg border border-[#F2B233]/30 hover:border-[#F2B233]/50 hover:bg-[#F2B233]/8 transition-all duration-300 active:scale-95 nav-action-btn-responsive"
                  >
                    <UserCog size={14} className="text-[#F2B233] flex-shrink-0" />
                    <span className="text-[12.5px] xl:text-[13px] font-bold text-[#F2B233] whitespace-nowrap">
                      {adminDisplayName}
                    </span>
                    <ChevronDown size={10} className={`text-[#F2B233]/50 transition-transform duration-300 ${isAdminOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`absolute top-[calc(100%+10px)] ${isRTL ? 'left-0' : 'right-0'} w-[185px] bg-white border border-[#F2B233]/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isAdminOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsAdminOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-[12px] font-bold text-slate-600 hover:text-[#1F2937] hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard size={13} className="text-[#F2B233] flex-shrink-0" />
                      {t('admin.dashboard')}
                    </Link>
                    <div className="h-px bg-slate-100 mx-3" />
                    <button
                      onClick={handleAdminLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-[12px] font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut size={13} className="flex-shrink-0" />
                      {t('admin.logout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── NORMAL MODE ── */}

                {/* Profile / Portfolio Dropdown */}
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-1.5 group">
                    <span className="flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 border border-[#F2B233]/22 text-[#F2B233] rounded-lg transition-all duration-300 group-hover:bg-[#F2B233]/10 group-hover:border-[#F2B233]/40 active:scale-95 nav-action-icon-btn-responsive">
                      <HiDocumentText size={16} />
                    </span>
                    <span className="bg-[#F2B233] text-black px-3 xl:px-3.5 py-2 xl:py-2 rounded-lg font-bold text-[12.5px] xl:text-[13.5px] shadow-[0_2px_12px_rgba(242,178,51,0.25)] transition-all duration-300 hover:bg-[#F6C55C] hover:shadow-[0_4px_20px_rgba(242,178,51,0.35)] active:scale-95 flex items-center gap-1.5 whitespace-nowrap nav-action-btn-responsive">
                      {t('nav.profile')}
                      <ChevronDown size={11} className={`transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </span>
                  </button>

                  <div className={`absolute top-[calc(100%+10px)] ${isRTL ? 'left-0' : 'right-0'} w-[178px] bg-white border border-[#F2B233]/14 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isProfileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}>
                    <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#F2B233] hover:bg-[#F2B233]/8 transition-colors"
                      onClick={() => setIsProfileOpen(false)}>
                      {tPortfolio.ar}
                    </a>
                    <div className="h-px bg-slate-100 mx-3" />
                    <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#F2B233] hover:bg-[#F2B233]/8 transition-colors"
                      onClick={() => setIsProfileOpen(false)}>
                      {tPortfolio.en}
                    </a>
                  </div>
                </div>

                {/* Staff Portal Icon */}
                <div className="relative group flex items-center justify-center">
                  <button
                    id="staff-portal-btn"
                    onClick={handlePortalClick}
                    className="flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-lg border border-[#F2B233]/22 text-[#F2B233]/70 hover:text-[#F2B233] hover:bg-[#F2B233]/10 hover:border-[#F2B233]/40 transition-all duration-300 active:scale-95 nav-action-icon-btn-responsive"
                  >
                    <Briefcase size={15} />
                  </button>
                  <div className={`absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 whitespace-nowrap bg-white/95 border border-[#F2B233]/30 text-[#F2B233] text-[10.5px] font-black py-1.5 px-3 rounded-lg shadow-lg`}>
                    {portalTooltipText}
                  </div>
                </div>

                {/* Theme Toggle */}
                <button onClick={toggleTheme}
                  className="relative flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-lg border border-[#F2B233]/22 text-[#F2B233] hover:bg-[#F2B233]/10 hover:border-[#F2B233]/40 transition-all duration-300 overflow-hidden active:scale-95 nav-action-icon-btn-responsive">
                  <span className={`absolute transition-all duration-500 ${theme !== 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}><Sun size={15} /></span>
                  <span className={`absolute transition-all duration-500 ${theme !== 'dark' ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}><Moon size={15} /></span>
                </button>

                {/* Language Selector */}
                <div className="relative" ref={langDropdownRef}>
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 xl:py-2 rounded-lg border border-[#F2B233]/22 hover:border-[#F2B233]/42 hover:bg-[#F2B233]/7 transition-all duration-300 nav-action-btn-responsive ${isLightMode ? 'text-slate-600' : 'text-white/65 hover:text-white'}`}
                  >
                    <span className="text-base leading-none">{currentLang.flag}</span>
                    <span className="text-[11px] font-bold tracking-widest uppercase">{currentLang.code.toUpperCase()}</span>
                    <Globe size={12} className="text-[#F2B233]/45" />
                  </button>

                  <div className={`absolute top-[calc(100%+10px)] ${isRTL ? 'left-0' : 'right-0'} w-[262px] bg-white border border-[#F2B233]/12 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isLangOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"
                  }`}>
                    <div className="p-3">
                      <p className="text-[9px] text-slate-400 font-medium tracking-[2.5px] uppercase mb-2.5 px-1">
                        {lang === 'ar' || lang === 'ur' ? 'اختر اللغة' : 'Select Language'}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {LANGUAGES.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => { setLang(language.code); setIsLangOpen(false); }}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-all duration-200 text-start ${
                              lang === language.code
                                ? "bg-[#F2B233]/10 border border-[#F2B233]/22 text-[#F2B233]"
                                : "hover:bg-slate-50 border border-transparent text-slate-500 hover:text-[#1F2937]"
                            }`}
                          >
                            <span className="text-xl leading-none">{language.flag}</span>
                            <div>
                              <p className="text-[11.5px] font-bold leading-tight">{language.nativeName}</p>
                              <p className="text-[9px] opacity-40 uppercase tracking-wide">{language.dir.toUpperCase()}</p>
                            </div>
                            {lang === language.code && (
                              <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#F2B233] flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Mobile Header Actions ── */}
          <div className="flex items-center gap-2 lg:hidden ms-auto">
            {isAdmin ? null : (
              <button onClick={toggleTheme}
                className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-[#F2B233]/22 text-[#F2B233] hover:bg-[#F2B233]/10 transition-all duration-300 overflow-hidden">
                <span className={`absolute transition-all duration-500 ${theme !== 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}><Sun size={15} /></span>
                <span className={`absolute transition-all duration-500 ${theme !== 'dark' ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}><Moon size={15} /></span>
              </button>
            )}
            <button
              className={`p-2 rounded-lg border border-[#F2B233]/22 hover:bg-[#F2B233]/10 transition-colors ${isLightMode ? 'text-slate-700' : 'text-white/80'}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      {/* ═══ MOBILE OVERLAY ═══ */}
      <div
        className={`lg:hidden fixed inset-0 z-[110] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        onClick={() => setIsOpen(false)}
      />

      {/* ═══ MOBILE PANEL ═══ */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 w-full z-[120] transition-transform duration-500 ease-out ${isRTL ? 'right-0' : 'left-0'}`}
        style={{
          backgroundColor: isLightMode ? '#ffffff' : '#0a0a0a',
          boxShadow: isLightMode
            ? (isRTL ? '-4px 0 24px rgba(0,0,0,0.08)' : '4px 0 24px rgba(0,0,0,0.08)')
            : (isRTL ? '-6px 0 50px rgba(0,0,0,1)' : '6px 0 50px rgba(0,0,0,1)'),
          transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
        }}
      >
        <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: isLightMode ? '#ffffff' : '#0a0a0a' }}>

          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 pt-8 pb-4 flex-shrink-0" style={{ backgroundColor: isLightMode ? '#ffffff' : '#0a0a0a', borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}` }}>
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image src="/brand/logo-navbar-real.png" alt="MAN Engineering Consultancy" width={1029} height={461} unoptimized className="h-9 w-auto object-contain" priority />
            </Link>
            <button onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-[10px] border border-[#F2B233]/22 bg-[#F2B233]/5 flex items-center justify-center text-[#F2B233] hover:bg-[#F2B233]/12 transition-all active:scale-95">
              <X size={16} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="px-3.5 pt-4 flex-shrink-0" style={{ backgroundColor: isLightMode ? '#ffffff' : '#0a0a0a' }}>
            <p className={`text-[9px] font-medium tracking-[2.5px] uppercase px-1.5 mb-2 ${isLightMode ? 'text-slate-400' : 'text-white/20'}`}>
              {lang === 'ar' || lang === 'ur' ? 'القائمة' : 'Navigation'}
            </p>
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const LinkIcon = link.icon;
                if (link.isSpecial) {
                  return (
                    <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-[11px] px-3 rounded-[12px] border border-[#F2B233]/22 bg-gradient-to-r from-[#F2B233]/12 to-[#F2B233]/6 transition-all duration-200 active:scale-[0.98]">
                      <span className="w-[34px] h-[34px] rounded-[10px] bg-[#F2B233]/18 flex items-center justify-center text-[#F2B233] flex-shrink-0"><LinkIcon size={15} /></span>
                      <span className="text-[13px] font-bold text-[#F2B233] flex-1">{link.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F2B233] flex-shrink-0" />
                    </Link>
                  );
                }
                return (
                  <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 py-[11px] px-3 rounded-[12px] border transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? "bg-[#F2B233]/10 border-[#F2B233]/20"
                        : isLightMode ? "border-transparent hover:bg-slate-100" : "border-transparent hover:bg-slate-50"
                    }`}>
                    <span className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-[#F2B233]/14 text-[#F2B233]" : isLightMode ? "bg-slate-100 text-slate-400" : "bg-white/5 text-white/30"
                    }`}><LinkIcon size={15} /></span>
                    <span className={`text-[13px] font-semibold flex-1 ${isActive ? "text-[#F2B233]" : isLightMode ? "text-[#1e293b]" : "text-white"}`}>{link.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F2B233] flex-shrink-0" />}
                  </Link>
                );
              })}
              {/* Staff Portal Link - Mobile */}
              <button
                id="staff-portal-btn-mobile"
                onClick={() => { setIsOpen(false); handlePortalClick(); }}
                className="flex items-center gap-3 py-[11px] px-3 rounded-[12px] border border-transparent hover:bg-slate-50 transition-all duration-200 active:scale-[0.98] w-full text-start"
              >
                <span className={`w-[34px] h-[34px] rounded-[10px] bg-[#F2B233]/14 text-[#F2B233] flex items-center justify-center flex-shrink-0`}>
                  <Briefcase size={15} />
                </span>
                <span className={`text-[13px] font-semibold flex-1 ${isLightMode ? "text-[#1e293b]" : "text-white"}`}>
                  {portalTooltipText}
                </span>
              </button>
            </div>
          </div>

          {/* Language Selector - Mobile */}
          <div className="px-3.5 pt-5 flex-shrink-0" style={{ backgroundColor: isLightMode ? '#ffffff' : '#0a0a0a' }}>
            <button
              onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
              className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] border transition-all active:scale-[0.98] ${isLightMode ? 'bg-slate-50 border-[#e2e8f0] hover:bg-slate-100' : 'bg-white/[0.03] border-white/8 hover:bg-white/6'}`}
            >
              <span className="w-[34px] h-[34px] rounded-[10px] bg-[#F2B233]/10 flex items-center justify-center flex-shrink-0">
                <Globe size={16} className="text-[#F2B233]" />
              </span>
              <div className="flex-1 text-start flex items-center gap-2">
                <span className="text-xl">{currentLang.flag}</span>
                <div>
                  <p className={`text-[12px] font-bold leading-none ${isLightMode ? 'text-[#1e293b]' : 'text-white'}`}>{currentLang.nativeName}</p>
                  <p className={`text-[10px] mt-0.5 ${isLightMode ? 'text-slate-400' : 'text-white/28'}`}>
                    {lang === 'ar' || lang === 'ur' ? 'اختر اللغة' : 'Select Language'}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileLangOpen ? 'rotate-180' : ''} ${isLightMode ? 'text-slate-400' : 'text-white/28'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${isMobileLangOpen ? 'max-h-[420px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="grid grid-cols-2 gap-1.5 p-1">
                {LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => { setLang(language.code); setIsMobileLangOpen(false); setIsOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-[12px] border transition-all duration-200 active:scale-[0.97] ${
                      lang === language.code
                        ? "bg-[#F2B233]/10 border-[#F2B233]/22 text-[#F2B233]"
                        : isLightMode
                          ? "border-[#e2e8f0] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#1e293b]"
                          : "border-white/6 bg-white/[0.03] text-white/55 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <span className="text-2xl leading-none">{language.flag}</span>
                    <div className="text-start">
                      <p className="text-[12px] font-bold leading-tight">{language.nativeName}</p>
                      <p className="text-[9px] opacity-38 uppercase tracking-wide">{language.code}</p>
                    </div>
                    {lang === language.code && (
                      <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#F2B233] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" style={{ backgroundColor: isLightMode ? '#ffffff' : '#0a0a0a' }} />

          {/* Panel Footer */}
          <div className="px-3.5 pb-7 pt-4 flex-shrink-0 space-y-2.5" style={{ backgroundColor: isLightMode ? '#ffffff' : '#0a0a0a', borderTop: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}` }}>

            {isAdmin ? (
              /* ── Admin footer: Portfolio (site pages only) + Dashboard + Logout ── */
              <>
                {!isAdminPage && (
                  <div>
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] bg-[#F2B233]/6 border border-[#F2B233]/18 hover:bg-[#F2B233]/10 transition-all active:scale-[0.98]">
                      <span className="w-[34px] h-[34px] rounded-[10px] bg-[#F2B233]/14 flex items-center justify-center text-[#F2B233] flex-shrink-0"><HiDocumentText size={18} /></span>
                      <div className="flex-1 text-start">
                        <p className="text-[12px] font-bold text-[#F2B233] leading-none">{t('nav.profile')}</p>
                        <p className="text-[10px] mt-0.5 text-white/28">PDF</p>
                      </div>
                      <ChevronDown size={13} className={`text-[#F2B233]/45 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isProfileOpen ? "max-h-28 mt-2 opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="grid grid-cols-2 gap-2">
                        <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-bold text-[#F2B233] border border-[#F2B233]/18 py-2.5 rounded-[10px] hover:bg-[#F2B233]/10 transition-colors text-center bg-white/[0.03]">
                          {tPortfolio.ar}
                        </a>
                        <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-bold text-[#F2B233] border border-[#F2B233]/18 py-2.5 rounded-[10px] hover:bg-[#F2B233]/10 transition-colors text-center bg-white/[0.03]">
                          {tPortfolio.en}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] bg-[#F2B233]/8 border border-[#F2B233]/20 hover:bg-[#F2B233]/14 transition-all active:scale-[0.98]"
                >
                  <span className="w-[34px] h-[34px] rounded-[10px] bg-[#F2B233]/15 flex items-center justify-center text-[#F2B233] flex-shrink-0">
                    <LayoutDashboard size={17} />
                  </span>
                  <div className="flex-1 text-start">
                    <p className="text-[12px] font-bold text-[#F2B233] leading-none">{t('admin.dashboard')}</p>
                    <p className="text-[10px] mt-0.5 text-white/28">{adminJobTitle}</p>
                  </div>
                  <UserCircle size={14} className="text-[#F2B233]/40 flex-shrink-0" />
                </Link>

                <button
                  onClick={handleAdminLogout}
                  className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 transition-all active:scale-[0.98]"
                >
                  <span className="w-[34px] h-[34px] rounded-[10px] bg-red-500/10 flex items-center justify-center text-red-400 flex-shrink-0">
                    <LogOut size={16} />
                  </span>
                  <span className="text-[12px] font-bold text-red-400/70">{t('admin.logout')}</span>
                </button>
              </>
            ) : (
              /* ── Normal footer: Portfolio + Theme ── */
              <>
                {/* Portfolio */}
                <div>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] bg-[#F2B233]/6 border border-[#F2B233]/18 hover:bg-[#F2B233]/10 transition-all active:scale-[0.98]">
                    <span className="w-[34px] h-[34px] rounded-[10px] bg-[#F2B233]/14 flex items-center justify-center text-[#F2B233] flex-shrink-0"><HiDocumentText size={18} /></span>
                    <div className="flex-1 text-start">
                      <p className="text-[12px] font-bold text-[#F2B233] leading-none">{t('nav.profile')}</p>
                      <p className={`text-[10px] mt-0.5 ${isLightMode ? 'text-slate-400' : 'text-white/28'}`}>PDF</p>
                    </div>
                    <ChevronDown size={13} className={`text-[#F2B233]/45 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isProfileOpen ? "max-h-28 mt-2 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-bold text-[#F2B233] border border-[#F2B233]/18 py-2.5 rounded-[10px] hover:bg-[#F2B233]/10 transition-colors text-center bg-white/[0.03]">
                        {tPortfolio.ar}
                      </a>
                      <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-bold text-[#F2B233] border border-[#F2B233]/18 py-2.5 rounded-[10px] hover:bg-[#F2B233]/10 transition-colors text-center bg-white/[0.03]">
                        {tPortfolio.en}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Theme */}
                <button onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] border transition-colors ${isLightMode ? 'bg-slate-50 border-[#e2e8f0] hover:bg-slate-100' : 'bg-white/[0.03] border-white/8 hover:bg-white/6'}`}>
                  <span className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[#F2B233] flex-shrink-0 ${isLightMode ? 'bg-slate-100' : 'bg-white/5'}`}>
                    {isLightMode ? <Sun size={16} /> : <Moon size={16} />}
                  </span>
                  <span className={`text-[12px] font-semibold ${isLightMode ? 'text-[#1e293b]/70' : 'text-white/55'}`}>
                    {isLightMode
                      ? (lang === 'ar' || lang === 'ur' ? 'وضع النهار' : 'Light Mode')
                      : (lang === 'ar' || lang === 'ur' ? 'وضع الليل' : 'Dark Mode')}
                  </span>
                </button>
              </>
            )}

            <p className={`text-center text-[9px] font-medium uppercase tracking-[0.18em] pt-1 ${isLightMode ? 'text-slate-400/70' : 'text-white/14'}`}>
              © {new Date().getFullYear()} MAN Engineering Consultancy
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
