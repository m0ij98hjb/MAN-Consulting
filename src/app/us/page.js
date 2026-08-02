"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import TypewriterText from "@/components/TypewriterText";
import { ArrowRight, ArrowLeft, CheckCircle2, Users, Building2, Target, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function AboutUsPage() {
  const { lang, t, isRTL } = useLanguage();
  const { data: aboutCms } = useSiteContent('about');
  const directorImage = aboutCms?.director_image || '/asstes/directort.png';
  const RIYADH_BASE = '/asstes/Photos%20of%20the%20Riyadh/';
  const riyadhPhotoAlts = t('aboutUsPage.riyadhPhotoAlts');
  const riyadhPhotos = [
    { src: `${RIYADH_BASE}WhatsApp%20Image%202026-06-24%20at%203.58.23%20PM%20(1).jpeg`, alt: riyadhPhotoAlts[0] },
    { src: `${RIYADH_BASE}WhatsApp%20Image%202026-06-24%20at%203.58.23%20PM%20(3).jpeg`, alt: riyadhPhotoAlts[1] },
    { src: `${RIYADH_BASE}WhatsApp%20Image%202026-06-24%20at%203.58.23%20PM%20(4).jpeg`, alt: riyadhPhotoAlts[2] },
    { src: `${RIYADH_BASE}WhatsApp%20Image%202026-06-24%20at%203.58.23%20PM%20(5).jpeg`, alt: riyadhPhotoAlts[3] },
    { src: `${RIYADH_BASE}WhatsApp%20Image%202026-06-24%20at%203.58.23%20PM%20(6).jpeg`, alt: riyadhPhotoAlts[4] },
    { src: `${RIYADH_BASE}WhatsApp%20Image%202026-06-24%20at%203.58.24%20PM.jpeg`,       alt: riyadhPhotoAlts[5] },
  ];

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() =>
    setLightboxIndex(i => (i - 1 + riyadhPhotos.length) % riyadhPhotos.length), [riyadhPhotos.length]);
  const nextPhoto = useCallback(() =>
    setLightboxIndex(i => (i + 1) % riyadhPhotos.length), [riyadhPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft')  isRTL ? nextPhoto() : prevPhoto();
      if (e.key === 'ArrowRight') isRTL ? prevPhoto() : nextPhoto();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto, isRTL]);

  const heroStatsLabels = t('aboutUsPage.heroStatsLabels');
  const heroStats = aboutCms?.stats?.length
    ? aboutCms.stats.map(s => ({
        value: s.value,
        // CMS stats are admin-authored bilingual (ar/en) content fields — out of scope for i18n remediation.
        label: isRTL ? s.label_ar : (s.label_en || s.label_ar),
      }))
    : [
        { value: "38+",  label: heroStatsLabels[0] },
        { value: "50+",  label: heroStatsLabels[1] },
        { value: "98%",  label: heroStatsLabels[2] },
        { value: "300+", label: heroStatsLabels[3] },
      ];

  return (
    <main className="min-h-screen bg-[var(--background)] font-cairo text-white" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="image-hero relative h-screen min-h-[700px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/heroes/hero-us.jpg"
            alt="About MNC Construction"
            fill
            className="object-cover object-center animate-slow-zoom"
            priority
            unoptimized
          />
          {/* Rich multi-layer gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />
        </div>

        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-secondary to-transparent z-10" />

        {/* Diagonal grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] z-0"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #D5B25D 0px, #D5B25D 1px, transparent 1px, transparent 80px)" }}
        />

        {/* Content */}
        <div className="container relative z-10 mx-auto px-6 max-w-7xl pt-24 md:pt-28">
          <div className={isRTL ? "text-right" : "text-left"} data-aos="fade-up">

            {/* Badge */}
            <div className={`inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-secondary/30 rounded-full px-5 py-2 mb-8`}>
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary text-xs font-bold tracking-widest uppercase">
                {t("aboutUsPage.teamBadge") || "فريق العمل"}
              </span>
            </div>

            {/* Main title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 font-heading leading-none">
              <TypewriterText
                texts={t("aboutUsPage.titleTypewriter") || ["تعرف علينا", "MNC Contracting"]}
                typingSpeed={120}
                deletingSpeed={60}
                pauseDuration={2500}
                loop={true}
                className="text-white"
                textClassNames={["text-white", "text-gradient"]}
              />
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-xl text-white/70 leading-relaxed max-w-2xl mb-14 font-medium" data-aos="fade-up" data-aos-delay="200">
              {t("aboutUsPage.subtitle")}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-10 gap-y-6" data-aos="fade-up" data-aos-delay="350">
              {heroStats.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-3xl md:text-4xl font-black text-secondary leading-none">{stat.value}</span>
                  <span className="text-white/55 text-xs md:text-sm font-semibold mt-1.5 uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
      </section>

      {/* Main Content Section */}
      <section className="py-24 bg-[var(--background)] relative overflow-hidden">
        {/* Soft background ambient light */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-[#D5B25D]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Text Content - Column 1 (renders Right in RTL, Left in LTR) */}
            <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-start" data-aos="fade-up">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black mb-6 text-white font-heading relative inline-block">
                  {t("aboutUsPage.visionHistoryTitle")}
                  <span className={`absolute -bottom-2.5 ${isRTL ? 'right-0' : 'left-0'} w-2/3 h-1 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] rounded-full`} />
                </h2>
                <p className="text-base sm:text-lg leading-relaxed text-white/70 font-medium">
                  {t("aboutUsPage.visionHistoryDesc")}
                </p>
              </div>

              {/* CEO Quote - Premium Gold Glass Card */}
              <div className={`bg-white/5 backdrop-blur-md p-6 rounded-2xl ${isRTL ? 'border-r-4 border-r-[#D5B25D]' : 'border-l-4 border-l-[#D5B25D]'} border-t border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative overflow-hidden`} data-aos="fade-up" data-aos-delay="100">
                <div className={`absolute -top-6 ${isRTL ? '-left-6' : '-right-6'} opacity-10 text-white select-none pointer-events-none text-9xl font-serif`}>
                  &ldquo;
                </div>
                <p className="text-base sm:text-lg leading-relaxed text-white/90 font-medium relative z-10">
                  {t("aboutUsPage.ceoQuote")}
                </p>
              </div>

              {/* Values/Goals List */}
              <div className="space-y-6 pt-2">
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`} data-aos="fade-up" data-aos-delay="200">
                  <div className="w-12 h-12 rounded-2xl bg-[#D5B25D]/10 border border-[#D5B25D]/20 flex items-center justify-center shrink-0 shadow-lg">
                    <Target className="text-[#D5B25D]" size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-1.5">{t("aboutUsPage.goalTitle")}</h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                      {t("aboutUsPage.goalDesc")}
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`} data-aos="fade-up" data-aos-delay="300">
                  <div className="w-12 h-12 rounded-2xl bg-[#D5B25D]/10 border border-[#D5B25D]/20 flex items-center justify-center shrink-0 shadow-lg">
                    <Building2 className="text-[#D5B25D]" size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-1.5">{t("aboutUsPage.projectsTitle")}</h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                      {t("aboutUsPage.projectsDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Grid - Column 2 (renders Left in RTL, Right in LTR) */}
            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch" data-aos="fade-up">
              {/* Stacked Images Column */}
              <div className={`grid grid-rows-2 gap-6 ${isRTL ? 'order-last md:order-2' : 'order-first md:order-1'}`}>
                <div className="relative h-[220px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer">
                  <Image src="/project1.png" alt="MNC Residential Project" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500" />
                  <div className={`absolute bottom-4 ${isRTL ? 'right-4 text-right' : 'left-4 text-left'}`}>
                    <span className="text-[#D5B25D] text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-[#D5B25D]/20">{t("gallery.distinctive")}</span>
                  </div>
                </div>
                
                <div className="relative h-[220px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer">
                  <Image src="/project2.png" alt="MNC Commercial Project" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500" />
                  <div className={`absolute bottom-4 ${isRTL ? 'right-4 text-right' : 'left-4 text-left'}`}>
                    <span className="text-[#D5B25D] text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-[#D5B25D]/20">{t("gallery.distinctive")}</span>
                  </div>
                </div>
              </div>

              {/* Tall Image (Hero) */}
              <div className={`relative h-[350px] sm:h-[450px] md:h-full min-h-[350px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer ${isRTL ? 'order-first md:order-1' : 'order-last md:order-2'}`}>
                <Image src="/hero.png" alt="MNC Engineering" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500" />
                <div className={`absolute bottom-6 ${isRTL ? 'right-6 text-right' : 'left-6 text-left'}`}>
                  <span className="text-[#D5B25D] text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-[#D5B25D]/20">{t("gallery.distinctive")}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Executive Director Section */}
      <section className="py-24 bg-[var(--background)] border-t border-white/5 relative overflow-hidden">
        {/* Soft background ambient light */}
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[300px] h-[300px] bg-[#D5B25D]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className={`relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl ${isRTL ? 'order-last' : 'order-first'}`} data-aos={isRTL ? 'fade-left' : 'fade-right'}>
              <Image
                src={directorImage}
                alt={t("aboutUsPage.ceoSectionTitle")}
                fill
                className="object-cover"
                unoptimized={directorImage.startsWith('http')}
              />
            </div>

            {/* Text Content */}
            <div className={`space-y-6 lg:space-y-8 ${isRTL ? 'order-first text-right' : 'order-last text-left'}`} data-aos={isRTL ? 'fade-right' : 'fade-left'}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h2 className="text-3xl md:text-4xl font-black text-white font-heading mb-4" data-aos="fade-up" data-aos-delay="100">
                  {t("aboutUsPage.ceoSectionTitle")}
                </h2>
                <div className={`w-16 h-1 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] ${isRTL ? 'mr-0 ml-auto lg:mr-0' : 'ml-0 mr-auto lg:ml-0'} mb-6 lg:mb-8 rounded-full`}></div>
                
                <div className="space-y-6 text-base md:text-lg leading-relaxed text-white/70 font-medium">
                  <p>
                    {t("aboutUsPage.ceoSectionText")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="container mx-auto px-6 max-w-7xl mt-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#D5B25D]"></span>
              <span className="text-[#D5B25D] font-bold tracking-widest uppercase text-xs">
                {t("aboutUsPage.teamBadge")}
              </span>
              <span className="h-px w-8 bg-[#D5B25D]"></span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-white leading-tight">
              {t("aboutUsPage.teamTitle")}
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed font-medium">
              {t("aboutUsPage.teamDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Team Card 1 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 hover:border-[#D5B25D]/30 transition-all duration-500 bg-white/5" data-aos="fade-up" data-aos-delay="100">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/asstes/shorka1.png"
                  alt="MNC Team"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Fixed White-text overlay bug by using dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className={`absolute bottom-0 ${isRTL ? 'left-0 text-right' : 'right-0 text-left'} w-full p-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500`}>
                  <h3 className="text-white font-bold text-xl md:text-2xl mb-2">
                    {t("aboutUsPage.teamStaffTitle")}
                  </h3>
                  <p className="text-[#D5B25D] text-sm md:text-base font-semibold">
                    {t("aboutUsPage.teamStaffDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Card 2 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 hover:border-[#D5B25D]/30 transition-all duration-500 bg-white/5" data-aos="fade-up" data-aos-delay="200">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/asstes/shorka2.png"
                  alt="MNC Team"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Fixed White-text overlay bug by using dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className={`absolute bottom-0 ${isRTL ? 'left-0 text-right' : 'right-0 text-left'} w-full p-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500`}>
                  <h3 className="text-white font-bold text-xl md:text-2xl mb-2">
                    {t("aboutUsPage.teamFieldTitle")}
                  </h3>
                  <p className="text-[#D5B25D] text-sm md:text-base font-semibold">
                    {t("aboutUsPage.teamFieldDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          Riyadh Branch Gallery Section
      ══════════════════════════════════════ */}
      <section className="py-24 bg-[var(--background)] border-t border-white/5 relative overflow-hidden">
        {/* Gold ambient glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#D5B25D]/5 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-[#D5B25D]/4 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">

          {/* ── Section Header ── */}
          <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D5B25D]" />
              <span className="text-[#D5B25D] font-bold tracking-[4px] uppercase text-[11px]">
                {t('contactPage.riyadhBranch')}
              </span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D5B25D]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white font-heading mb-4 leading-tight">
              {t('aboutUsPage.riyadhGalleryTitle')}
            </h2>
            <p className="text-white/50 text-sm md:text-base leading-relaxed">
              {t('contactPage.riyadhAddress')}
            </p>
            <div className="w-20 h-[3px] bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] mx-auto mt-8 rounded-full" />
          </div>

          {/* ── Photo Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">

            {/* Photos — 6 cards, 3×2 grid */}
            {riyadhPhotos.slice(0, 6).map((photo, i) => (
              <div
                key={i}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/8 hover:border-[#D5B25D]/40 transition-all duration-500 shadow-xl bg-white/[0.02] cursor-zoom-in aspect-[4/3]"
                data-aos="fade-up"
                data-aos-delay={`${(i % 3) * 80}`}
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Hover gold top accent */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Zoom icon */}
                <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                  <ZoomIn size={13} className="text-[#D5B25D]" />
                </div>

                {/* Hover label */}
                <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}>
                  <span className="text-[#D5B25D] text-[10px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#D5B25D]/20">
                    {t('contactPage.riyadhBranch')}
                  </span>
                </div>
              </div>
            ))}

          </div>

          {/* ── Bottom gold divider ── */}
          <div className="flex items-center gap-4 mt-16" data-aos="fade-up">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2 px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D5B25D]/40" />
              <div className="w-2 h-2 rounded-full bg-[#D5B25D]/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#D5B25D]/40" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-[var(--background)] border-t border-white/5 relative overflow-hidden">
        {/* Glowing gold ambient light behind content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#D5B25D]/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(to right, #D5B25D 1px, transparent 1px), linear-gradient(to bottom, #D5B25D 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />

        <div className="container relative z-10 mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 font-heading leading-tight" data-aos="fade-up">
            {t("aboutUsPage.ctaTitle")}
          </h2>
          <Link href="/contact" className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] text-black font-black px-10 py-4.5 rounded-full text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(213,178,93,0.3)] hover:shadow-[0_0_40px_rgba(213,178,93,0.5)] cursor-pointer" data-aos="fade-up" data-aos-delay="200">
            <span>{t("aboutUsPage.ctaBtn")}</span>
            {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </Link>
        </div>
      </section>
      {/* ══════════════════════════════════════
          Photo Lightbox Modal
      ══════════════════════════════════════ */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all duration-200"
            aria-label={t('aboutUsPage.closeLabel')}
          >
            <X size={18} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-bold tracking-widest select-none">
            {lightboxIndex + 1} / {riyadhPhotos.length}
          </div>

          {/* Prev arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); isRTL ? nextPhoto() : prevPhoto(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 hover:border-[#D5B25D]/40 transition-all duration-200 z-10"
            aria-label={t('aboutUsPage.previousLabel')}
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); isRTL ? prevPhoto() : nextPhoto(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 hover:border-[#D5B25D]/40 transition-all duration-200 z-10"
            aria-label={t('aboutUsPage.nextLabel')}
          >
            <ChevronRight size={22} />
          </button>

          {/* Image */}
          <div
            className="relative mx-14 my-12 max-w-[88vw] max-h-[88vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={riyadhPhotos[lightboxIndex].src}
              alt={riyadhPhotos[lightboxIndex].alt}
              className="max-w-full max-h-[88vh] w-auto h-auto rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] border border-white/8 object-contain"
              style={{ display: 'block' }}
            />
            {/* Gold bottom label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-[#D5B25D]/20 whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D5B25D]" />
              <span className="text-[#D5B25D] text-[11px] font-bold uppercase tracking-[3px]">
                MNC · {t('contactPage.riyadhBranch')}
              </span>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 max-w-[90vw] overflow-x-auto pb-1">
            {riyadhPhotos.map((p, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200"
                style={{ borderColor: i === lightboxIndex ? '#D5B25D' : 'rgba(255,255,255,0.1)' }}
              >
                <img src={p.src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
