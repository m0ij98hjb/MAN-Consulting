"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Lightbulb, Users, Clock } from "lucide-react";

const WhyChooseUs = () => {
  const { t, lang, isRTL } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      title: t('features.precision.title'),
      desc: t('features.precision.desc'),
      delay: "100",
      num: "01",
    },
    {
      icon: Lightbulb,
      title: t('features.innovation.title'),
      desc: t('features.innovation.desc'),
      delay: "200",
      num: "02",
    },
    {
      icon: Users,
      title: t('features.management.title'),
      desc: t('features.management.desc'),
      delay: "300",
      num: "03",
    },
    {
      icon: Clock,
      title: t('features.deadlines.title'),
      desc: t('features.deadlines.desc'),
      delay: "400",
      num: "04",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-[var(--background)] relative overflow-hidden">

      {/* Background ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D5B25D]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/10 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D5B25D]" />
            <span className="text-[#D5B25D] font-bold tracking-[0.2em] uppercase text-[11px]">
              {{
                ar: "مميزاتنا", en: "Our Strengths", zh: "我们的优势",
                es: "Nuestras fortalezas", fr: "Nos atouts", de: "Unsere Stärken",
                tr: "Güçlü Yönlerimiz", ur: "ہماری خصوصیات",
                hi: "हमारी ताकत", ru: "Наши преимущества",
              }[lang] || "Our Strengths"}
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D5B25D]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            {{
              ar: <>لماذا تختار <span className="text-[#D5B25D]">MNC</span>؟</>,
              en: <>Why Choose <span className="text-[#D5B25D]">MNC</span>?</>,
              zh: <>为什么选择 <span className="text-[#D5B25D]">MNC</span>？</>,
              es: <>¿Por qué elegir <span className="text-[#D5B25D]">MNC</span>?</>,
              fr: <>Pourquoi choisir <span className="text-[#D5B25D]">MNC</span> ?</>,
              de: <>Warum <span className="text-[#D5B25D]">MNC</span> wählen?</>,
              tr: <>Neden <span className="text-[#D5B25D]">MNC</span>?</>,
              ur: <>کیوں منتخب کریں <span className="text-[#D5B25D]">MNC</span>؟</>,
              hi: <>क्यों चुनें <span className="text-[#D5B25D]">MNC</span>?</>,
              ru: <>Почему выбирают <span className="text-[#D5B25D]">MNC</span>?</>,
            }[lang] || <>Why Choose <span className="text-[#D5B25D]">MNC</span>?</>}
          </h2>

          <p className="text-white/45 text-base leading-relaxed">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl p-6 flex flex-col gap-5 overflow-hidden transition-all duration-500 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(213,178,93,0.1)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(213,178,93,0.05)";
                  e.currentTarget.style.border = "1px solid rgba(213,178,93,0.25)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(213,178,93,0.08), 0 20px 60px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                  e.currentTarget.style.border = "1px solid rgba(213,178,93,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                data-aos="fade-up"
                data-aos-delay={feature.delay}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Number watermark */}
                <span className={`absolute top-4 ${isRTL ? 'left-5' : 'right-5'} text-5xl font-black text-white/[0.04] group-hover:text-[#D5B25D]/[0.07] transition-colors duration-500 select-none leading-none`}>
                  {feature.num}
                </span>

                {/* Icon */}
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shrink-0"
                  style={{ background: "rgba(213,178,93,0.1)", border: "1px solid rgba(213,178,93,0.2)" }}
                >
                  <Icon size={22} className="text-[#D5B25D] transition-transform duration-500 group-hover:scale-110" />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-white font-bold text-base leading-snug group-hover:text-[#D5B25D] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/55 transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/0 to-transparent group-hover:via-[#D5B25D]/20 transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
