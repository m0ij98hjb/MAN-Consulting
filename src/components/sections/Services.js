"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { FaRulerCombined, FaDraftingCompass, FaProjectDiagram, FaCouch } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const Services = () => {
  const { lang, t } = useLanguage();

  const services = [
    {
      title: t("servicesSection.items.construction.title"),
      description: t("servicesSection.items.construction.desc"),
      icon: <FaRulerCombined size={38} />,
      delay: "100",
      slug: "contracting",
    },
    {
      title: t("servicesSection.items.architecture.title"),
      description: t("servicesSection.items.architecture.desc"),
      icon: <FaDraftingCompass size={38} />,
      delay: "200",
      slug: "architectural-design",
    },
    {
      title: t("servicesSection.items.management.title"),
      description: t("servicesSection.items.management.desc"),
      icon: <FaProjectDiagram size={38} />,
      delay: "300",
      slug: "project-management",
    },
    {
      title: t("servicesSection.items.interior.title"),
      description: t("servicesSection.items.interior.desc"),
      icon: <FaCouch size={38} />,
      delay: "400",
      slug: "interior-design",
    },
  ];

  return (
    <section id="services" className="py-16 md:py-20 bg-[var(--background)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/architectural-layout.png')]"></div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-[#D4A843]"></span>
            <span className="text-[#D4A843] font-bold tracking-widest uppercase text-xs">
              {t("servicesSection.badge")}
            </span>
            <span className="h-px w-8 bg-[#D4A843]"></span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-white leading-tight" data-aos="fade-up" data-aos-delay="100">
            {t("servicesSection.titlePart1")}<span className="text-[#D4A843]">{t("servicesSection.titlePart2")}</span>{t("servicesSection.titlePart3")}
          </h2>
          <p className="text-white/60 text-base md:text-lg leading-relaxed" data-aos="fade-up" data-aos-delay="200">
            {t("servicesSection.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link
              key={index}
              href={`/services/${service.slug}`}
              className="group bg-[#44474F] p-5 sm:p-6 md:p-8 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.30)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.40),0_0_40px_rgba(212,168,67,0.12)] transition-all duration-500 border border-[rgba(212,168,67,0.16)] hover:border-[rgba(212,168,67,0.40)] border-b-2 border-b-[#D4A843] relative overflow-hidden flex flex-col items-center text-center -translate-y-1 hover:translate-y-0 cursor-pointer"
              data-aos="fade-up"
              data-aos-delay={service.delay}
            >
              {/* Icon Container — small square icon badge with gold fill */}
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 relative z-10 transition-all duration-500 group-hover:scale-105"
                style={{ background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.35)" }}
              >
                <div className="text-[#D4A843] group-hover:text-[#E8C46A] transition-colors duration-300">
                  {service.icon}
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-black mb-3 text-white group-hover:text-[#D4A843] transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed mb-6 font-normal">
                {service.description}
              </p>

              {/* Learn More indicator */}
              <span className="mt-auto pt-4 flex items-center gap-2 text-[#D4A843] text-xs font-black uppercase tracking-widest transition-all duration-500 group-hover:gap-3">
                {t("servicesSection.learnMore")}
                {lang === 'ar' || lang === 'ur' ? <ArrowRight size={14} className="rotate-180" /> : <ArrowRight size={14} />}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
