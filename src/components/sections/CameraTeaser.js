"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import CameraPreview from "@/components/ui/CameraPreview";

export default function CameraTeaser() {
  const { lang, isRTL } = useLanguage();
  const [inputCode, setInputCode]       = useState("");
  const [submittedCode, setSubmittedCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed) setSubmittedCode(trimmed);
  };

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >

      {/* Blueprint grid */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(213,178,93,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(213,178,93,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
      }} />

      {/* Ambient glows + separator lines */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/10 to-transparent" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#D5B25D]/[0.03] blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Text Side (right in RTL) ── */}
          <div className="w-full lg:w-1/2" data-aos="fade-up">

            {/* Eyebrow — same pattern as Vision section */}
            <div className={`inline-flex items-center gap-3 mb-5 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D5B25D]" />
              <span className="text-[#D5B25D] font-bold tracking-[0.2em] uppercase text-[11px]">
                {{ ar: "شفافية كاملة", en: "Full Transparency", zh: "完全透明",
                   fr: "Transparence totale", es: "Transparencia total",
                   de: "Volle Transparenz", tr: "Tam Şeffaflık", ur: "مکمل شفافیت",
                   hi: "पूर्ण पारदर्शिता", ru: "Полная прозрачность" }[lang] || "Full Transparency"}
              </span>
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D5B25D]" />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4" data-aos="fade-up" data-aos-delay="100">
              <span className="text-white block">
                {{ ar: "تابع مشروعك", en: "Track Your Project", zh: "跟踪您的项目",
                   fr: "Suivez votre projet", es: "Sigue tu proyecto",
                   de: "Ihr Projekt live", tr: "Projenizi Takip Edin", ur: "اپنا منصوبہ ٹریک کریں",
                   hi: "अपनी परियोजना को ट्रैक करें", ru: "Отслеживайте ваш проект" }[lang] || "Track Your Project"}
              </span>
              <span className="text-gradient">
                {{ ar: "مباشرةً", en: "Live", zh: "实时", fr: "En direct",
                   es: "En vivo", de: "Jetzt", tr: "Canlı", ur: "براہ راست",
                   hi: "लाइव", ru: "В прямом эфире" }[lang] || "Live"}
              </span>
            </h2>

            {/* Gold underline */}
            <div
              className="h-1 w-16 rounded-full bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] mb-6"
              data-aos="fade-up"
              data-aos-delay="150"
            />

            {/* Description */}
            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8" data-aos="fade-up" data-aos-delay="200">
              {{ ar: "كعميل في MNC، يمكنك متابعة تقدم مشروعك لحظةً بلحظة عبر كاميرات مباشرة. أدخل الكود الخاص بمشروعك للبدء.",
                 en: "As an MNC client, monitor your project's progress in real time via live cameras. Enter your project code to get started.",
                 zh: "作为MNC客户，您可以通过实时摄像头实时监控项目进度，输入项目代码开始使用。",
                 fr: "En tant que client MNC, suivez en temps réel l'avancement de votre projet. Entrez votre code de projet pour commencer.",
                 es: "Como cliente de MNC, monitorea el avance de tu proyecto en tiempo real. Ingresa tu código de proyecto para comenzar.",
                 de: "Als MNC-Kunde verfolgen Sie den Fortschritt Ihres Projekts in Echtzeit. Geben Sie Ihren Projektcode ein.",
                 tr: "MNC müşterisi olarak projenizin ilerlemesini canlı takip edebilirsiniz. Başlamak için proje kodunuzu girin.",
                 ur: "MNC کے کلائنٹ کے طور پر اپنے منصوبے کی پیشرفت کو لائیو کیمروں کے ذریعے مانیٹر کریں۔",
                 hi: "MNC क्लाइंट के रूप में, लाइव कैमरों के माध्यम से वास्तविक समय में अपनी परियोजना की प्रगति की निगरानी करें। शुरू करने के लिए अपना प्रोजेक्ट कोड दर्ज करें।",
                 ru: "Как клиент MNC, отслеживайте ход выполнения вашего проекта в реальном времени с помощью камер прямого эфира."
              }[lang] || "As an MNC client, monitor your project's progress in real time via live cameras."}
            </p>

            {/* Input + Button */}
            <form
              onSubmit={handleSubmit}
              className="flex gap-3 flex-wrap sm:flex-nowrap"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {/* Gold button */}
              <button
                type="submit"
                className="shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300
                  hover:brightness-110 active:scale-95
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B25D]/60"
                style={{ backgroundColor: "#D5B25D", color: "#0f172a" }}
              >
                {{ ar: "دخول", en: "Access", zh: "访问", fr: "Accéder",
                   es: "Acceder", de: "Zugang", tr: "Giriş", ur: "داخل",
                   hi: "प्रवेश", ru: "Войти" }[lang] || "Access"}
              </button>

              {/* Serial input */}
              <div className="relative flex-1 min-w-[180px]">
                <input
                  type="text"
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder="MNC-XXXX-•••"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm
                    placeholder:text-white/20 transition-all
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B25D]/50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(213,178,93,0.2)",
                  }}
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                />
                <QrCode
                  size={14}
                  aria-hidden="true"
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} text-[#D5B25D]/40 pointer-events-none`}
                />
              </div>
            </form>
          </div>

          {/* ── Preview Card (left in RTL) ── */}
          <div className="w-full lg:w-1/2" data-aos="fade-up" data-aos-delay="150">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(213,178,93,0.2)",
                background: "#000",
              }}
            >
              {/* Corner brackets */}
              <span aria-hidden="true" className="absolute top-2.5 right-2.5 w-5 h-5 z-20 pointer-events-none"
                style={{ borderTop: "1px solid rgba(213,178,93,0.5)", borderRight: "1px solid rgba(213,178,93,0.5)" }} />
              <span aria-hidden="true" className="absolute bottom-2.5 left-2.5 w-5 h-5 z-20 pointer-events-none"
                style={{ borderBottom: "1px solid rgba(213,178,93,0.5)", borderLeft: "1px solid rgba(213,178,93,0.5)" }} />

              {/* Aspect-ratio wrapper */}
              <div className="relative aspect-video">
                <div className="absolute inset-0">
                  <CameraPreview projectCode={submittedCode} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
