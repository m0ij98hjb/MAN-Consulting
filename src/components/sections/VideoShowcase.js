"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const TX = {
  eyebrow: {
    ar: "هويتنا في صورة",
    en: "Our Identity in Motion",
    hi: "गति में हमारी पहचान",
    ru: "Наша идентичность в движении",
    de: "Unsere Identität in Bewegung",
    fr: "Notre identité en mouvement",
    es: "Nuestra identidad en movimiento",
    tr: "Hareket Halindeki Kimliğimiz",
    ur: "تصویر میں ہماری شناخت",
    zh: "动态展示我们的形象",
  },
  title1: {
    ar: "نحن", en: "Who", hi: "हम", ru: "Кто", de: "Wer", fr: "Qui", es: "Quiénes", tr: "Biz", ur: "ہم", zh: "我们"
  },
  title2: {
    ar: "من نحن", en: "We Are", hi: "कौन हैं", ru: "Мы Есть", de: "Wir Sind", fr: "Nous Sommes", es: "Somos", tr: "Kimiz", ur: "کون ہیں", zh: "是谁"
  },
  subtitle: {
    ar: "خبرة منذ عام 1986 في تشييد المباني وصناعة الأحلام",
    en: "Expertise since 1986 in construction and making dreams real",
    hi: "1986 से भवन निर्माण और सपनों को साकार करने में विशेषज्ञता",
    ru: "Опыт с 1986 года в строительстве зданий и воплощении мечты",
    de: "Expertise seit 1986 im Bauwesen und der Verwirklichung von Träumen",
    fr: "Expertise depuis 1986 dans la construction et la réalisation des rêves",
    es: "Experiencia desde 1986 en construcción y realización de sueños",
    tr: "1986'dan beri inşaat ve hayalleri gerçekleştirme uzmanlığı",
    ur: "1986 سے عمارتوں کی تعمیر اور خوابوں کی تعبیر میں مہارت",
    zh: "自1986年以来的建筑与圆梦专业经验",
  },
  badge: {
    ar: "شركة ام ان سى للانشاءات",
    en: "MNC General Contracting",
    hi: "MNC जनरल कॉन्ट्रैक्टिंग",
    ru: "MNC General Contracting",
    de: "MNC General Contracting",
    fr: "MNC General Contracting",
    es: "MNC General Contracting",
    tr: "MNC General Contracting",
    ur: "MNC جنرل کنٹریکٹنگ",
    zh: "MNC 总承包",
  }
};

export default function VideoShowcase() {
  const { lang, isRTL } = useLanguage();
  const tx = (obj) => obj[lang] || obj.en;

  const sectionRef = useRef(null);
  const videoRef   = useRef(null);
  const isInView   = useInView(sectionRef, { once: true, amount: 0.3 });

  const [playing, setPlaying]   = useState(false);
  const [muted,   setMuted]     = useState(true);
  const [started, setStarted]   = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      setStarted(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleFullscreen = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen)            v.requestFullscreen();
    else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-[#04090F] relative overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#D5B25D 0,#D5B25D 1px,transparent 1px,transparent 80px)" }}
      />
      <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent" />
      <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[500px] bg-[#D5B25D]/6 rounded-full blur-[180px]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-10 bg-[#D5B25D]" />
            <span className="text-[#D5B25D] text-[11px] font-black uppercase tracking-[0.25em]">
              {tx(TX.eyebrow)}
            </span>
            <span className="h-px w-10 bg-[#D5B25D]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading leading-tight mb-4">
            <span className="text-white">{tx(TX.title1)} </span>
            <span className="text-[#D5B25D]">{tx(TX.title2)}</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {tx(TX.subtitle)}
          </p>
        </motion.div>

        {/* ── Video Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-[#D5B25D]/40 via-transparent to-[#D5B25D]/20 z-0" />

          {/* Card */}
          <div
            className="relative rounded-[26px] overflow-hidden bg-[#060E1A] shadow-[0_30px_100px_rgba(0,0,0,0.7)] z-10 cursor-pointer group"
            onClick={togglePlay}
          >
            {/* Video element */}
            <video
              ref={videoRef}
              src="/assets/video/MNC-videos.mp4"
              className="w-full aspect-video object-cover block"
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => { setPlaying(false); setProgress(0); }}
            />

            {/* Dark overlay (fades when playing) */}
            <div className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${playing ? "opacity-0 group-hover:opacity-30" : "opacity-100"}`} />

            {/* ── Play button (center) ── */}
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  exit={{ scale: 0.8,    opacity: 0 }}
                  className="relative"
                >
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-full bg-[#D5B25D]/20 animate-ping" />
                  <div className="absolute -inset-3 rounded-full bg-[#D5B25D]/10 animate-pulse" />
                  {/* Button */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#D5B25D] to-[#E8C96A] flex items-center justify-center shadow-[0_0_50px_rgba(213,178,93,0.5)] hover:scale-110 transition-transform duration-300">
                    <Play className="text-black fill-black" size={32} style={{ marginLeft: 4 }} />
                  </div>
                </motion.div>
              </div>
            )}

            {/* ── Top badge (company name) ── */}
            {!started && (
              <div className={`absolute top-5 ${isRTL ? "right-5" : "left-5"} flex items-center gap-2.5 bg-black/60 backdrop-blur-md border border-[#D5B25D]/25 rounded-full px-4 py-2`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#D5B25D] animate-pulse" />
                <span className="text-white text-xs font-bold">
                  {tx(TX.badge)}
                </span>
              </div>
            )}

            {/* ── Controls bar (bottom) ── */}
            <div className={`absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>

              {/* Progress bar */}
              <div
                className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer overflow-hidden"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#D5B25D] to-[#E8C96A] rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Buttons row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D5B25D]/30 border border-white/15 flex items-center justify-center transition-all duration-200"
                  >
                    {playing
                      ? <Pause  size={14} className="text-white" />
                      : <Play   size={14} className="text-white fill-white" style={{ marginLeft: 1 }} />
                    }
                  </button>

                  {/* Mute */}
                  <button
                    onClick={toggleMute}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D5B25D]/30 border border-white/15 flex items-center justify-center transition-all duration-200"
                  >
                    {muted
                      ? <VolumeX size={14} className="text-white/60" />
                      : <Volume2 size={14} className="text-white"    />
                    }
                  </button>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={handleFullscreen}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D5B25D]/30 border border-white/15 flex items-center justify-center transition-all duration-200"
                >
                  <Maximize size={14} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
