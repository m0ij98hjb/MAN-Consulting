"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

const About = () => {
  const { lang, t } = useLanguage();
  const isRTL = lang === 'ar' || lang === 'ur';
  const { data: aboutCms } = useSiteContent('about');

  const directorImage = aboutCms?.director_image || '/asstes/directort.png';
  const directorName  = aboutCms?.director_name  || t('about.directorName');
  const directorTitle = isRTL
    ? (aboutCms?.director_pos_ar || t('about.directorTitle'))
    : (aboutCms?.director_pos_en || t('about.directorTitle'));

  const ceoImage = aboutCms?.ceo_image || '/asstes/directorr.png';
  const ceoName  = aboutCms?.ceo_name  || t('about.ceoName');
  const ceoTitle = (isRTL ? aboutCms?.ceo_pos_ar : aboutCms?.ceo_pos_en) || t('about.ceoTitle');

  return (
    <section id="about" className="py-16 md:py-20 bg-(--card-bg) relative overflow-x-hidden">
      {/* Background Decor */}
      <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-1/3 h-full bg-slate-50/50 ${isRTL ? '-skew-x-12 translate-x-1/2' : 'skew-x-12 -translate-x-1/2'} -z-10 hidden sm:block`}></div>

      <div className="container mx-auto px-6 max-w-7xl">

        {/* ── Section Header ── */}
        <div className={`mb-16 ${isRTL ? 'text-right' : 'text-left'}`} data-aos="fade-up">

          {/* Eyebrow */}
          <div className={`inline-flex items-center gap-3 mb-5 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="h-px w-10 bg-linear-to-l from-transparent to-secondary" />
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[11px]">
              {{ ar: "قيادة وخبرة", en: "Leadership & Expertise", zh: "领导力与专长",
                 es: "Liderazgo y experiencia", fr: "Leadership et expertise",
                 de: "Führung & Expertise", tr: "Liderlik & Uzmanlık", ur: "قیادت اور مہارت",
                 hi: "नेतृत्व और विशेषज्ञता", ru: "Лидерство и опыт" }[lang] || "Leadership & Expertise"}
            </span>
            <span className="h-px w-10 bg-linear-to-r from-transparent to-secondary" />
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4" data-aos="fade-up" data-aos-delay="100">
            <span className="text-gradient">
              {{ ar: "القيادة التي تبني الثقة", en: "The Leadership That Builds Trust",
                 zh: "建立信任的领导力", es: "El liderazgo que construye confianza",
                 fr: "Le leadership qui construit la confiance",
                 de: "Die Führung, die Vertrauen aufbaut",
                 tr: "Güven İnşa Eden Liderlik", ur: "وہ قیادت جو اعتماد بناتی ہے",
                 hi: "विश्वास बनाने वाला नेतृत्व", ru: "Лидерство, создающее доверие" }[lang] || "The Leadership That Builds Trust"}
            </span>
          </h2>

          {/* Gold underline */}
          <div className={`h-1 w-16 rounded-full bg-linear-to-r from-secondary to-gold ${isRTL ? 'mr-0' : 'ml-0'}`} data-aos="fade-up" data-aos-delay="150" />

          {/* Description */}
          <p className="mt-6 text-white text-base md:text-lg leading-relaxed max-w-2xl" data-aos="fade-up" data-aos-delay="200">
            {{ ar: "نؤمن بأن الهندسة رسالة قبل أن تكون مهنة، وخلف كل مشروع ناجح قيادة راسخة منذ عام 1986 — بخبرة تمتد لأكثر من ثلاثة عقود تحوّل الرؤية إلى واقع وتصنع الفارق في كل تفصيلة.",
               en: "We believe engineering is a calling before a profession — behind every successful project stands leadership rooted since 1986, with over three decades of experience turning vision into reality.",
               zh: "我们相信工程是一种使命——自1986年以来，每个成功项目背后都有深厚的领导力，三十余年经验将愿景变为现实。",
               fr: "Nous croyons que l'ingénierie est une vocation — derrière chaque projet réussi se trouve un leadership ancré depuis 1986, fort de plus de trois décennies d'expérience.",
               es: "Creemos que la ingeniería es una vocación — detrás de cada proyecto exitoso hay un liderazgo consolidado desde 1986, con más de tres décadas de experiencia.",
               de: "Wir glauben, dass Ingenieurwesen eine Berufung ist — hinter jedem erfolgreichen Projekt steht eine seit 1986 verwurzelte Führung mit über drei Jahrzehnten Erfahrung.",
               tr: "Mühendisliğin bir meslek olmadan önce bir misyon olduğuna inanıyoruz — her başarılı projenin arkasında 1986'dan bu yana köklü, otuz yılı aşkın deneyime sahip bir liderlik vardır.",
               ur: "ہمارا ماننا ہے کہ انجینئرنگ ایک پیشے سے پہلے ایک مشن ہے — ہر کامیاب منصوبے کے پیچھے 1986 سے قائم قیادت ہے جو تین دہائیوں سے زائد تجربے کے ساتھ وژن کو حقیقت میں بدلتی ہے۔",
               hi: "हम मानते हैं कि इंजीनियरिंग एक पेशे से पहले एक मिशन है — हर सफल परियोजना के पीछे 1986 से स्थापित नेतृत्व है, जिसके पास तीन दशकों से अधिक का अनुभव है।",
               ru: "Мы верим, что инженерия — это призвание. За каждым успешным проектом стоит руководство, заложенное с 1986 года, с более чем тридцатилетним опытом."
            }[lang] || "We believe engineering is a calling before a profession — behind every successful project stands leadership rooted since 1986, with over three decades of experience."}
          </p>
        </div>

        {/* ── Row 1: Two Image Cards ── */}
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 justify-center mb-20">

          {/* Chairman Card */}
          <div className="w-full sm:w-1/2 lg:w-2/5 relative pb-14" data-aos="fade-up">
            <div className="relative z-10 group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3">
                <Image
                  src={directorImage}
                  alt={directorName}
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center 2%' }}
                  unoptimized={directorImage.startsWith('http')}
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Decorative Frame */}
              <div className={`absolute -top-4 ${isRTL ? '-left-2 md:-top-6 md:-left-6' : '-right-2 md:-top-6 md:-right-6'} w-20 h-20 md:w-28 md:h-28 ${isRTL ? 'border-t-4 border-l-4 rounded-tl-3xl' : 'border-t-4 border-r-4 rounded-tr-3xl'} border-secondary -z-10`} />
            </div>

            {/* Title Card */}
            <div className={`absolute -bottom-2 ${isRTL ? 'left-2 md:left-4' : 'right-2 md:right-4'} bg-white p-4 md:p-5 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl z-20`} data-aos="fade-up" data-aos-delay="400">
              <h4 className="text-secondary font-bold text-base md:text-lg mb-0.5">{directorName}</h4>
              <p className="text-black text-[8px] md:text-[10px] uppercase tracking-widest font-bold">{directorTitle}</p>
            </div>
          </div>

          {/* CEO Card */}
          <div className="w-full sm:w-1/2 lg:w-2/5 relative pb-14" data-aos="fade-up" data-aos-delay="150">
            <div className="relative z-10 group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3">
                <Image
                  src={ceoImage}
                  alt={ceoName}
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center 2%' }}
                  unoptimized={ceoImage.startsWith('http')}
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Decorative Frame (mirrored) */}
              <div className={`absolute -top-4 ${isRTL ? '-right-2 md:-top-6 md:-right-6' : '-left-2 md:-top-6 md:-left-6'} w-20 h-20 md:w-28 md:h-28 ${isRTL ? 'border-t-4 border-r-4 rounded-tr-3xl' : 'border-t-4 border-l-4 rounded-tl-3xl'} border-secondary -z-10`} />
            </div>

            {/* Title Card */}
            <div className={`absolute -bottom-2 ${isRTL ? 'right-2 md:right-4' : 'left-2 md:left-4'} bg-white p-4 md:p-5 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl z-20`} data-aos="fade-up" data-aos-delay="550">
              <h4 className="text-secondary font-bold text-base md:text-lg mb-0.5">{ceoName}</h4>
              <p className="text-black text-[8px] md:text-[10px] uppercase tracking-widest font-bold">{ceoTitle}</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
