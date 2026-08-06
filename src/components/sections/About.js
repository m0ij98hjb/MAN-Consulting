"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Calendar, Building2, Users, Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

/* ── Animated stat number — counts up once when scrolled into view ── */
const StatNumber = ({ value, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (node) observer.observe(node);
    return () => { if (node) observer.unobserve(node); };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    const duration = 2000;
    let frameId;
    let start;
    const tick = (t) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(value * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
      else setCount(value);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [hasAnimated, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
};

const About = () => {
  const { lang, t } = useLanguage();
  const isRTL = lang === 'ar' || lang === 'ur';
  const { data: aboutCms } = useSiteContent('about');

  const directorImage = aboutCms?.director_image || '/asstes/directoret.png';
  const directorName = aboutCms?.director_name || t('about.directorName');
  const directorTitle = isRTL
    ? (aboutCms?.director_pos_ar || t('about.directorTitle'))
    : (aboutCms?.director_pos_en || t('about.directorTitle'));

  const ceoImage = aboutCms?.ceo_image || '/asstes/directore.png';
  const ceoName = aboutCms?.ceo_name || t('about.ceoName');
  const ceoTitle = (isRTL ? aboutCms?.ceo_pos_ar : aboutCms?.ceo_pos_en) || t('about.ceoTitle');

  const companyName = {
    ar: "مكتب MAN للاستشارات الهندسية", en: "MAN Engineering Consultancy",
    zh: "MAN工程咨询公司", es: "MAN Engineering Consultancy", fr: "MAN Engineering Consultancy",
    de: "MAN Engineering Consultancy", tr: "MAN Engineering Consultancy", ur: "ایم اے این انجینئرنگ کنسلٹنسی",
    hi: "एमएएन इंजीनियरिंग कंसल्टेंसी", ru: "MAN Engineering Consultancy"
  }[lang] || "MAN Engineering Consultancy";

  const shortDesc = {
    ar: "نهندس بصمتنا في عالم التصميم والاستشارات الهندسية بأعلى معايير الجودة والاحترافية.",
    en: "We engineer our mark in the world of design and engineering consultancy with the highest standards of quality and professionalism.",
    zh: "我们以最高的质量和专业标准，在设计与工程咨询领域打造我们的印记。",
    es: "Forjamos nuestra huella en el diseño y la consultoría de ingeniería con los más altos estándares de calidad y profesionalismo.",
    fr: "Nous forgeons notre empreinte dans la conception et le conseil en ingénierie avec les plus hauts standards de qualité et de professionnalisme.",
    de: "Wir prägen unsere Spuren in Design und Ingenieurberatung mit höchsten Standards an Qualität und Professionalität.",
    tr: "Tasarım ve mühendislik danışmanlığı dünyasında en yüksek kalite ve profesyonellik standartlarıyla izimizi bırakıyoruz.",
    ur: "ہم ڈیزائن اور انجینئرنگ مشاورت کی دنیا میں اعلیٰ ترین معیار اور پیشہ ورانہ مہارت کے ساتھ اپنا نقش بناتے ہیں۔",
    hi: "हम डिज़ाइन और इंजीनियरिंग परामर्श की दुनिया में उच्चतम गुणवत्ता और व्यावसायिकता के मानकों के साथ अपनी छाप बनाते हैं।",
    ru: "Мы создаём свой след в мире дизайна и инженерного консалтинга, соблюдая высочайшие стандарты качества и профессионализма."
  }[lang]
    || "We engineer our mark in the world of design and engineering consultancy with the highest standards of quality and professionalism.";

  const eyebrowText = {
    ar: "قيادة وخبرة", en: "Leadership & Expertise", zh: "领导力与专长",
    es: "Liderazgo y experiencia", fr: "Leadership et expertise",
    de: "Führung & Expertise", tr: "Liderlik & Uzmanlık", ur: "قیادت اور مہارت",
    hi: "नेतृत्व और विशेषज्ञता", ru: "Лидерство и опыт"
  }[lang] || "Leadership & Expertise";

  const titlePre = {
    ar: "القيادة التي", en: "The Leadership That", zh: "建立信任的",
    es: "El liderazgo que", fr: "Le leadership qui",
    de: "Die Führung, die", tr: "Güven İnşa Eden", ur: "وہ قیادت جو",
    hi: "विश्वास बनाने वाला", ru: "Лидерство, создающее"
  }[lang] || "The Leadership That";
  const titleGold = {
    ar: "تبني الثقة", en: "Builds Trust", zh: "领导力",
    es: "construye confianza", fr: "construit la confiance",
    de: "Vertrauen aufbaut", tr: "Liderlik", ur: "اعتماد بناتی ہے",
    hi: "नेतृत्व", ru: "доверие"
  }[lang] || "Builds Trust";

  const descText = {
    ar: "نؤمن بأن الهندسة رسالة قبل أن تكون مهنة، وخلف كل مشروع ناجح قيادة راسخة منذ عام 1986 — بخبرة تمتد لأكثر من ثلاثة عقود تحوّل الرؤية إلى واقع وتصنع الفارق في كل تفصيلة.",
    en: "We believe engineering is a calling before a profession — behind every successful project stands leadership rooted since 1986, with over three decades of experience turning vision into reality.",
    zh: "我们相信工程是一种使命——自1986年以来，每个成功项目背后都有深厚的领导力，三十余年经验将愿景变为现实。",
    fr: "Nous croyons que l'ingénierie est une vocation — derrière chaque projet réussi se trouve un leadership ancré depuis 1986, fort de plus de trois décennies d'expérience.",
    es: "Creemos que la ingeniería es una vocación — detrás de cada proyecto exitoso hay un liderazgo consolidado desde 1986, con más de tres décadas de experiencia.",
    de: "Wir glauben, dass Ingenieurwesen eine Berufung ist — hinter jedem erfolgreichen Projekt steht eine seit 1986 verwurzelte Führung mit über drei Jahrzehnten Erfahrung.",
    tr: "Mühendisliğin bir meslek olmadan önce bir misyon olduğuna inanıyoruz — her başarılı projenin arkasında 1986'dan bu yana köklü, otuz yılı aşkın deneyime sahip bir liderlik vardır.",
    ur: "ہمارا ماننا ہے کہ انجینئرنگ ایک پیشے سے پہلے ایک مشن ہے — ہر کامیاب منصوبے کے پیچھے 1986 سے قائم قیادت ہے جو تین دہائیوں سے زائد تجربے کے ساتھ وژن کو حقیقت میں بدلتی ہے۔",
    hi: "हम मानते हैं कि इंजीनियरिंग एक पेशे से पहले एक मिशन है — हर सफल परियोजना के पीछे 1986 से स्थापित नेतृत्व है, जिसके पास तीन दशकों से अधिक का अनुभव है।",
    ru: "Мы верим, что инженерия — это призвание. За каждым успешным проектом стоит руководство, заложенное с 1986 года, с более чем тридцатилетним опытом."
  }[lang] || "We believe engineering is a calling before a profession — behind every successful project stands leadership rooted since 1986, with over three decades of experience.";

  const stats = [
    {
      icon: Calendar, value: 1986, prefix: "", suffix: "",
      label: { ar: "تأسست عام", en: "Since", zh: "始于", es: "Desde", fr: "Depuis", de: "Seit", tr: "Kuruluş", ur: "قیام", hi: "स्थापना", ru: "С" }[lang] || "Since"
    },
    {
      icon: Building2, value: 500, prefix: "+", suffix: "",
      label: { ar: "مشروع", en: "Projects", zh: "项目", es: "Proyectos", fr: "Projets", de: "Projekte", tr: "Proje", ur: "منصوبے", hi: "परियोजनाएं", ru: "Проектов" }[lang] || "Projects"
    },
    {
      icon: Users, value: 35, prefix: "+", suffix: "",
      label: { ar: "مهندس", en: "Engineers", zh: "工程师", es: "Ingenieros", fr: "Ingénieurs", de: "Ingenieure", tr: "Mühendis", ur: "انجینئرز", hi: "इंजीनियर", ru: "Инженеров" }[lang] || "Engineers"
    },
    {
      icon: Award, value: 30, prefix: "+", suffix: "",
      label: { ar: "عام خبرة", en: "Years Experience", zh: "年经验", es: "Años de experiencia", fr: "Ans d'expérience", de: "Jahre Erfahrung", tr: "Yıl Deneyim", ur: "سال تجربہ", hi: "वर्षों का अनुभव", ru: "Лет опыта" }[lang] || "Years Experience"
    },
  ];

  const people = [
    { image: directorImage, name: directorName, title: directorTitle, delay: '100' },
    { image: ceoImage, name: ceoName, title: ceoTitle, delay: '250' },
  ];

  return (
    <section id="about" className="relative py-20 md:py-28 overflow-hidden bg-[var(--background)]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Layered premium background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* base layered gradient */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(212,168,67,0.04) 0%, transparent 60%), linear-gradient(180deg, #3B3E46 0%, #202227 50%, #1A1B1F 100%)' }} />

      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* ── Section Header — centered ── */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20" data-aos="fade-up">

          <div className="inline-flex items-center gap-4 mb-6">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A843]" />
            <span className="text-[#D4A843] font-bold tracking-[0.25em] uppercase text-[11px]">
              {eyebrowText}
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A843]" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6" data-aos="fade-up" data-aos-delay="100">
            <span className="text-white">{titlePre} </span>
            <span style={{ color: '#D4A843' }}>{titleGold}</span>
          </h2>

          <div className="flex items-center justify-center gap-2 mb-6" data-aos="fade-up" data-aos-delay="150">
            <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #D4A843)' }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4A843' }} />
            <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, #D4A843, transparent)' }} />
          </div>

          <p className="text-white/60 text-base md:text-lg leading-relaxed" data-aos="fade-up" data-aos-delay="200">
            {descText}
          </p>
        </div>

        {/* ── Leadership Cards ── */}
        <div className="flex flex-col gap-8 max-w-5xl mx-auto mb-16 md:mb-20">
          {people.map((person, idx) => (
            <div
              key={idx}
              className={`group relative flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} rounded-[20px] overflow-hidden transition-all duration-500 hover:-translate-y-1 border-b-2 border-b-[#D4A843]`}
              style={{
                background: '#44474F',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(212,168,67,0.18)',
                borderLeft: '1px solid rgba(212,168,67,0.18)',
                borderRight: '1px solid rgba(212,168,67,0.18)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              }}
              data-aos="fade-up"
              data-aos-delay={person.delay}
            >
              {/* Image — ~45% width on desktop */}
              <div className="relative w-full md:w-[45%] aspect-4/3 md:aspect-auto shrink-0 overflow-hidden">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  sizes="(max-width: 767px) 100vw, 460px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  style={{ objectPosition: 'center 2%' }}
                  unoptimized={person.image.startsWith('http')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/10" />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center gap-4 p-8 md:p-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.35)' }}
                >
                  <ShieldCheck size={22} style={{ color: '#D4A843' }} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <h4 className="text-white font-black text-2xl md:text-[28px] leading-tight">{person.name}</h4>
                  <p className="font-bold text-sm md:text-base tracking-wide" style={{ color: '#D4A843' }}>{person.title}</p>
                </div>

                <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #D4A843, transparent)' }} />

                <p className="text-white/50 text-[13px] font-semibold uppercase tracking-widest">{companyName}</p>
                <p className="text-white/40 text-sm md:text-[15px] leading-relaxed max-w-md">{shortDesc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Premium Statistics Bar ── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto rounded-2xl overflow-hidden border-b-2 border-b-[#D4A843]"
          style={{
            background: '#44474F',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(212,168,67,0.18)',
            borderLeft: '1px solid rgba(212,168,67,0.18)',
            borderRight: '1px solid rgba(212,168,67,0.18)',
          }}
          data-aos="fade-up"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`flex flex-col items-center text-center gap-3 px-6 py-8 md:py-10 border-[rgba(212,168,67,0.14)]
                  ${i % 2 === 1 ? 'border-s' : ''}
                  ${i >= 2 ? 'border-t' : ''} md:border-t-0
                  ${i >= 1 ? 'md:border-s' : 'md:border-s-0'}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.35)' }}
                >
                  <Icon size={20} style={{ color: '#D4A843' }} />
                </div>
                <div className="text-3xl md:text-4xl font-black style={{ color: '#D4A843' }}">
                  <StatNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <span className="text-white/50 text-xs md:text-sm font-semibold tracking-wide">{stat.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default About;
