"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, Calculator, Home, Info, Briefcase, FolderOpen, PhoneCall, Globe, Users, UserCircle, UserCog, LogOut, LayoutDashboard, Bell, Ruler, FileCheck, ClipboardList, Eye, Newspaper, Building2, Compass, FolderKanban, Sofa } from "lucide-react";
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
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
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
    }, (err) => {
      setAdminProfile(null);
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

  // Escape closes any open dropdown/menu, mobile panel included
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== "Escape") return;
      setIsLangOpen(false);
      setIsAdminOpen(false);
      setIsBellOpen(false);
      setIsMoreOpen(false);
      setIsServicesOpen(false);
      setIsProfileOpen(false);
      setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogoTap = (e) => {
    if (window.innerWidth >= 1280) return; // desktop: use Ctrl+Shift+A instead
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

  /* ── Priority tiers ──────────────────────────────────────────────
     tier 1 (no tier field): always inline, every width ≥1024px. Home,
       Services, Projects, Contact, About, Engineering Design and Careers
       are all required to be permanently visible — never collapsed —
       so the space budget for them is covered by the compact label
       text (see locales) plus the tightened gap/font/action-zone
       values below, not by hiding items.
     isSecondary (tier 3, unchanged): inline only from 1650px up, else
       lives in the "More" menu. These 4 service sub-pages are the only
       genuinely lower-priority items in the list. ── */
  const navLinks = useMemo(() => [
    { name: t('nav.home'),     href: "/",                icon: Home },
    { name: t('nav.services'), href: "/#services",       icon: Briefcase, isServicesDropdown: true },
    { name: t('nav.projects'), href: "/projects",        icon: FolderOpen },
    { name: t('nav.contact'), href: "/contact",          icon: PhoneCall },
    { name: t('nav.about'),    href: "/us",              icon: Info },
    { name: t('nav.engineeringDesign'), href: "/engineering-design", icon: Ruler },
    { name: t('nav.careers'), href: "/careers",          icon: Users },
    { name: t('nav.buildingPermits'),    href: "/building-permits",    icon: FileCheck,     isSecondary: true },
    { name: t('nav.engineeringReports'), href: "/engineering-reports", icon: ClipboardList, isSecondary: true },
    { name: t('nav.siteSupervision'),    href: "/site-supervision",    icon: Eye,           isSecondary: true },
    { name: t('nav.blog'),    href: "/blog",            icon: Newspaper,          isSecondary: true },
  ], [t]);

  /* â”€â”€ Engineering Services dropdown items â€” the 4 core service pages,
       same slugs/labels as the homepage services teaser. â”€â”€ */
  const servicesList = useMemo(() => [
    { name: t('servicesSection.items.construction.title'), href: "/services/contracting",         icon: Building2 },
    { name: t('servicesSection.items.architecture.title'), href: "/services/architectural-design", icon: Compass },
    { name: t('servicesSection.items.management.title'),   href: "/services/project-management",  icon: FolderKanban },
    { name: t('servicesSection.items.interior.title'),     href: "/services/interior-design",      icon: Sofa },
  ], [t]);

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const portfolioTranslations = {
    ar: { ar: 'النسخة العربية',  en: 'النسخة الإنجليزية' },
    en: { ar: 'Arabic Version',  en: 'English Version' },
    zh: { ar: '阿拉伯语版本',     en: '英语版本' },
    es: { ar: 'Versión árabe',   en: 'Versión inglesa' },
    fr: { ar: 'Version arabe',   en: 'Version anglaise' },
    de: { ar: 'Arabische Version', en: 'Englische Version' },
    tr: { ar: 'Arapça Sürümü',   en: 'İngilizce Sürümü' },
    ur: { ar: 'عربی ورژن',       en: 'انگریزی ورژن' },
  };
  const tPortfolio = portfolioTranslations[lang] || portfolioTranslations['en'];

  /* Shared nav-link typography — Laptop (xl, 1280px) 15px, Desktop
     (min-1600) 16px, Large desktop (min-2560) 17px. Never below 14px. */
  const navLinkTextClass = "text-[15px] min-[1600px]:text-[16px] min-[2560px]:text-[17px] font-semibold tracking-[0.01em]";

  return (
    <>
      {/* â•â•â• MAIN NAVBAR â•â•â• */}
      <nav className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 border-b`}
      style={scrolled ? {
        backgroundColor: 'rgba(36, 38, 43, 0.96)',
        boxShadow: '0 10px 35px rgba(0,0,0,.35)',
        borderBottomColor: 'rgba(212,168,67,.18)',
        transition: 'background-color .35s ease, box-shadow .35s ease, border-color .35s ease',
      } : {
        backgroundColor: 'rgba(28, 30, 34, 0.72)',
        borderBottomColor: 'rgba(255,255,255,.08)',
        transition: 'background-color .35s ease, box-shadow .35s ease, border-color .35s ease',
      }}>
        <div className="w-full max-w-[1600px] mx-auto flex items-center xl:flex-nowrap px-6 sm:px-8 lg:px-10 xl:px-12 h-[72px] md:h-[76px] xl:h-[80px] min-[1600px]:h-[84px]">

          {/* â”€â”€ Zone 1 â€” Logo (fixed width, never shrinks) â”€â”€ */}
          <div className="flex items-center flex-shrink-0 xl:pe-8">
            <Link href="/" onClick={handleLogoTap} className="flex items-center flex-shrink-0">
              <Image
                src="/brand/logo-navbar-real.png"
                alt="MAN Engineering Consultancy"
                width={1029}
                height={461}
                unoptimized
                className="w-[100px] md:w-[120px] xl:w-[135px] 2xl:w-[150px] min-[1600px]:w-[160px] min-[2560px]:w-[170px] h-auto object-contain transition-all duration-500"
                priority
              />
            </Link>
          </div>

          {/* ── Zone 2 ── Nav fills the space between logo and actions,
               and centers its own content within that space — it never
               gets a fixed width, so it can never be "clustered" off to
               one side or forced to overflow a rigid column. ── */}
          <div className="hidden xl:flex items-center justify-center flex-1 min-w-0 overflow-hidden gap-6 2xl:gap-7 min-[1920px]:gap-8">
            <nav className="flex items-center flex-shrink-0 gap-6 2xl:gap-7 min-[1920px]:gap-8" aria-label={t('nav.ariaLabel')}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                if (link.isSpecial) {
                  return (
                    <Link key={link.name} href={link.href}
                      className={`flex items-center gap-1.5 text-[12px] xl:text-[13.5px] font-extrabold px-3.5 xl:px-4 py-[7px] xl:py-2 mx-1 xl:mx-1.5 rounded-full border transition-all duration-300 whitespace-nowrap nav-link-special-responsive ${
                        isActive
                          ? "bg-[#D4A843] text-black border-transparent shadow-[0_4px_20px_rgba(212,168,67,0.45)]"
                          : "bg-[#D4A843]/[0.07] text-[#D4A843] border-[#D4A843]/28 hover:bg-[#D4A843]/[0.13] hover:border-[#D4A843]/45 hover:shadow-[0_2px_14px_rgba(212,168,67,0.13)]"
                      }`}>
                      <Calculator size={11} />
                      <span>{link.name}</span>
                    </Link>
                  );
                }

                if (link.isServicesDropdown) {
                  const isServicesActive = servicesList.some(s => pathname === s.href);
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      ref={servicesDropdownRef}
                      onMouseEnter={() => setIsServicesOpen(true)}
                      onMouseLeave={() => setIsServicesOpen(false)}
                    >
                      <button
                        onClick={() => setIsServicesOpen(v => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isServicesOpen}
                        className={`relative flex items-center gap-1 py-2.5 transition-colors duration-200 whitespace-nowrap rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 ${navLinkTextClass} ${
                          isServicesActive
                            ? "text-[#D4A843]"
                            : "text-white hover:text-[#D4A843]"
                        }`}
                      >
                        {link.name}
                        <ChevronDown size={13} className={`transition-transform duration-300 ${isServicesOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`absolute top-full pt-2.5 start-0 w-[240px] z-50 transition-all duration-200 ${
                        isServicesOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                      }`}>
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#44474F', border: '1px solid rgba(212,168,67,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
                          {servicesList.map(svc => {
                          const isSvcActive = pathname === svc.href;
                          return (
                            <Link
                              key={svc.href}
                              href={svc.href}
                              onClick={() => setIsServicesOpen(false)}
                              className={`flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold transition-colors ${
                                isSvcActive
                                  ? "text-[#D4A843]"
                                  : "text-white hover:bg-white/[0.08] hover:text-[#D4A843]"
                              }`}
                            >
                              <svc.icon size={14} className="shrink-0" />
                              {svc.name}
                            </Link>
                          );
                        })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link key={link.name} href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative py-2.5 transition-colors duration-200 whitespace-nowrap group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 ${navLinkTextClass} ${
                      isActive
                        ? "text-[#D4A843]"
                        : "text-white hover:text-[#D4A843]"
                    } ${link.isSecondary ? "hidden min-[1650px]:inline-flex" : ""}`}>
                    {link.name}
                    {/* Underline indicator */}
                    <span className={`absolute bottom-[5px] left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-5 opacity-100 bg-gradient-to-r from-transparent via-[#D4A843] to-transparent'
                        : 'w-0 opacity-0 group-hover:w-3 group-hover:opacity-30 bg-[#D4A843]'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            {/* ── "More" dropdown ── holds secondary links ── */}
            <div
              className="relative min-[1650px]:hidden me-1"
              ref={moreDropdownRef}
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <button
                onClick={() => setIsMoreOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={isMoreOpen}
                className={`relative flex items-center gap-1.5 py-2.5 transition-colors duration-200 whitespace-nowrap rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 text-white hover:text-[#D4A843] ${navLinkTextClass}`}
              >
                {t('nav.more')}
                <ChevronDown size={13} className={`transition-transform duration-300 ${isMoreOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-full pt-2.5 end-0 w-[220px] z-50 transition-all duration-200 ${
                isMoreOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}>
                <div className="rounded-2xl overflow-hidden" style={{ background: '#44474F', border: '1px solid rgba(212,168,67,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
                  {navLinks.filter(l => l.isSecondary).map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold transition-colors ${
                        isActive
                          ? "text-[#D4A843]"
                          : "text-white hover:bg-white/[0.08] hover:text-[#D4A843]"
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
          </div>

          {/* ── Zone 3 ── Admin Controls ── */}
          <div className="hidden xl:flex items-center xl:ps-4 gap-2 min-[1600px]:gap-3 flex-shrink-0">

            {/* â”€â”€ ADMIN MODE â”€â”€ */}
            {isAdmin ? (
              <>
                {/* Language Selector â€” stays visible */}
                <div className="relative" ref={langDropdownRef}>
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    aria-haspopup="menu"
                    aria-expanded={isLangOpen}
                    className="flex items-center justify-center gap-2 h-10 min-[1600px]:h-11 px-4 rounded-lg border border-[#D4A843]/22 hover:border-[#D4A843]/42 hover:bg-[#D4A843]/7 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 text-[15px] min-[1600px]:text-[16px] font-semibold text-white/65 hover:text-white"
                  >
                    <Globe size={18} className="text-[#D4A843]/45 shrink-0" />
                    <span className="tracking-widest uppercase leading-none">{currentLang.code.toUpperCase()}</span>
                  </button>
                  <div className={`absolute top-[calc(100%+10px)] end-0 w-[262px] bg-[#44474F] border border-[#D4A843]/12 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isLangOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"
                  }`}>
                    <div className="p-3">
                      <p className="text-[9px] text-white/40 font-medium tracking-[2.5px] uppercase mb-2.5 px-1">
                        {lang === 'ar' || lang === 'ur' ? 'اختر اللغة' : 'Select Language'}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {LANGUAGES.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => { setLang(language.code); setIsLangOpen(false); }}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-all duration-200 text-start ${
                              lang === language.code
                                ? "bg-[#D4A843]/10 border border-[#D4A843]/22 text-[#D4A843]"
                                : "hover:bg-white/8 border border-transparent text-white/55 hover:text-white"
                            }`}
                          >
                            <span className="text-xl leading-none">{language.flag}</span>
                            <div>
                              <p className="text-[11.5px] font-bold leading-tight">{language.nativeName}</p>
                              <p className="text-[9px] opacity-40 uppercase tracking-wide">{language.dir.toUpperCase()}</p>
                            </div>
                            {lang === language.code && (
                              <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#D4A843] flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bell Notifications â€” admin pages only */}
                {isAdminPage && notif && (
                  <div className="relative" ref={bellDropdownRef}>
                    <button
                      onClick={() => {
                        const opening = !isBellOpen;
                        setIsBellOpen(opening);
                        if (opening && markBellOpened) markBellOpened();
                      }}
                      aria-haspopup="menu"
                      aria-expanded={isBellOpen}
                      aria-label={t('admin.notifications')}
                      className="relative flex items-center justify-center w-11 h-11 rounded-lg border border-[#D4A843]/22 text-[#D4A843]/70 hover:text-[#D4A843] hover:bg-[#D4A843]/10 hover:border-[#D4A843]/40 transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60"
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
                      className={`absolute top-[calc(100%+10px)] end-0 w-[300px] rounded-2xl overflow-hidden z-50 transition-all duration-250 ${
                        isBellOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                      style={{ background: '#44474F', border: '1px solid rgba(212,168,67,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}
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
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#D4A843]/12 border border-[#D4A843]/25">
                              <Briefcase size={12} className="text-[#D4A843]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-semibold truncate">
                                {n.fullName}
                              </p>
                              <p className="text-white/40 text-[11px] mt-0.5 truncate">
                                {t('admin.jobReqLabel')} Â· {n.position || ''}
                              </p>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]/60 shrink-0 mt-1.5" />
                          </Link>
                        ))}
                      </div>
                      {allNotifications.length > 0 && (
                        <div className="border-t border-slate-100 px-4 py-2.5">
                          <Link href="/admin/jobs" onClick={() => setIsBellOpen(false)}
                            className="block text-center text-[11px] text-[#D4A843]/70 hover:text-[#D4A843] transition-colors font-semibold">
                            {t('admin.jobsMenu')}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Portfolio icon â€” only when browsing site pages (not /admin/*) */}
                {!isAdminPage && (
                  <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                      aria-haspopup="menu"
                      aria-expanded={isProfileOpen}
                      className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 rounded-lg">
                      <span className="bg-[#D4A843] text-black h-10 min-[1600px]:h-11 px-4 rounded-lg font-semibold text-[15px] min-[1600px]:text-[16px] shadow-[0_2px_12px_rgba(212,168,67,0.25)] transition-all duration-200 hover:bg-[#E8C46A] hover:shadow-[0_4px_20px_rgba(212,168,67,0.35)] active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                        {t('nav.profile')}
                        <ChevronDown size={9} className={`transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                      </span>
                    </button>
                    <div className={`absolute top-[calc(100%+10px)] end-0 w-[178px] bg-[#44474F] border border-[#D4A843]/14 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                      isProfileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}>
                      <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#D4A843] hover:bg-[#D4A843]/8 transition-colors"
                        onClick={() => setIsProfileOpen(false)}>
                        {tPortfolio.ar}
                      </a>
                      <div className="h-px bg-[#44474F] mx-3" />
                      <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#D4A843] hover:bg-[#D4A843]/8 transition-colors"
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
                    aria-label={portalTooltipText}
                    className="flex items-center justify-center w-10 h-10 min-[1600px]:w-11 min-[1600px]:h-11 rounded-lg border border-[#D4A843]/22 text-[#D4A843]/70 hover:text-[#D4A843] hover:bg-[#D4A843]/10 hover:border-[#D4A843]/40 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60"
                  >
                    <Briefcase size={18} />
                  </button>
                  <div className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 whitespace-nowrap bg-[#2B2B2B] border border-[#D4A843]/30 text-[#D4A843] text-[12px] font-bold py-2 px-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]`}>
                    {portalTooltipText}
                  </div>
                </div>

                {/* Admin user dropdown */}
                <div className="relative" ref={adminDropdownRef}>
                  <button
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    aria-haspopup="menu"
                    aria-expanded={isAdminOpen}
                    className="flex items-center gap-1.5 min-h-11 px-3 min-[1600px]:px-3.5 rounded-lg border border-[#D4A843]/30 hover:border-[#D4A843]/50 hover:bg-[#D4A843]/8 transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60"
                  >
                    <UserCog size={14} className="text-[#D4A843] flex-shrink-0" />
                    <span className="text-[12.5px] xl:text-[13px] font-bold text-[#D4A843] whitespace-nowrap">
                      {adminDisplayName}
                    </span>
                    <ChevronDown size={10} className={`text-[#D4A843]/50 transition-transform duration-300 ${isAdminOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`absolute top-[calc(100%+10px)] end-0 w-[185px] bg-[#44474F] border border-[#D4A843]/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isAdminOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsAdminOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-[12px] font-bold text-white/65 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <LayoutDashboard size={13} className="text-[#D4A843] flex-shrink-0" />
                      {t('admin.dashboard')}
                    </Link>
                    <div className="h-px bg-[#44474F] mx-3" />
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
                {/* â”€â”€ NORMAL MODE â”€â”€ */}

                {/* Profile / Portfolio Dropdown */}
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                    aria-haspopup="menu"
                    aria-expanded={isProfileOpen}
                    className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 rounded-lg">
                    <span className="bg-[#D4A843] text-black h-10 min-[1600px]:h-11 px-4 rounded-lg font-semibold text-[15px] min-[1600px]:text-[16px] shadow-[0_2px_12px_rgba(212,168,67,0.25)] transition-all duration-200 hover:bg-[#E8C46A] hover:shadow-[0_4px_20px_rgba(212,168,67,0.35)] active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                      {t('nav.profile')}
                      <ChevronDown size={9} className={`transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </span>
                  </button>

                  <div className={`absolute top-[calc(100%+10px)] end-0 w-[178px] bg-[#44474F] border border-[#D4A843]/14 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isProfileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}>
                    <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#D4A843] hover:bg-[#D4A843]/8 transition-colors"
                      onClick={() => setIsProfileOpen(false)}>
                      {tPortfolio.ar}
                    </a>
                    <div className="h-px bg-[#44474F] mx-3" />
                    <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 text-[12px] font-bold text-[#D4A843] hover:bg-[#D4A843]/8 transition-colors"
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
                    aria-label={portalTooltipText}
                    className="flex items-center justify-center w-10 h-10 min-[1600px]:w-11 min-[1600px]:h-11 rounded-lg border border-[#D4A843]/22 text-[#D4A843]/70 hover:text-[#D4A843] hover:bg-[#D4A843]/10 hover:border-[#D4A843]/40 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60"
                  >
                    <Briefcase size={18} />
                  </button>
                  <div className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 whitespace-nowrap bg-[#2B2B2B] border border-[#D4A843]/30 text-[#D4A843] text-[12px] font-bold py-2 px-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]`}>
                    {portalTooltipText}
                  </div>
                </div>

                {/* Language Selector */}
                <div className="relative" ref={langDropdownRef}>
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    aria-haspopup="menu"
                    aria-expanded={isLangOpen}
                    className="flex items-center justify-center gap-2 h-10 min-[1600px]:h-11 px-4 rounded-lg border border-[#D4A843]/22 hover:border-[#D4A843]/42 hover:bg-[#D4A843]/7 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 text-[15px] min-[1600px]:text-[16px] font-semibold text-white/65 hover:text-white"
                  >
                    <Globe size={18} className="text-[#D4A843]/45 shrink-0" />
                    <span className="tracking-widest uppercase leading-none">{currentLang.code.toUpperCase()}</span>
                  </button>

                  <div className={`absolute top-[calc(100%+10px)] end-0 w-[262px] bg-[#44474F] border border-[#D4A843]/12 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden z-50 ${
                    isLangOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"
                  }`}>
                    <div className="p-3">
                      <p className="text-[9px] text-white/40 font-medium tracking-[2.5px] uppercase mb-2.5 px-1">
                        {lang === 'ar' || lang === 'ur' ? 'اختر اللغة' : 'Select Language'}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {LANGUAGES.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => { setLang(language.code); setIsLangOpen(false); }}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-all duration-200 text-start ${
                              lang === language.code
                                ? "bg-[#D4A843]/10 border border-[#D4A843]/22 text-[#D4A843]"
                                : "hover:bg-white/8 border border-transparent text-white/55 hover:text-white"
                            }`}
                          >
                            <span className="text-xl leading-none">{language.flag}</span>
                            <div>
                              <p className="text-[11.5px] font-bold leading-tight">{language.nativeName}</p>
                              <p className="text-[9px] opacity-40 uppercase tracking-wide">{language.dir.toUpperCase()}</p>
                            </div>
                            {lang === language.code && (
                              <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#D4A843] flex-shrink-0" />
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

          {/* â”€â”€ Mobile Header Actions â”€â”€ */}
          <div className="flex items-center gap-2 xl:hidden ms-auto">
            <button
              className="flex items-center justify-center w-11 h-11 rounded-lg border border-[#D4A843]/22 hover:bg-[#D4A843]/10 transition-colors text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-panel"
              aria-label={isOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      {/* â•â•â• MOBILE OVERLAY â•â•â• */}
      <div
        className={`xl:hidden fixed inset-0 z-[110] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* â•â•â• MOBILE PANEL â•â•â• */}
      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.ariaLabel')}
        className="xl:hidden fixed top-0 bottom-0 w-full z-[120] transition-transform duration-500 ease-out start-0"
        style={{
          backgroundColor: '#2E3038',
          boxShadow: isRTL ? '-6px 0 50px rgba(0,0,0,1)' : '6px 0 50px rgba(0,0,0,1)',
          transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
        }}
      >
        <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#2E3038' }}>

          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 pt-8 pb-4 flex-shrink-0" style={{ backgroundColor: '#2E3038', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image src="/brand/logo-navbar-real.png" alt="MAN Engineering Consultancy" width={1029} height={461} unoptimized className="h-9 w-auto object-contain" priority />
            </Link>
            <button onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-[10px] border border-[#D4A843]/22 bg-[#D4A843]/5 flex items-center justify-center text-[#D4A843] hover:bg-[#D4A843]/12 transition-all active:scale-95">
              <X size={16} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="px-3.5 pt-4 flex-shrink-0" style={{ backgroundColor: '#2E3038' }}>
            <p className="text-[9px] font-medium tracking-[2.5px] uppercase px-1.5 mb-2 text-white/20">
              {lang === 'ar' || lang === 'ur' ? 'القائمة' : 'Navigation'}
            </p>
            <div className="flex flex-col gap-0.5">
              {navLinks.filter(l => !l.isSecondary).map((link) => {
                const isActive = pathname === link.href;
                const LinkIcon = link.icon;
                if (link.isSpecial) {
                  return (
                    <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-[11px] px-3 rounded-[12px] border border-[#D4A843]/22 bg-gradient-to-r from-[#D4A843]/12 to-[#D4A843]/6 transition-all duration-200 active:scale-[0.98]">
                      <span className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/18 flex items-center justify-center text-[#D4A843] flex-shrink-0"><LinkIcon size={15} /></span>
                      <span className="text-[13px] font-bold text-[#D4A843] flex-1">{link.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] flex-shrink-0" />
                    </Link>
                  );
                }
                if (link.isServicesDropdown) {
                  return (
                    <div key={link.name} className="flex flex-col">
                      <button
                        onClick={() => setIsMobileServicesOpen(v => !v)}
                        className="flex items-center gap-3 py-[11px] px-3 rounded-[12px] border border-transparent hover:bg-white/8 transition-all duration-200 active:scale-[0.98] text-white w-full text-start"
                      >
                        <span className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/14 text-[#D4A843] flex items-center justify-center flex-shrink-0">
                          <LinkIcon size={15} />
                        </span>
                        <span className="text-[13px] font-semibold flex-1 text-white">{link.name}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileServicesOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isMobileServicesOpen && (
                        <div className="ms-6 my-1 flex flex-col gap-1 border-s-2 border-[#D4A843]/20 ps-3">
                          {servicesList.map((svc) => (
                            <Link
                              key={svc.href}
                              href={svc.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-[12.5px] font-medium text-white/80 hover:text-[#D4A843] hover:bg-white/5 transition-colors"
                            >
                              <svc.icon size={13} className="text-[#D4A843]" />
                              {svc.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 py-[11px] px-3 rounded-[12px] border transition-all duration-200 active:scale-[0.98] ${
                      isActive ? "bg-[#D4A843]/10 border-[#D4A843]/20" : "border-transparent hover:bg-white/8"
                    }`}>
                    <span className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-[#D4A843]/14 text-[#D4A843]" : "bg-white/5 text-white/30"
                    }`}><LinkIcon size={15} /></span>
                    <span className={`text-[13px] font-semibold flex-1 ${isActive ? "text-[#D4A843]" : "text-white"}`}>{link.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] flex-shrink-0" />}
                  </Link>
                );
              })}

              {/* Mobile "More" Accordion for secondary links */}
              <div className="flex flex-col">
                <button
                  onClick={() => setIsMobileMoreOpen(v => !v)}
                  className="flex items-center gap-3 py-[11px] px-3 rounded-[12px] border border-transparent hover:bg-white/8 transition-all duration-200 active:scale-[0.98] text-[#D4A843] w-full text-start"
                >
                  <span className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/14 text-[#D4A843] flex items-center justify-center flex-shrink-0">
                    <Compass size={15} />
                  </span>
                  <span className="text-[13px] font-semibold flex-1 text-[#D4A843]">{t('nav.more')}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileMoreOpen ? "rotate-180" : ""}`} />
                </button>

                {isMobileMoreOpen && (
                  <div className="ms-6 my-1 flex flex-col gap-1 border-s-2 border-[#D4A843]/20 ps-3">
                    {navLinks.filter(l => l.isSecondary).map((secLink) => (
                      <Link
                        key={secLink.href}
                        href={secLink.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-[12.5px] font-medium text-white/80 hover:text-[#D4A843] hover:bg-white/5 transition-colors"
                      >
                        <secLink.icon size={13} className="text-[#D4A843]" />
                        {secLink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* Staff Portal Link - Mobile */}
              <button
                id="staff-portal-btn-mobile"
                onClick={() => { setIsOpen(false); handlePortalClick(); }}
                className="flex items-center gap-3 py-[11px] px-3 rounded-[12px] border border-transparent hover:bg-white/8 transition-all duration-200 active:scale-[0.98] w-full text-start"
              >
                <span className={`w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/14 text-[#D4A843] flex items-center justify-center flex-shrink-0`}>
                  <Briefcase size={15} />
                </span>
                <span className="text-[13px] font-semibold flex-1 text-white">
                  {portalTooltipText}
                </span>
              </button>
            </div>
          </div>

          {/* Language Selector - Mobile */}
          <div className="px-3.5 pt-5 flex-shrink-0" style={{ backgroundColor: '#2E3038' }}>
            <button
              onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
              className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] border transition-all active:scale-[0.98] bg-white/[0.03] border-white/8 hover:bg-white/6"
            >
              <span className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/10 flex items-center justify-center flex-shrink-0">
                <Globe size={16} className="text-[#D4A843]" />
              </span>
              <div className="flex-1 text-start flex items-center gap-2">
                <span className="text-xl">{currentLang.flag}</span>
                <div>
                  <p className="text-[12px] font-bold leading-none text-white">{currentLang.nativeName}</p>
                  <p className="text-[10px] mt-0.5 text-white/28">
                    {lang === 'ar' || lang === 'ur' ? 'اختر اللغة' : 'Select Language'}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileLangOpen ? 'rotate-180' : ''} text-white/28`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${isMobileLangOpen ? 'max-h-[420px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="grid grid-cols-2 gap-1.5 p-1">
                {LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => { setLang(language.code); setIsMobileLangOpen(false); setIsOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-[12px] border transition-all duration-200 active:scale-[0.97] ${
                      lang === language.code
                        ? "bg-[#D4A843]/10 border-[#D4A843]/22 text-[#D4A843]"
                        : "border-white/6 bg-white/[0.03] text-white/55 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <span className="text-2xl leading-none">{language.flag}</span>
                    <div className="text-start">
                      <p className="text-[12px] font-bold leading-tight">{language.nativeName}</p>
                      <p className="text-[9px] opacity-38 uppercase tracking-wide">{language.code}</p>
                    </div>
                    {lang === language.code && (
                      <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#D4A843] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" style={{ backgroundColor: '#2E3038' }} />

          {/* Panel Footer */}
          <div className="px-3.5 pb-7 pt-4 flex-shrink-0 space-y-2.5" style={{ backgroundColor: '#2E3038', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

            {isAdmin ? (
              /* â”€â”€ Admin footer: Portfolio (site pages only) + Dashboard + Logout â”€â”€ */
              <>
                {!isAdminPage && (
                  <div>
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] bg-[#D4A843]/6 border border-[#D4A843]/18 hover:bg-[#D4A843]/10 transition-all active:scale-[0.98]">
                      <span className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/14 flex items-center justify-center text-[#D4A843] flex-shrink-0"><HiDocumentText size={18} /></span>
                      <div className="flex-1 text-start">
                        <p className="text-[12px] font-bold text-[#D4A843] leading-none">{t('nav.profile')}</p>
                        <p className="text-[10px] mt-0.5 text-white/28">PDF</p>
                      </div>
                      <ChevronDown size={13} className={`text-[#D4A843]/45 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isProfileOpen ? "max-h-28 mt-2 opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="grid grid-cols-2 gap-2">
                        <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-bold text-[#D4A843] border border-[#D4A843]/18 py-2.5 rounded-[10px] hover:bg-[#D4A843]/10 transition-colors text-center bg-white/[0.03]">
                          {tPortfolio.ar}
                        </a>
                        <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-bold text-[#D4A843] border border-[#D4A843]/18 py-2.5 rounded-[10px] hover:bg-[#D4A843]/10 transition-colors text-center bg-white/[0.03]">
                          {tPortfolio.en}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] bg-[#D4A843]/8 border border-[#D4A843]/20 hover:bg-[#D4A843]/14 transition-all active:scale-[0.98]"
                >
                  <span className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/15 flex items-center justify-center text-[#D4A843] flex-shrink-0">
                    <LayoutDashboard size={17} />
                  </span>
                  <div className="flex-1 text-start">
                    <p className="text-[12px] font-bold text-[#D4A843] leading-none">{t('admin.dashboard')}</p>
                    <p className="text-[10px] mt-0.5 text-white/28">{adminJobTitle}</p>
                  </div>
                  <UserCircle size={14} className="text-[#D4A843]/40 flex-shrink-0" />
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
              /* â”€â”€ Normal footer: Portfolio â”€â”€ */
              <>
                {/* Portfolio */}
                <div>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[12px] bg-[#D4A843]/6 border border-[#D4A843]/18 hover:bg-[#D4A843]/10 transition-all active:scale-[0.98]">
                    <span className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843]/14 flex items-center justify-center text-[#D4A843] flex-shrink-0"><HiDocumentText size={18} /></span>
                    <div className="flex-1 text-start">
                      <p className="text-[12px] font-bold text-[#D4A843] leading-none">{t('nav.profile')}</p>
                      <p className="text-[10px] mt-0.5 text-white/28">PDF</p>
                    </div>
                    <ChevronDown size={13} className={`text-[#D4A843]/45 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isProfileOpen ? "max-h-28 mt-2 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <a href="/Portfolio%20MAN/ARABIC%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-bold text-[#D4A843] border border-[#D4A843]/18 py-2.5 rounded-[10px] hover:bg-[#D4A843]/10 transition-colors text-center bg-white/[0.03]">
                        {tPortfolio.ar}
                      </a>
                      <a href="/Portfolio%20MAN/ENGLISH%20PORTFOLIO.pdf" target="_blank" rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-bold text-[#D4A843] border border-[#D4A843]/18 py-2.5 rounded-[10px] hover:bg-[#D4A843]/10 transition-colors text-center bg-white/[0.03]">
                        {tPortfolio.en}
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}

            <p className="text-center text-[9px] font-medium uppercase tracking-[0.18em] pt-1 text-white/20">
              Â© {new Date().getFullYear()} MAN Engineering Consultancy
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

