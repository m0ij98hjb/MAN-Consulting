"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import Button from "../ui/Button";
import TypewriterText from "@/components/TypewriterText";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import BackgroundMusicButton from "@/components/ui/BackgroundMusicButton";
import CounterStat from "@/components/ui/CounterStat";
import { siteStats, getStatLabel } from "@/lib/siteConfig";
import { useSiteContent } from "@/hooks/useSiteContent";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";

const Hero = () => {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar' || lang === 'ur';
  const { data: homeCms } = useSiteContent('home');
  const statProjects = homeCms?.stat_projects ?? siteStats.projects.value;
  const statSatisfaction = homeCms?.stat_satisfaction ?? siteStats.satisfaction.value;
  const statDesigns = homeCms?.stat_designs ?? siteStats.designs.value;

  const heroImages = [
    "/asstes/office-projects/ph-hero/image1.jpg",
    "/asstes/office-projects/ph-hero/image2.jpg",
    "/asstes/office-projects/ph-hero/image3.jpg",
    "/asstes/office-projects/ph-hero/image4.png",
    "/asstes/office-projects/ph-hero/image5.jpg",
    "/asstes/office-projects/ph-hero/image6.jpg",
    "/asstes/office-projects/ph-hero/image7.jpg",
    "/asstes/office-projects/ph-hero/image8.jpg",
    "/asstes/office-projects/ph-hero/image9.jpg",
    "/asstes/office-projects/ph-hero/image10.jpg",
    "/asstes/office-projects/ph-hero/image11.jpeg",
    "/asstes/office-projects/ph-hero/image12.jpg",
    "/asstes/office-projects/ph-hero/image13.jpg",
    "/asstes/office-projects/ph-hero/image14.jpg",
    "/asstes/office-projects/ph-hero/image15.jpg",
    "/asstes/office-projects/ph-hero/image16.jpg",
    "/asstes/office-projects/ph-hero/image17.jpg",
    

  ];

  // With effect="fade", every slide sits at the same rect (only opacity
  // toggles, nothing is translated off-screen), so the browser's native lazy
  // loading treats all of them as "in viewport" and fetches all 11 images
  // immediately. Only mount the <Image> for slides that have actually been
  // shown (or are one transition away), and swap in a plain color panel for
  // the rest — the fade visual is unchanged, but 9 of 11 requests are
  // deferred until the carousel actually reaches them. Each slide change
  // pre-loads one slide ahead so the next fade transition never shows blank.
  const [loadedSlides, setLoadedSlides] = useState(() => new Set([0, 1]));
  const handleSlideChange = (swiper) => {
    const i = swiper.realIndex;
    const j = (i + 1) % heroImages.length;
    setLoadedSlides((prev) => {
      if (prev.has(i) && prev.has(j)) return prev;
      const next = new Set(prev);
      next.add(i);
      next.add(j);
      return next;
    });
  };

  // Memoized so TypewriterText's effect (keyed on `texts` by reference) doesn't
  // see a "new" array on every Hero re-render — e.g. when the useSiteContent
  // CMS fetch above resolves — which was resetting the typewriter mid-animation.
  const mobileTaglineTexts = useMemo(
    () => [t('hero.taglineLine1'), t('hero.taglineLine2'), t('hero.taglineLine3')],
    [lang] // eslint-disable-line react-hooks/exhaustive-deps -- t()'s output only depends on lang; t itself isn't a stable reference
  );
  const desktopTaglineTexts = useMemo(
    () => ({
      ar: ["حلول هندسية", "مبنية على الخبرة", "خبرة منذ عام 1986"], en: ["Engineering Solutions", "Built on Experience", "Experience Since 1986"],
      zh: ["工程解决方案", "基于丰富经验", "自1986年经验"], es: ["Soluciones de Ingeniería", "Construidas sobre la Experiencia", "Experiencia Desde 1986"],
      fr: ["Solutions d'Ingénierie", "Fondées sur l'Expérience", "Expérience Depuis 1986"], de: ["Ingenieurlösungen", "Gebaut auf Erfahrung", "Erfahrung Seit 1986"],
      tr: ["Mühendislik Çözümleri", "Deneyim Üzerine İnşa Edildi", "1986'dan Beri Deneyim"], ur: ["انجینئرنگ حل", "تجربے کی بنیاد پر", "1986 سے تجربہ"],
      hi: ["इंजीनियरिंग समाधान", "अनुभव पर निर्मित", "1986 से अनुभव"], ru: ["Инженерные решения", "Построенные на опыте", "Опыт с 1986 года"]
    }[lang] || ["Engineering Solutions", "Built on Experience", "Experience Since 1986"]),
    [lang]
  );

  const descFallback = t('hero.liveDescription');
  const descText = isRTL
    ? (homeCms?.hero_sub_ar || descFallback)
    : lang === 'en'
      ? (homeCms?.hero_sub_en || descFallback)
      : descFallback;

  const requestConsultText = t('hero.requestConsultationCta');
  const viewWorksText = t('hero.viewWorkCta');

  return (
    <>
      {/*
        ═══════════════════════════════════════════════
        MOBILE LAYOUT  (hidden on lg+)
        ═══════════════════════════════════════════════
      */}
      <section className="image-hero lg:hidden relative min-h-screen flex flex-col overflow-hidden bg-primary">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            speed={2000}
            loop
            onSlideChange={handleSlideChange}
            className="h-full w-full"
          >
            {heroImages.map((src, idx) => (
              <SwiperSlide key={idx} className="relative h-full w-full overflow-hidden">
                {loadedSlides.has(idx) && (
                  <Image
                    src={src}
                    alt={`MAN Hero Slideshow ${idx + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover object-center opacity-90 animate-slow-zoom"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? "high" : undefined}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute inset-0 bg-black/15 z-10" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-20" />
        </div>

        {/* Main content */}
        <div className="relative z-30 flex flex-col flex-1 justify-center px-5 pt-[100px] pb-6">

          {/* Badge & Music Button Row */}
          <div className="flex items-center justify-between w-full mb-5" data-aos="fade-down" data-aos-delay="100">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-secondary/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
              </span>
              <span className="text-secondary text-xs font-bold tracking-widest uppercase">{t('hero.badge')}</span>
            </div>

            {/* Music button */}
            <div className="flex-shrink-0 z-40">
              <BackgroundMusicButton />
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight w-full"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
          >
            <TypewriterText
              texts={mobileTaglineTexts}
              typingSpeed={120} deletingSpeed={60} pauseDuration={2000} loop
              className="text-white" textClassNames={["", "text-[#D4A843]", "text-[#D4A843]"]}
            />
          </h1>

          {/* Description */}
          <p
            className="text-sm text-white font-medium mb-6 leading-relaxed"
            data-aos="fade-up" data-aos-delay="320"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.95), 0 4px 22px rgba(0,0,0,0.65)" }}
          >
            {descText}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 mb-6" data-aos="fade-up" data-aos-delay="460">
            <Button
              as={Link}
              href="/contact"
              size="lg"
              className="flex-1 flex items-center justify-center text-sm font-bold rounded-[4px] border border-white hover:bg-[#f2f2f2] py-3"
              style={{ backgroundColor: '#ffffff', color: '#000000' }}
            >
              {requestConsultText}
            </Button>
            <Button
              as={Link}
              href="/projects"
              variant="outline"
              size="lg"
              className="flex-1 flex items-center justify-center text-sm font-bold rounded-[4px] border border-white text-white hover:bg-white hover:text-slate-950 py-3"
            >
              {viewWorksText}
            </Button>
          </div>

          <div
            className="grid grid-cols-3 gap-2 py-4 mb-6 border-y border-white/10"
            data-aos="fade-up"
            data-aos-delay="520"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-black text-white leading-none">+{statProjects}</div>
              <span className="text-[10px] sm:text-xs text-white/60 mt-1.5 font-medium">{getStatLabel('projects', lang)}</span>
            </div>
            <div className="flex flex-col items-center text-center border-x border-white/10">
              <div className="text-2xl font-black text-white leading-none">{statSatisfaction}%</div>
              <span className="text-[10px] sm:text-xs text-white/60 mt-1.5 font-medium">{getStatLabel('satisfaction', lang)}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-black text-white leading-none">+{statDesigns}</div>
              <span className="text-[10px] sm:text-xs text-white/60 mt-1.5 font-medium">{getStatLabel('designs', lang)}</span>
            </div>
          </div>

        </div>
      </section>

      <section id="home" className="image-hero hidden lg:flex relative h-screen min-h-[700px] items-center overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0 h-full w-full">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            speed={2000}
            loop
            onSlideChange={handleSlideChange}
            className="h-full w-full"
          >
            {heroImages.map((src, idx) => (
              <SwiperSlide key={idx} className="relative h-full w-full overflow-hidden">
                {loadedSlides.has(idx) && (
                  <Image
                    src={src}
                    alt={`MAN Hero Slideshow ${idx + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover object-center opacity-90 animate-slow-zoom"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? "high" : undefined}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute inset-0 bg-black/15 z-10" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-20" />
        </div>

        {/* Sound Icon - start side middle (right for Arabic, left for other languages) */}
        <div className={`absolute ${isRTL ? 'left-8' : 'right-8'} top-1/2 -translate-y-1/2 z-40`}>
          <BackgroundMusicButton />
        </div>

        <div className="container mx-auto px-6 relative z-30">
          {/* Engineering Excellence - Desktop only */}



          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-secondary/30 mb-8" data-aos="fade-down" data-aos-delay="200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
            </span>
            <span className="text-secondary text-sm font-bold tracking-widest uppercase">{t('hero.badge')}</span>
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            style={{ textShadow: "0 4px 16px rgba(0,0,0,0.7)" }}
          >
            <TypewriterText
              texts={desktopTaglineTexts}
              typingSpeed={120} deletingSpeed={60} pauseDuration={2000} loop
              className="text-white" textClassNames={["", "text-[#D4A843]", "text-[#D4A843]"]}
            />
          </h1>

          <p
            className="text-base md:text-xl text-white font-semibold mb-10 max-w-2xl leading-relaxed"
            data-aos="fade-up" data-aos-delay="600"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.95), 0 4px 22px rgba(0,0,0,0.65)" }}
          >
            {descText}
          </p>

          <div className="flex flex-row gap-4 mb-10" data-aos="fade-up" data-aos-delay="800">
            <Button
              as={Link}
              href="/contact"
              size="lg"
              className="flex items-center justify-center text-base font-bold rounded-[4px] border border-white hover:bg-[#f2f2f2] px-8 py-3.5"
              style={{ backgroundColor: '#ffffff', color: '#000000' }}
            >
              {requestConsultText}
            </Button>
            <Button
              as={Link}
              href="/projects"
              variant="outline"
              size="lg"
              className="flex items-center justify-center text-base font-bold rounded-[4px] border border-white text-white hover:bg-white hover:text-slate-950 px-8 py-3.5"
            >
              {viewWorksText}
            </Button>
          </div>

          <div
            className="flex flex-row items-center gap-8 lg:gap-14 mb-10 max-w-xl border-y border-white/10 py-6"
            data-aos="fade-up"
            data-aos-delay="900"
          >
            <CounterStat
              value={statProjects}
              label={getStatLabel('projects', lang)}
              suffix="+"
              aosDeley="900"
            />
            <div className="w-px h-10 bg-white/20" />
            <CounterStat
              value={statSatisfaction}
              label={getStatLabel('satisfaction', lang)}
              suffix="%"
              aosDeley="950"
            />
            <div className="w-px h-10 bg-white/20" />
            <CounterStat
              value={statDesigns}
              label={getStatLabel('designs', lang)}
              suffix="+"
              aosDeley="1000"
            />
          </div>

        </div>
      </section>
    </>
  );
};

export default Hero;
