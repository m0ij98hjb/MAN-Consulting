"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaEnvelope,
  FaWhatsapp,
  FaArrowUp,
  FaHome,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { BsTwitterX } from "react-icons/bs";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";

const SocialIcon = ({ name }) => {
  const common = "w-4 h-4";
  // return SVGs that use currentColor so we can color them via the anchor
  if (name === "whatsapp")
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.52 3.48A11.88 11.88 0 0 0 12 0C5.37 0 .04 5.34.04 12.01a11.87 11.87 0 0 0 2.07 6.48L0 24l5.71-1.5A11.93 11.93 0 0 0 12 24c6.63 0 11.96-5.34 11.96-11.99 0-1.99-.47-3.86-1.44-5.53zM12 21.5a9.44 9.44 0 0 1-4.95-1.43l-.35-.21-3.39.89.91-3.31-.23-.34A9.5 9.5 0 1 1 21.5 12 9.45 9.45 0 0 1 12 21.5z" />
        <path d="M17.2 14.1c-.5-.2-2.9-1.4-3.3-1.5-.4-.1-.7-.2-1 .2s-1.2 1.5-1.4 1.8c-.2.3-.4.4-.9.1-.5-.3-2-1.1-3.8-2.34-1.4-1-.2-1.6.1-1.8.3-.2.5-.4.8-.1.3.3 1.1 1 .7 1.7-.2.3- .3.5 0 .7 0 .1 1.4 1.8 3.1 2.8 2 1.2 3.3 1.3 3.6 1.2.3 0 .9-.3 1.1-.6.2-.3.2-.6 0-.8-.2-.2-.5-.3-.9-.5z" />
      </svg>
    );
  if (name === "x")
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M19.6 5.6c.5-.5.5-1.3 0-1.8s-1.3-.5-1.8 0L12 9.6 6.2 3.8c-.5-.5-1.3-.5-1.8 0s-.5 1.3 0 1.8L9.6 12l-5.2 5.2c-.5.5-.5 1.3 0 1.8.2.2.5.3.9.3s.6-.1.9-.3L12 14.4l5.8 5.8c.2.2.5.3.9.3s.6-.1.9-.3c.5-.5.5-1.3 0-1.8L14.4 12l5.2-5.2z" />
      </svg>
    );
  if (name === "facebook")
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 2 6.48 2 12.07 2 17.09 5.66 21.2 10.44 22v-7.01H7.9v-2.92h2.54V9.12c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54v1.85h2.75l-.44 2.92h-2.31V22C18.34 21.2 22 17.09 22 12.07z" />
      </svg>
    );
  if (name === "instagram")
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm8.5 5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
      </svg>
    );
  if (name === "tiktok")
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.5 8.5c0 .83-.67 1.5-1.5 1.5-.28 0-.54-.07-.77-.18v6.18a4.5 4.5 0 1 1-4.5-4.5V9.5a4 4 0 0 0 6.27-3.27h.5V8.5z" />
      </svg>
    );
  // twitter
  return (
    <svg
      className={common}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22 5.92c-.66.3-1.37.5-2.11.59a3.7 3.7 0 0 0 1.62-2.04c-.73.43-1.54.74-2.4.9A3.68 3.68 0 0 0 12.9 7.5c0 .29.03.58.1.85-3.06-.15-5.77-1.63-7.59-3.88-.32.55-.5 1.2-.5 1.88 0 1.3.66 2.45 1.67 3.12-.61-.02-1.18-.19-1.68-.47v.05c0 1.82 1.3 3.34 3.02 3.69-.32.09-.66.14-1.01.14-.25 0-.5-.02-.74-.07.5 1.56 1.93 2.7 3.63 2.73A7.38 7.38 0 0 1 2 19.54a10.4 10.4 0 0 0 5.63 1.65c6.76 0 10.47-5.6 10.47-10.46v-.48c.72-.5 1.34-1.12 1.84-1.83-.66.3-1.38.5-2.11.59z" />
    </svg>
  );
};

const Footer = () => {
  const { lang, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const pathname = usePathname();
  const isLightMode = theme === 'dark';

  if (pathname.startsWith('/admin')) return null;

  const socialBtnStyle = {
    width: "45px",
    height: "45px",
    background: isLightMode ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: isLightMode ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.1)",
    color: "#B8923A",
    textDecoration: "none",
  };

  const links = {
    company: [
      { label: t("nav.about"), href: "/us" },
      { label: t("nav.projects"), href: "/projects" },
      { label: t("nav.services"), href: "/#services" },
      { label: t("nav.contact"), href: "/contact" },
      { label: t('admin.suppliersNav'), href: "/suppliers", gold: true },
    ],
    services: [
      { label: t("servicesSection.items.construction.title") },
      { label: t("servicesSection.items.architecture.title") },
      { label: t("servicesSection.items.management.title") },
      { label: t("servicesSection.items.interior.title") },
    ],
  };

  return (
    <footer
      className={`text-[var(--foreground)] ${isLightMode ? 'bg-slate-100' : 'bg-[var(--background)]'}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── TOP DIVIDER ─────────────────────────────── */}
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#B8923A] to-transparent" />

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="w-full max-w-sm">
              <Image
                src="/asstes/logo-footer.png"
                alt="MNC Logo"
                width={520}
                height={260}
                className="logo-footer w-auto h-28 sm:max-h-32 md:max-h-36 object-contain"
                priority
              />
            </div>
            <p className="text-[var(--foreground)] text-sm leading-relaxed max-w-sm">
              {t("footer.brandDesc")}
            </p>
            {/* Social */}
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                {
                  icon: FaFacebookF,
                  href: "https://www.facebook.com/",
                },
                {
                  icon: FaInstagram,
                  href: "https://www.instagram.com//",
                },
                { icon: BsTwitterX, href: "https://x.com/" },
                { icon: FaWhatsapp, href: "https://wa.me/" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -3 }}
                  style={socialBtnStyle}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[var(--secondary)] font-bold text-sm tracking-widest uppercase">
              {t("footer.quickLinks")}
            </h4>
            <div className="w-8 h-[2px] bg-gradient-to-r from-[#B8923A] to-transparent" />
            <ul className="flex flex-col gap-3">
              {links.company.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={`text-sm transition-colors duration-200 flex items-center gap-2 group
                      ${l.gold
                        ? 'text-[#C9A34D] hover:text-[#E1BF67] font-semibold'
                        : 'text-[var(--foreground)] hover:text-[var(--secondary)]'
                      }`}
                  >
                    <span className={`w-1 h-1 rounded-full transition-colors shrink-0
                      ${l.gold
                        ? 'bg-[#C9A34D] group-hover:bg-[#E1BF67]'
                        : 'bg-[var(--secondary)]/40 group-hover:bg-[var(--secondary)]'
                      }`}
                    />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[var(--secondary)] font-bold text-sm tracking-widest uppercase">
              {t("footer.services")}
            </h4>
            <div className="w-8 h-[2px] bg-gradient-to-r from-[#B8923A] to-transparent" />
            <ul className="flex flex-col gap-3">
              {links.services.map((s) => (
                <li
                  key={s.label}
                  className="text-[var(--foreground)] text-sm flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--secondary)]/40" />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────── */}
      <div className={`border-t ${isLightMode ? 'border-slate-200' : 'border-[rgba(255,255,255,0.05)]'}`}>
        <div
          className="max-w-7xl mx-auto px-6 py-5
          flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-[var(--foreground)] text-xs">
            &copy; {new Date().getFullYear()}&nbsp;
            {t("footer.rightsReserved")}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8923A] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] animate-pulse" />
            <span className="text-[var(--foreground)] text-xs">
              {t("footer.location")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
