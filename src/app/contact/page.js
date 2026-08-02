"use client";

import { useMemo, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/layout/Navbar";
import { Phone, Mail, MapPin, Send, ChevronDown, ArrowLeft, Truck, CheckCircle2, Loader2, Satellite, Map as MapIcon, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { COMPANY } from "@/config/company";

/* ── Reusable Map Toggle (Segmented Control) ── */
function MapToggle({ mode, onChange }) {
  const { t } = useLanguage();
  const options = [
    { key: "map",       label: t("contactPage.mapControls.map"),       icon: <MapIcon size={13} /> },
    { key: "satellite", label: t("contactPage.mapControls.satellite"), icon: <Satellite size={13} /> },
    { key: "hybrid",    label: t("contactPage.mapControls.hybrid"),    icon: <Layers size={13} /> },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "999px",
        padding: "4px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {options.map((opt) => {
        const isActive = mode === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 13px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: isActive ? 800 : 600,
              border: "none",
              cursor: "pointer",
              transition: "background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, transform 0.15s ease",
              background: isActive
                ? "linear-gradient(135deg, #D5B25D 0%, #E1BF67 100%)"
                : "transparent",
              color: isActive ? "#000" : "rgba(255,255,255,0.75)",
              boxShadow: isActive ? "0 2px 12px rgba(213,178,93,0.45)" : "none",
              transform: isActive ? "scale(1.04)" : "scale(1)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              }
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Single Map Card ── */
function MapCard({
  mapMode,
  onModeChange,
  googleMapsApiKey,
  loadError,
  isLoaded,
  mapCenter,
  mapOptions,
  iframeSrc,
  infoTitle,
  infoDesc,
  mapsHref,
  openMapsLabel,
  isRTL,
  badge,
}) {
  return (
    <div
      className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white/5 h-[300px] sm:h-[500px] group"
      data-aos="zoom-in"
    >
      {/* ── Toggle — top-right, content-width ── */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          ...(isRTL ? { left: "16px" } : { right: "16px" }),
          zIndex: 10,
        }}
      >
        <MapToggle mode={mapMode} onChange={onModeChange} />
      </div>

      {/* ── Branch badge — top-left / top-right ── */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            ...(isRTL ? { right: "16px" } : { left: "16px" }),
            zIndex: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(213,178,93,0.3)",
            borderRadius: "999px",
            padding: "6px 13px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#D5B25D",
            boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          }}
        >
          <MapPin size={12} />
          {badge}
        </div>
      )}

      {/* ── Map ── */}
      {googleMapsApiKey && !loadError && isLoaded ? (
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={mapCenter}
          zoom={16}
          options={mapOptions}
        />
      ) : (
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale-[0.6] contrast-[1.2] invert-[0.9] hue-rotate-[180deg] hover:grayscale-0 hover:invert-0 hover:hue-rotate-0 transition-all duration-700"
        />
      )}

      {/* ── Floating Info Card ── */}
      <div
        className={`absolute bottom-6 ${isRTL ? "right-6" : "left-6"} bg-black/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/10 max-w-xs hidden md:block`}
      >
        <h3 className="font-bold text-white mb-1 text-sm">{infoTitle}</h3>
        <p className="text-white/65 text-xs leading-relaxed mb-3">{infoDesc}</p>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-secondary text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#E1BF67] transition-colors"
        >
          {openMapsLabel}
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*                  Main Page                      */
/* ═══════════════════════════════════════════════ */
export default function ContactPage() {
  const { t, lang, isRTL } = useLanguage();
  const { data: cms } = useSiteContent("contact");
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries: ["places"],
  });

  /* ── Independent map modes (default: hybrid) ── */
  const [riyadhMode, setRiyadhMode] = useState("hybrid");
  const [jeddahMode, setJeddahMode] = useState("hybrid");

  /* ── Riyadh branch (طريق أنس بن مالك - شارع أبها) ── */
  const riyadhCenter = useMemo(() => ({ lat: 24.7987098, lng: 46.5940801 }), []);
  const riyadhIframeSrc = useMemo(() => {
    const base =
      "https://www.google.com/maps?q=طريق+أنس+بن+مالك+شارع+أبها+الرياض&output=embed";
    if (riyadhMode === "satellite") return base + "&t=s";
    if (riyadhMode === "hybrid") return base + "&t=h";
    return base;
  }, [riyadhMode]);
  const riyadhMapOptions = useMemo(
    () => ({
      mapTypeId:
        riyadhMode === "satellite"
          ? "satellite"
          : riyadhMode === "hybrid"
          ? "hybrid"
          : "roadmap",
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: "greedy",
    }),
    [riyadhMode]
  );

  /* ── Jeddah branch (حي الأندلس – شارع عبدالرحمن الطبيشي. فيلا 72) ── */
  const jeddahCenter = useMemo(() => ({ lat: 21.5796, lng: 39.1925 }), []);
  const jeddahIframeSrc = useMemo(() => {
    const base =
      "https://www.google.com/maps?q=حي+الأندلس+شارع+عبدالرحمن+الطبيشي+جدة&output=embed";
    if (jeddahMode === "satellite") return base + "&t=s";
    if (jeddahMode === "hybrid") return base + "&t=h";
    return base;
  }, [jeddahMode]);
  const jeddahMapOptions = useMemo(
    () => ({
      mapTypeId:
        jeddahMode === "satellite"
          ? "satellite"
          : jeddahMode === "hybrid"
          ? "hybrid"
          : "roadmap",
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: "greedy",
    }),
    [jeddahMode]
  );

  /* ── Contact form state ── */
  const [formName, setFormName]             = useState("");
  const [formEmail, setFormEmail]           = useState("");
  const [formPhone, setFormPhone]           = useState("");
  const [formCompany, setFormCompany]       = useState("");
  const [formService, setFormService]       = useState("construction");
  const [formMessage, setFormMessage]       = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted]   = useState(false);
  const [formError, setFormError]           = useState("");

  const phone1   = cms?.phone1   || "0598242385";
  const phone2   = cms?.phone2   || "0505649859";
  const email    = cms?.email    || COMPANY.email;
  const whatsapp = cms?.whatsapp || "966598242385";

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) return;
    setFormSubmitting(true);
    setFormError("");
    try {
      await addDoc(collection(db, "contacts"), {
        fullName:   formName.trim(),
        email:      formEmail.trim(),
        phone:      formPhone.trim(),
        company:    formCompany.trim(),
        subject:    formService,
        message:    formMessage.trim(),
        lang,
        status:     "new",
        adminReply: "",
        createdAt:  serverTimestamp(),
        updatedAt:  null,
      });
      setFormSubmitted(true);
    } catch (err) {
      setFormError(err?.message || "Error. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleContactReset = () => {
    setFormSubmitted(false);
    setFormName(""); setFormEmail(""); setFormPhone(""); setFormCompany("");
    setFormService("construction"); setFormMessage(""); setFormError("");
  };

  const address = (isRTL ? cms?.address_ar : cms?.address_en) || t("contactPage.address");
  const days    = (isRTL ? cms?.days_ar    : cms?.days_en)    || t("contact.days");
  const hours   = (isRTL ? cms?.hours_ar   : cms?.hours_en)   || t("contact.time");

  return (
    <main className="min-h-screen bg-[var(--background)] font-cairo text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="image-hero relative min-h-screen flex items-start lg:items-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/heroes/hero-contact.jpg"
            alt="Contact MNC"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className={`absolute inset-0 ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-black/85 via-black/55 to-black/20`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        </div>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-secondary to-transparent z-10" />

        {/* Diagonal pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] z-0"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #D5B25D 0px, #D5B25D 1px, transparent 1px, transparent 80px)" }}
        />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-7xl py-6 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">

            {/* Left / Start: title & CTA */}
            <div className={isRTL ? "text-right" : "text-left"} data-aos="fade-right">
              {/* Badge */}
              <div className={`inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-secondary/30 rounded-full px-5 py-2 mb-4 sm:mb-8`}>
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-secondary text-xs font-bold tracking-widest uppercase">
                  {t("contactPage.typewriter")?.[0] || "تواصل معنا"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 font-heading leading-tight">
                {t("contact.ready")}
                <br />
                <span className="text-gradient">{t("contact.nextProject")}</span>
              </h1>

              <p className="text-white/70 text-sm sm:text-base md:text-xl leading-relaxed mb-6 sm:mb-10 max-w-lg font-medium">
                {t("contact.desc")}
              </p>

              <a
                href="#contact"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-secondary to-[#E1BF67] text-black font-black px-8 py-4 rounded-full text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(213,178,93,0.35)] hover:shadow-[0_0_45px_rgba(213,178,93,0.5)] cursor-pointer"
              >
                {t("contactPage.startProjectCta")}
                {isRTL ? <ArrowLeft size={20} /> : <ArrowLeft size={20} className="rotate-180" />}
              </a>
            </div>

            {/* Right / End: contact info cards — hidden on mobile */}
            <div className="space-y-4 hidden lg:block" data-aos="fade-left" data-aos-delay="150">
              {/* Phone */}
              <a
                href={`tel:${phone1}`}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-secondary/40 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20 shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <Phone className="text-secondary" size={22} />
                </div>
                <div>
                  <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">{t("contact.phone")}</p>
                  <p className="text-white font-bold text-base">{phone1}{phone2 && ` – ${phone2}`}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-secondary/40 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20 shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <Mail className="text-secondary" size={22} />
                </div>
                <div>
                  <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">{t("contact.email")}</p>
                  <p className="text-white font-bold text-base">{email}</p>
                </div>
              </a>

              {/* Location — Jeddah Branch */}
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-secondary/40 hover:bg-white/8 transition-all duration-300 group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20 shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <MapPin className="text-secondary" size={22} />
                </div>
                <div>
                  <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">{t("contact.location")}</p>
                  <p className="text-white font-semibold text-sm leading-relaxed max-w-xs">{address}</p>
                </div>
              </div>

              {/* Location — Riyadh Branch */}
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-secondary/40 hover:bg-white/8 transition-all duration-300 group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20 shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <MapPin className="text-secondary" size={22} />
                </div>
                <div>
                  <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">{t("contact.location")}</p>
                  <p className="text-white font-semibold text-sm leading-relaxed max-w-xs">{t("contactPage.riyadhAddress")}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-gradient-to-r from-secondary/12 to-secondary/5 border border-secondary/25 rounded-2xl p-5">
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-2">{t("contact.hours")}</p>
                <p className="text-white font-bold">{days}</p>
                <p className="text-white/55 text-sm mt-1">{hours}</p>
              </div>

              {/* Supplier CTA */}
              <Link
                href="/suppliers"
                className="flex items-center gap-4 bg-[#C9A34D]/10 border border-[#C9A34D]/40 hover:bg-[#C9A34D]/18 hover:border-[#C9A34D]/70 rounded-2xl p-5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#C9A34D]/15 border border-[#C9A34D]/30 shrink-0 group-hover:bg-[#C9A34D]/25 transition-colors">
                  <Truck className="text-[#C9A34D]" size={22} />
                </div>
                <div>
                  <p className="text-[#C9A34D] font-black text-base leading-tight">{t("suppliers.joinCTA")}</p>
                  <p className="text-white/70 text-sm mt-0.5 group-hover:text-white transition-colors">{t("suppliers.joinDesc")}</p>
                </div>
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
      </section>

      {/* Contact Form Section */}
      <section className="py-10 sm:py-24 bg-[var(--card-bg)]" id="contact">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-24 items-start">

            {/* Info Side */}
            <div className="w-full lg:w-1/2 space-y-10" data-aos="fade-right">
              <div>
                <span className="text-secondary font-bold tracking-widest text-xs mb-3 block">{t("contact.info")}</span>
                <h2 className="text-2xl md:text-3xl font-black mb-4 leading-tight text-white" data-aos="fade-up" data-aos-delay="100">
                  {t("contact.ready")} <br />
                  <span className="text-secondary">{t("contact.nextProject")}</span>
                </h2>
                <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-md">
                  {t("contact.desc")}
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-5 group cursor-pointer" data-aos="fade-up" data-aos-delay="200">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#D5B25D]/30 bg-[#D5B25D]/10 group-hover:border-[var(--secondary)] transition-all duration-300 shadow-sm shrink-0">
                    <Phone className="text-secondary" size={20} />
                  </div>
                  <div>
                    <p className="text-[#D5B25D] text-xs font-bold uppercase tracking-wider mb-1">{t("contact.phone")}</p>
                    <p className="text-lg font-bold text-white group-hover:text-[var(--secondary)] transition-colors">0598242385 - 0505649859</p>
                  </div>
                </div>

                <a href={`mailto:${email}`} className="flex items-center gap-5 group cursor-pointer" data-aos="fade-up" data-aos-delay="300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#D5B25D]/30 bg-[#D5B25D]/10 group-hover:border-secondary transition-all duration-300 shadow-sm shrink-0">
                    <Mail className="text-secondary" size={20} />
                  </div>
                  <div>
                    <p className="text-[#D5B25D] text-xs font-bold uppercase tracking-wider mb-1">{t("contact.email")}</p>
                    <p className="text-lg font-bold text-white group-hover:text-[var(--secondary)] transition-colors">{email}</p>
                  </div>
                </a>

                {/* Jeddah address */}
                <div className="flex items-center gap-5 group cursor-default" data-aos="fade-up" data-aos-delay="400">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#D5B25D]/30 bg-[#D5B25D]/10 group-hover:border-secondary transition-all duration-300 shadow-sm shrink-0">
                    <MapPin className="text-secondary" size={20} />
                  </div>
                  <div>
                    <p className="text-[#D5B25D] text-xs font-bold uppercase tracking-wider mb-1">{t("contact.location")}</p>
                    <p className="text-base font-bold text-white group-hover:text-[var(--secondary)] transition-colors leading-relaxed font-sans max-w-sm">{t("contactPage.address")}</p>
                  </div>
                </div>

                {/* Riyadh address */}
                <div className="flex items-center gap-5 group cursor-default" data-aos="fade-up" data-aos-delay="450">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#D5B25D]/30 bg-[#D5B25D]/10 group-hover:border-secondary transition-all duration-300 shadow-sm shrink-0">
                    <MapPin className="text-secondary" size={20} />
                  </div>
                  <div>
                    <p className="text-[#D5B25D] text-xs font-bold uppercase tracking-wider mb-1">{t("contact.location")}</p>
                    <p className="text-base font-bold text-white group-hover:text-[var(--secondary)] transition-colors leading-relaxed font-sans max-w-sm">{t("contactPage.riyadhAddress")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary/15 to-transparent border border-secondary/20 rounded-2xl p-6" data-aos="fade-up" data-aos-delay="500">
                <p className="text-secondary font-black text-sm mb-2 uppercase tracking-wider">{t("contact.hours")}</p>
                <p className="text-white font-bold">{t("contact.days")}</p>
                <p className="text-white/60 text-sm mt-1">{t("contact.time")}</p>
              </div>

              {/* Supplier CTA */}
              <Link
                href="/suppliers"
                className="flex items-center gap-4 bg-[#C9A34D]/10 border border-[#C9A34D]/40 hover:bg-[#C9A34D]/18 hover:border-[#C9A34D]/70 rounded-2xl p-6 transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#C9A34D]/15 border border-[#C9A34D]/30 shrink-0 group-hover:bg-[#C9A34D]/25 transition-colors">
                  <Truck className="text-[#C9A34D]" size={22} />
                </div>
                <div>
                  <p className="text-[#C9A34D] font-black text-base leading-tight">{t("suppliers.joinCTA")}</p>
                  <p className="text-white/70 text-sm mt-0.5 group-hover:text-white transition-colors">{t("suppliers.joinDesc")}</p>
                </div>
              </Link>
            </div>

            {/* Form Side */}
            <div className="lg:w-1/2 w-full" data-aos="fade-left">
              <div className="bg-white/5 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-700" />

                {formSubmitted ? (
                  <div className="relative z-10 text-center py-8 flex flex-col items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/30 flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-[var(--secondary)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">{t("contactPage.messageSentTitle")}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {t("contactPage.messageSentDesc")}
                      </p>
                    </div>
                    <button
                      onClick={handleContactReset}
                      className="px-8 py-3 rounded-xl bg-[var(--secondary)] text-black font-black text-sm hover:bg-[#E1BF67] transition-all duration-300"
                    >
                      {t("contactPage.sendAnother")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D5B25D] px-1 uppercase tracking-wider">{t("contact.form.name")}</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[var(--secondary)] focus:bg-black/60 outline-none transition-all duration-300 shadow-sm"
                          placeholder={t("contactPage.formNamePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D5B25D] px-1 uppercase tracking-wider">{t("contact.form.phone")}</label>
                        <input
                          type="tel"
                          required
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[var(--secondary)] focus:bg-black/60 outline-none transition-all duration-300 shadow-sm"
                          placeholder="05xxxxxxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D5B25D] px-1 uppercase tracking-wider">{t("contactPage.formEmailLabel")}</label>
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[var(--secondary)] focus:bg-black/60 outline-none transition-all duration-300 shadow-sm"
                          placeholder="example@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#D5B25D] px-1 uppercase tracking-wider">{t("contactPage.formCompanyLabel")}</label>
                        <input
                          type="text"
                          value={formCompany}
                          onChange={(e) => setFormCompany(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[var(--secondary)] focus:bg-black/60 outline-none transition-all duration-300 shadow-sm"
                          placeholder={t("contactPage.formCompanyPlaceholder")}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#D5B25D] px-1 uppercase tracking-wider">{t("contact.form.service")}</label>
                      <div className="relative">
                        <select
                          value={formService}
                          onChange={(e) => setFormService(e.target.value)}
                          className={`w-full bg-black/40 border border-white/10 rounded-xl ${isRTL ? "pe-4 ps-10" : "ps-4 pe-10"} py-3.5 text-sm text-white focus:border-[var(--secondary)] focus:bg-black/60 outline-none transition-all duration-300 shadow-sm appearance-none cursor-pointer`}
                        >
                          <option value="construction" className="bg-black text-white">{t("contactPage.formServiceOptions.construction")}</option>
                          <option value="architecture" className="bg-black text-white">{t("contactPage.formServiceOptions.architecture")}</option>
                          <option value="management" className="bg-black text-white">{t("contactPage.formServiceOptions.management")}</option>
                          <option value="other" className="bg-black text-white">{t("contactPage.formServiceOptions.other")}</option>
                        </select>
                        <ChevronDown className={`absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-white/50 pointer-events-none`} size={16} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#D5B25D] px-1 uppercase tracking-wider">{t("contact.form.message")}</label>
                      <textarea
                        rows="4"
                        required
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[var(--secondary)] focus:bg-black/60 outline-none transition-all duration-300 shadow-sm resize-none"
                        placeholder={t("contactPage.formMessagePlaceholder")}
                      />
                    </div>
                    {formError && <p className="text-red-400 text-sm text-center">{formError}</p>}
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full mt-4 bg-[var(--secondary)] hover:bg-[#E1BF67] disabled:opacity-60 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-sm shadow-xl shadow-secondary/20 transform hover:-translate-y-1 active:scale-95 cursor-pointer"
                    >
                      {formSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {formSubmitting ? t("contactPage.sending") : t("contact.form.submit")}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════ Map Section ═══════════ */}
      <section className="py-10 sm:py-24 bg-[var(--background)] relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

          {/* Section header */}
          <div className="text-center mb-8 sm:mb-16" data-aos="fade-up">
            <span className="text-secondary font-bold tracking-widest text-xs mb-3 block uppercase">
              {t("contactPage.locationBadge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white font-heading">
              {t("contactPage.visitTitle")}
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] mx-auto mt-6 rounded-full" />
          </div>

          {/* ── Map labels ── */}
          <div className="space-y-8 sm:space-y-12">

            {/* ── Riyadh Map ── */}
            <div data-aos="fade-up">
              {/* Label row */}
              <div className="flex items-center gap-3 mb-4" dir={isRTL ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2 bg-secondary/15 border border-secondary/30 rounded-full px-4 py-1.5">
                  <MapPin size={13} className="text-secondary" />
                  <span className="text-secondary text-xs font-bold tracking-wide">
                    {t("contactPage.riyadhBranch")}
                  </span>
                </div>
                <span className="text-white/40 text-xs">
                  {t("contactPage.riyadhAddressStreetOnly")}
                </span>
              </div>

              <MapCard
                mapMode={riyadhMode}
                onModeChange={setRiyadhMode}
                googleMapsApiKey={googleMapsApiKey}
                loadError={loadError}
                isLoaded={isLoaded}
                mapCenter={riyadhCenter}
                mapOptions={riyadhMapOptions}
                iframeSrc={riyadhIframeSrc}
                infoTitle={t("contactPage.riyadhBranch")}
                infoDesc={t("contactPage.riyadhInfoDesc")}
                mapsHref="https://www.google.com/maps?q=24.7987098,46.5940801"
                openMapsLabel={t("contactPage.openMaps")}
                isRTL={isRTL}
              />
            </div>

            {/* ── Jeddah Map ── */}
            <div data-aos="fade-up" data-aos-delay="100">
              {/* Label row */}
              <div className="flex items-center gap-3 mb-4" dir={isRTL ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2 bg-secondary/15 border border-secondary/30 rounded-full px-4 py-1.5">
                  <MapPin size={13} className="text-secondary" />
                  <span className="text-secondary text-xs font-bold tracking-wide">
                    {t("contactPage.jeddahBranch")}
                  </span>
                </div>
                <span className="text-white/40 text-xs">
                  {t("contactPage.jeddahAddressShort")}
                </span>
              </div>

              <MapCard
                mapMode={jeddahMode}
                onModeChange={setJeddahMode}
                googleMapsApiKey={googleMapsApiKey}
                loadError={loadError}
                isLoaded={isLoaded}
                mapCenter={jeddahCenter}
                mapOptions={jeddahMapOptions}
                iframeSrc={jeddahIframeSrc}
                infoTitle={t("contactPage.jeddahBranchAndalus")}
                infoDesc={t("contactPage.jeddahInfoDesc")}
                mapsHref="https://www.google.com/maps?q=حي+الأندلس+شارع+عبدالرحمن+الطبيشي+جدة"
                openMapsLabel={t("contactPage.openMaps")}
                isRTL={isRTL}
              />
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
