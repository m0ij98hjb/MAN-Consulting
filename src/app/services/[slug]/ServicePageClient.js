"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { SERVICES_DATA } from "@/lib/servicesData";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Phone,
  Award, ShieldCheck, Clock, Users,
  Lightbulb, Target, Monitor, Eye,
  BarChart2, Calculator, FileText,
  Palette, Layers, DollarSign, Package,
} from "lucide-react";

const ICONS_MAP = {
  Award, ShieldCheck, Clock, Users,
  Lightbulb, Target, Monitor, Eye,
  BarChart2, Calculator, FileText,
  Palette, Layers, DollarSign, Package,
};

const ICON_SETS = {
  contracting: [Award, ShieldCheck, Clock, Users],
  "architectural-design": [Lightbulb, Target, Monitor, Eye],
  "project-management": [BarChart2, Calculator, Clock, FileText],
  "interior-design": [Palette, Layers, DollarSign, Package],
};

export default function ServicePageClient({ slug }) {
  const { lang, isRTL } = useLanguage();

  const serviceData = SERVICES_DATA[slug];
  if (!serviceData) return null;

  const isRTLLang = lang === "ar" || lang === "ur";
  const content =
    serviceData.content[lang] ||
    serviceData.content.en ||
    serviceData.content.ar;

  const icons = ICON_SETS[slug] || [Award, ShieldCheck, Clock, Users];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-cairo" dir={isRTLLang ? "rtl" : "ltr"}>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="image-hero relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={serviceData.heroImage}
            alt={content.title}
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className={`absolute inset-0 ${isRTLLang ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-black/70 to-transparent`} />
        </div>

        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent z-10" />
        <div
          className="absolute inset-0 opacity-[0.04] z-0"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,#D5B25D 0px,#D5B25D 1px,transparent 1px,transparent 80px)" }}
        />

        <div className="container relative z-10 mx-auto px-6 max-w-7xl pt-24 md:pt-28">
          <div className={isRTLLang ? "text-right" : "text-left"} data-aos="fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-[#D5B25D]/30 rounded-full px-5 py-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D5B25D] animate-pulse" />
              <span className="text-[#D5B25D] text-xs font-bold tracking-widest uppercase">{content.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 font-heading leading-tight">
              {content.title}
            </h1>
            <p className="text-[#D5B25D] text-lg md:text-2xl font-bold mb-6">{content.subtitle}</p>
            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mb-10 font-medium">
              {content.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] text-black font-black px-8 py-4 rounded-full text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(213,178,93,0.3)]"
              >
                {content.ctaBtn}
                {isRTLLang ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </Link>
              <a
                href="#offerings"
                className="inline-flex items-center gap-3 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-300 hover:border-[#D5B25D] hover:text-[#D5B25D]"
              >
                {{ ar: "استكشف التفاصيل", en: "Explore Details", hi: "विवरण देखें", ru: "Исследовать детали", de: "Details erkunden", fr: "Explorer les détails", es: "Explorar detalles", tr: "Detayları Keşfet", ur: "تفصیلات دیکھیں", zh: "探索细节" }[lang] || "Explore Details"}
                {isRTLLang ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
      </section>

      {/* ═══════ OFFERINGS ═══════ */}
      <section id="offerings" className="py-24 bg-[var(--card-bg)]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#D5B25D]" />
              <span className="text-[#D5B25D] font-bold tracking-widest uppercase text-xs">{content.badge}</span>
              <span className="h-px w-8 bg-[#D5B25D]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--foreground)] font-heading mb-4">
              {content.offeringsTitle}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.offerings.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-[var(--background)] p-5 rounded-2xl border border-[var(--card-border)] hover:border-[#D5B25D]/30 transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={i * 70}
              >
                <div className="w-8 h-8 rounded-lg bg-[#D5B25D]/10 border border-[#D5B25D]/20 flex items-center justify-center shrink-0 group-hover:bg-[#D5B25D]/20 transition-colors mt-0.5">
                  <CheckCircle2 className="text-[#D5B25D]" size={16} />
                </div>
                <p className="text-[var(--foreground)]/80 text-sm md:text-base leading-relaxed font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ADVANTAGES ═══════ */}
      <section className="py-24 bg-[var(--background)]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-black text-[var(--foreground)] font-heading mb-4">
              {content.advantagesTitle}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.advantages.map((adv, i) => {
              const Icon = icons[i] || Award;
              return (
                <div
                  key={i}
                  className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] hover:border-[#D5B25D]/30 transition-all duration-300 group text-center"
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#D5B25D]/10 border border-[#D5B25D]/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#D5B25D]/20 transition-colors">
                    <Icon className="text-[#D5B25D]" size={26} />
                  </div>
                  <h3 className="font-black text-lg text-[#D5B25D] mb-3">{adv.title}</h3>
                  <p className="text-[var(--foreground)]/65 text-sm leading-relaxed">{adv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ PROJECTS SHOWCASE ═══════ */}
      <section className="py-24 bg-black/40 border-y border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 font-heading">
              {content.projectsTitle}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(content.projects || []).map((proj, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden aspect-4/3 border border-white/10 shadow-2xl"
                data-aos="fade-up"
                data-aos-delay={idx * 150}
              >
                <Image
                  src={proj.img}
                  alt={proj.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
                  <p className="text-white/70 text-xs line-clamp-2">{proj.desc}</p>
                </div>
                <div className={`absolute bottom-4 ${isRTLLang ? "right-4" : "left-4"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                  <span className="text-[#D5B25D] text-xs font-bold uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full border border-[#D5B25D]/20">
                    {{ ar: "مشروع متميز", en: "Featured Project", hi: "प्रमुख परियोजना", ru: "Рекомендуемый проект", de: "Hervorragendes Projekt", es: "Proyecto destacado", fr: "Projet en vedette", tr: "Öne Çıkan Proje", ur: "نمایاں منصوبہ", zh: "特色项目" }[lang] || "Featured Project"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-28 bg-[#060E1A] relative overflow-hidden">
        {/* Diagonal texture */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#D5B25D 0px,#D5B25D 1px,transparent 1px,transparent 80px)" }} />
        {/* Top & bottom gold lines */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent" />
        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D5B25D]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-6">
          <div
            className="max-w-4xl mx-auto rounded-3xl border-2 border-[#D5B25D]/25 bg-gradient-to-br from-[#D5B25D]/10 via-[#D5B25D]/5 to-transparent p-10 md:p-16 text-center shadow-[0_0_100px_rgba(213,178,93,0.12),inset_0_1px_0_rgba(213,178,93,0.15)]"
            data-aos="fade-up"
          >
            {/* Title */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 font-heading leading-tight">
              {content.ctaTitle}
            </h2>

            {/* Subtitle */}
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              {{ ar: "فريقنا جاهز للاستماع إليك ومساعدتك في تحويل فكرتك إلى مشروع واقعي ناجح",
                 en: "Our team is ready to listen and help you turn your idea into a successful real project",
                 hi: "हमारी टीम सुनने और आपके विचार को एक सफल वास्तविक परियोजना में बदलने में मदद करने के लिए तैयार है",
                 ru: "Наша команда готова выслушать вас и помочь превратить вашу идею в успешный реальный проект",
                 de: "Unser Team steht bereit, Ihre Idee in ein erfolgreiches reales Projekt zu verwandeln",
                 es: "Nuestro equipo está listo para escuchar y ayudar a convertir su idea en un proyecto real y exitoso",
                 fr: "Notre équipe est prête à vous écouter et à concrétiser votre idée en un projet réussi",
                 tr: "Ekibimiz sizi dinlemeye ve fikrinizi başarılı bir projeye dönüştürmeye hazır",
                 ur: "ہماری ٹیم آپ کی بات سننے اور آپ کے خیال کو ایک کامیاب واقعی منصوبے میں بدلنے کے لیے تیار ہے",
                 zh: "我们的团队随时准备倾听并帮助您将想法转化为成功的实际项目" }[lang] || "Our team is ready to listen and help you turn your idea into a successful real project"}
            </p>

            {/* Divider */}
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent mx-auto mb-10" />

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] text-black font-black px-10 py-4 rounded-full text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(213,178,93,0.4)] hover:shadow-[0_0_50px_rgba(213,178,93,0.55)]"
              >
                <Phone size={18} />
                {content.ctaBtn}
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-3 border-2 border-[#D5B25D]/35 text-[#D5B25D] font-bold px-10 py-4 rounded-full text-base transition-all duration-300 hover:bg-[#D5B25D]/10 hover:border-[#D5B25D]/60"
              >
                {{ ar: "عرض جميع المشاريع", en: "View All Projects", hi: "सभी परियोजनाएं देखें", ru: "Посмотреть все проекты", de: "Alle Projekte anzeigen", fr: "Voir tous les projets", es: "Ver todos los proyectos", tr: "Tüm Projeleri Görüntüle", ur: "تمام منصوبے دیکھیں", zh: "查看所有项目" }[lang] || "View All Projects"}
                {isRTLLang ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
