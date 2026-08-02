"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { FaHardHat, FaDraftingCompass, FaProjectDiagram, FaCouch } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const Services = () => {
  const { lang, t } = useLanguage();

  const services = [
    {
      title: t("servicesSection.items.construction.title"),
      description: t("servicesSection.items.construction.desc"),
      icon: <FaHardHat size={38} />,
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
    <section id="services" className="py-16 md:py-20 bg-[var(--card-bg)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/architectural-layout.png')]"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-secondary"></span>
            <span className="text-secondary font-bold tracking-widest uppercase text-xs">
              {t("servicesSection.badge")}
            </span>
            <span className="h-px w-8 bg-secondary"></span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-[var(--foreground)] leading-tight" data-aos="fade-up" data-aos-delay="100">
            {t("servicesSection.titlePart1")}<span className="text-secondary">{t("servicesSection.titlePart2")}</span>{t("servicesSection.titlePart3")}
          </h2>
          <p className="text-[var(--foreground)] text-base md:text-lg leading-relaxed" data-aos="fade-up" data-aos-delay="200">
            {t("servicesSection.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link
              key={index}
              href={`/services/${service.slug}`}
              className="group bg-[var(--background)] p-5 sm:p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(197,160,89,0.12)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 border border-[var(--card-border)] relative overflow-hidden flex flex-col items-center text-center -translate-y-2 hover:translate-y-0 cursor-pointer"
              data-aos="fade-up"
              data-aos-delay={service.delay}
            >
              {/* Permanent Top Border */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary/80"></div>

              {/* Icon Container */}
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 relative z-10 transition-all duration-500 group-hover:scale-105"
                style={{ background: "rgba(213,178,93,0.1)", border: "1px solid rgba(213,178,93,0.25)" }}
              >
                <div className="text-secondary group-hover:text-secondary/90 transition-colors duration-300">
                  {service.icon}
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-black mb-3 text-secondary group-hover:text-[var(--foreground)] transition-colors duration-500 animate-in fade-in">
                {service.title}
              </h3>
              <p className="text-[var(--foreground)]/60 text-sm leading-relaxed mb-6 font-medium">
                {service.description}
              </p>

              {/* Learn More indicator — decorative now, the whole card is the link */}
              <span className="mt-auto pt-4 flex items-center gap-2 text-secondary text-xs font-black uppercase tracking-widest transition-all duration-500 group-hover:gap-3">
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
