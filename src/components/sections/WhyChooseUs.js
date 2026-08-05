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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4A843]" />
            <span className="text-[#D4A843] font-bold tracking-[0.2em] uppercase text-[11px]">
              {{
                ar: "مميزاتنا", en: "Our Strengths", zh: "我们的优势",
                es: "Nuestras fortalezas", fr: "Nos atouts", de: "Unsere Stärken",
                tr: "Güçlü Yönlerimiz", ur: "ہماری خصوصیات",
                hi: "हमारी ताकत", ru: "Наши преимущества",
              }[lang] || "Our Strengths"}
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4A843]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            {{
              ar: <>لماذا تختار <span className="text-[#D4A843]">MAN</span>؟</>,
              en: <>Why Choose <span className="text-[#D4A843]">MAN</span>?</>,
              zh: <>为什么选择 <span className="text-[#D4A843]">MAN</span>？</>,
              es: <>¿Por qué elegir <span className="text-[#D4A843]">MAN</span>?</>,
              fr: <>Pourquoi choisir <span className="text-[#D4A843]">MAN</span> ?</>,
              de: <>Warum <span className="text-[#D4A843]">MAN</span> wählen?</>,
              tr: <>Neden <span className="text-[#D4A843]">MAN</span>?</>,
              ur: <>کیوں منتخب کریں <span className="text-[#D4A843]">MAN</span>؟</>,
              hi: <>क्यों चुनें <span className="text-[#D4A843]">MAN</span>?</>,
              ru: <>Почему выбирают <span className="text-[#D4A843]">MAN</span>?</>,
            }[lang] || <>Why Choose <span className="text-[#D4A843]">MAN</span>?</>}
          </h2>

          <p className="text-white/50 text-base leading-relaxed">
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
                className="group relative rounded-2xl p-6 flex flex-col gap-5 overflow-hidden transition-all duration-500 cursor-default border-b-2 border-b-[#D4A843]"
                style={{
                  background: "#44474F",
                  borderTop: "1px solid rgba(212,168,67,0.16)",
                  borderLeft: "1px solid rgba(212,168,67,0.16)",
                  borderRight: "1px solid rgba(212,168,67,0.16)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.30)",
                }}
                data-aos="fade-up"
                data-aos-delay={feature.delay}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#D4A843]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Number watermark */}
                <span className={`absolute top-4 ${isRTL ? 'left-5' : 'right-5'} text-5xl font-black text-white/[0.04] group-hover:text-[#D4A843]/[0.07] transition-colors duration-500 select-none leading-none`}>
                  {feature.num}
                </span>

                {/* Icon badge */}
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shrink-0"
                  style={{ background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.35)" }}
                >
                  <Icon size={22} className="text-[#D4A843] transition-transform duration-500 group-hover:scale-110" />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-white font-bold text-base leading-snug group-hover:text-[#D4A843] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
