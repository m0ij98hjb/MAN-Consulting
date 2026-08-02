"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useMusic } from "@/context/MusicContext";
import {
  Hammer, Layers, Building2, Zap, Sparkles, CheckCircle,
  Play, Pause, Maximize,
} from "lucide-react";

const STAGES = [
  {
    id: 1,
    Icon: Hammer,
    title: {
      ar: "تمهيد الأرض والحفر",
      en: "Site Prep & Excavation",
      hi: "साइट तैयारी और खुदाई",
      ru: "Подготовка участка и земляные работы",
      de: "Standortvorbereitung & Aushub",
      fr: "Préparation du site & Excavation",
      es: "Preparación del sitio y excavación",
      tr: "Saha Hazırlığı ve Kazı",
      ur: "سائٹ کی تیاری اور کھدائی",
      zh: "场地准备与开挖",
    },
    desc: {
      ar: "دراسة التربة وتخطيط الموقع الهندسي وحفر الأساسات بدقة عالية",
      en: "Soil analysis, engineering site planning, and precision foundation excavation",
      hi: "मिट्टी का विश्लेषण, इंजीनियरिंग साइट योजना और सटीक नींव खुदाई",
      ru: "Анализ грунта, инженерное планирование участка и точная экскавация фундамента",
      de: "Bodenanalyse, technische Standortplanung und präzise Fundamentaushebung",
      fr: "Analyse du sol, planification du site et excavation de fondation de précision",
      es: "Análisis del suelo, planificación del sitio y excavación de cimentación de precisión",
      tr: "Zemin analizi, mühendislik alanı planlaması ve hassas temel kazısı",
      ur: "مٹی کا تجزیہ، انجینئرنگ سائٹ پلاننگ اور صحت مند بنیاد کی کھدائی",
      zh: "土壤分析、工程场地规划和精确的基础开挖",
    },
    tags: {
      ar: ["دراسة التربة", "مخططات الأساسات", "أعمال الحفر"],
      en: ["Soil Analysis", "Foundation Plans", "Excavation Works"],
      hi: ["मिट्टी विश्लेषण", "नींव योजनाएं", "खुदाई कार्य"],
      ru: ["Анализ грунта", "Планы фундамента", "Земляные работы"],
      de: ["Bodenanalyse", "Fundamentpläne", "Erdarbeiten"],
      fr: ["Analyse du sol", "Plans de fondation", "Travaux d'excavation"],
      es: ["Análisis del suelo", "Planos de cimentación", "Trabajos de excavación"],
      tr: ["Zemin Analizi", "Temel Planları", "Kazı İşleri"],
      ur: ["مٹی کا تجزیہ", "بنیاد کے منصوبے", "کھدائی کا کام"],
      zh: ["土壤分析", "基础计划", "开挖工程"],
    },
    floorsTo: 1,
  },
  {
    id: 2,
    Icon: Layers,
    title: {
      ar: "الخرسانة والهيكل الإنشائي",
      en: "Concrete & Structural Frame",
      hi: "कंक्रीट और संरचनात्मक ढांचा",
      ru: "Бетон и конструктивный каркас",
      de: "Beton & Tragwerk",
      fr: "Béton & Structure Portante",
      es: "Hormigón y estructura",
      tr: "Beton & Yapısal Çerçeve",
      ur: "کنکریٹ اور ساختی فریم",
      zh: "混凝土与结构框架",
    },
    desc: {
      ar: "صب الأساسات وإقامة الأعمدة والأسقف الخرسانية المسلحة طابقاً بطابق",
      en: "Foundation pour, reinforced concrete columns and slabs floor by floor",
      hi: "नींव डालना, प्रबलित कंक्रीट स्तंभ और फर्श दर फर्श स्लैब",
      ru: "Заливка фундамента, колонны и плиты из армированного бетона этаж за этажом",
      de: "Fundamentguss, Stahlbetonstützen und -decken Etage für Etage",
      fr: "Coulage de fondation, colonnes et dalles en béton armé étage par étage",
      es: "Vaciado de cimentación, columnas y losas de concreto reforzado piso por piso",
      tr: "Temel dökümü, betonarme kolonlar ve döşemeler kat kat",
      ur: "بنیاد ڈالنا، مسلح کنکریٹ کے کالم اور سلیب منزل بہ منزل",
      zh: "基础浇筑，逐层施工钢筋混凝土柱和板",
    },
    tags: {
      ar: ["صب الأساسات", "الأعمدة والأسقف", "الهيكل الكامل"],
      en: ["Foundation Pour", "Columns & Slabs", "Full Skeleton"],
      hi: ["नींव डालना", "स्तंभ और स्लैब", "पूरा कंकाल"],
      ru: ["Заливка фундамента", "Колонны и плиты", "Полный каркас"],
      de: ["Fundamentguss", "Stützen & Decken", "Komplettes Tragwerk"],
      fr: ["Coulage fondation", "Colonnes & Dalles", "Squelette complet"],
      es: ["Vaciado cimentación", "Columnas y losas", "Esqueleto completo"],
      tr: ["Temel Dökümü", "Kolonlar ve Döşemeler", "Tam İskelet"],
      ur: ["بنیاد ڈالنا", "کالم اور سلیب", "مکمل ڈھانچہ"],
      zh: ["基础浇筑", "柱与板", "完整骨架"],
    },
    floorsTo: 4,
  },
  {
    id: 3,
    Icon: Building2,
    title: {
      ar: "الجدران والواجهات الخارجية",
      en: "Walls & Exterior Facades",
      hi: "दीवारें और बाहरी अग्रभाग",
      ru: "Стены и внешние фасады",
      de: "Wände & Außenfassaden",
      fr: "Murs & Façades Extérieures",
      es: "Paredes y fachadas exteriores",
      tr: "Duvarlar & Dış Cepheler",
      ur: "دیواریں اور بیرونی سامنے",
      zh: "墙体与外立面",
    },
    desc: {
      ar: "رفع جدران الطوب وتركيب النوافذ والأبواب وتكسية الواجهات الخارجية",
      en: "Masonry walls, window and door installation, and exterior cladding",
      hi: "चिनाई वाली दीवारें, खिड़की और दरवाजे की स्थापना, और बाहरी क्लैडिंग",
      ru: "Кирпичные стены, установка окон и дверей, наружная облицовка",
      de: "Mauerwerk, Fenster- und Türmontage sowie Außenverkleidung",
      fr: "Murs en maçonnerie, pose des fenêtres et portes, revêtement extérieur",
      es: "Muros de mampostería, instalación de ventanas y puertas, revestimiento exterior",
      tr: "Tuğla duvarlar, pencere ve kapı montajı ve dış kaplama",
      ur: "اینٹوں کی دیواریں، کھڑکی اور دروازہ نصب، بیرونی کلیڈنگ",
      zh: "砌体墙、门窗安装和外部装饰",
    },
    tags: {
      ar: ["جدران الطوب", "النوافذ والأبواب", "الواجهات"],
      en: ["Masonry", "Windows & Doors", "Exterior Cladding"],
      hi: ["चिनाई", "खिड़कियां और दरवाजे", "बाहरी क्लैडिंग"],
      ru: ["Кладка", "Окна и двери", "Наружная облицовка"],
      de: ["Mauerwerk", "Fenster & Türen", "Außenverkleidung"],
      fr: ["Maçonnerie", "Fenêtres & Portes", "Revêtement extérieur"],
      es: ["Mampostería", "Ventanas y puertas", "Revestimiento exterior"],
      tr: ["Duvar Örme", "Pencereler & Kapılar", "Dış Kaplama"],
      ur: ["اینٹ چنائی", "کھڑکیاں اور دروازے", "بیرونی کلیڈنگ"],
      zh: ["砌体", "门窗", "外部装饰"],
    },
    floorsTo: 6,
  },
  {
    id: 4,
    Icon: Zap,
    title: {
      ar: "الأعمال الميكانيكية والكهربائية",
      en: "MEP Works",
      hi: "MEP कार्य",
      ru: "МЭП работы",
      de: "TGA-Arbeiten",
      fr: "Travaux MEP",
      es: "Trabajos MEP",
      tr: "MEP İşleri",
      ur: "MEP کام",
      zh: "MEP工程",
    },
    desc: {
      ar: "تمديدات الكهرباء والسباكة وأنظمة التكييف والإنذار وأنظمة الأمان",
      en: "Electrical, plumbing, HVAC, fire alarm, and security systems",
      hi: "विद्युत, प्लंबिंग, HVAC, अग्नि अलार्म और सुरक्षा प्रणालियां",
      ru: "Электрика, сантехника, HVAC, пожарная сигнализация и системы безопасности",
      de: "Elektro-, Sanitär-, HVAC-, Brandmelde- und Sicherheitssysteme",
      fr: "Électricité, plomberie, CVC, alarme incendie et systèmes de sécurité",
      es: "Sistemas eléctricos, plomería, HVAC, alarma contra incendios y seguridad",
      tr: "Elektrik, tesisat, iklimlendirme, yangın alarmı ve güvenlik sistemleri",
      ur: "بجلی، پلمبنگ، HVAC، فائر الارم اور سیکیورٹی سسٹمز",
      zh: "电气、管道、暖通空调、火警和安全系统",
    },
    tags: {
      ar: ["تمديدات الكهرباء", "شبكة السباكة", "التكييف والأمان"],
      en: ["Electrical Works", "Plumbing Network", "HVAC & Safety"],
      hi: ["विद्युत कार्य", "प्लंबिंग नेटवर्क", "HVAC और सुरक्षा"],
      ru: ["Электромонтаж", "Сантехническая сеть", "HVAC и безопасность"],
      de: ["Elektroarbeiten", "Sanitärnetz", "HVAC & Sicherheit"],
      fr: ["Travaux électriques", "Réseau de plomberie", "CVC & Sécurité"],
      es: ["Trabajos eléctricos", "Red de plomería", "HVAC y seguridad"],
      tr: ["Elektrik İşleri", "Tesisat Ağı", "HVAC & Güvenlik"],
      ur: ["بجلی کا کام", "پلمبنگ نیٹ ورک", "HVAC اور سیکیورٹی"],
      zh: ["电气工程", "管道网络", "暖通空调与安全"],
    },
    floorsTo: 8,
  },
  {
    id: 5,
    Icon: Sparkles,
    title: {
      ar: "التشطيبات والتسليم",
      en: "Finishing & Handover",
      hi: "फिनिशिंग और हैंडओवर",
      ru: "Отделка и сдача",
      de: "Ausbau & Übergabe",
      fr: "Finitions & Remise",
      es: "Acabados y entrega",
      tr: "Son İşlemler & Teslim",
      ur: "فنشنگ اور حوالگی",
      zh: "装饰与交付",
    },
    desc: {
      ar: "الدهانات والأرضيات والديكور الداخلي والتشطيبات الخارجية ثم تسليم المفتاح",
      en: "Paint, flooring, interior decor, exterior finishing, and key handover",
      hi: "पेंट, फर्श, आंतरिक सजावट, बाहरी फिनिशिंग और चाबी हस्तांतरण",
      ru: "Покраска, напольные покрытия, интерьер, внешняя отделка и передача ключей",
      de: "Anstrich, Böden, Innendekor, Außenverkleidung und Schlüsselübergabe",
      fr: "Peinture, sols, décoration intérieure, finition extérieure et remise des clés",
      es: "Pintura, pisos, decoración interior, acabado exterior y entrega de llaves",
      tr: "Boya, zemin kaplaması, iç dekorasyon, dış kaplama ve anahtar teslimi",
      ur: "پینٹ، فرش، اندرونی سجاوٹ، بیرونی فنشنگ اور چابی حوالگی",
      zh: "涂料、地板、室内装饰、外部装饰和钥匙交付",
    },
    tags: {
      ar: ["الدهانات والأرضيات", "الديكور الداخلي", "تسليم المشروع"],
      en: ["Paint & Flooring", "Interior Decor", "Key Handover"],
      hi: ["पेंट और फर्श", "आंतरिक सजावट", "चाबी हस्तांतरण"],
      ru: ["Покраска и полы", "Интерьер", "Передача ключей"],
      de: ["Anstrich & Böden", "Innendekor", "Schlüsselübergabe"],
      fr: ["Peinture & sols", "Décoration intérieure", "Remise des clés"],
      es: ["Pintura y pisos", "Decoración interior", "Entrega de llaves"],
      tr: ["Boya & Zemin", "İç Dekorasyon", "Anahtar Teslimi"],
      ur: ["پینٹ اور فرش", "اندرونی سجاوٹ", "پروجیکٹ حوالگی"],
      zh: ["涂料与地板", "室内装饰", "钥匙交付"],
    },
    floorsTo: 10,
  },
];

const TOTAL_FLOORS = 10;

const TX = {
  eyebrow:    { ar: "رحلة التشييد", en: "Construction Journey", hi: "निर्माण यात्रा", ru: "Строительный путь", de: "Baureise", fr: "Parcours de construction", es: "Viaje de construcción", tr: "İnşaat Yolculuğu", ur: "تعمیر کا سفر", zh: "建设之旅" },
  h2a:        { ar: "من", en: "From", hi: "जमीन से", ru: "От", de: "Vom", fr: "Du", es: "Desde", tr: "Temelden", ur: "زمین سے", zh: "从" },
  h2b:        { ar: "الأرض", en: "Ground", hi: "जमीन", ru: "Земли", de: "Grund", fr: "Sol", es: "suelo", tr: "Temel", ur: "زمین", zh: "地面" },
  h2c:        { ar: "إلى", en: "to", hi: "शीर्ष", ru: "до", de: "bis", fr: "au", es: "hasta", tr: "Zirveye", ur: "چوٹی", zh: "到" },
  h2d:        { ar: "القمة", en: "Top", hi: "शीर्ष तक", ru: "Вершины", de: "Gipfel", fr: "Sommet", es: "la cima", tr: "Zirve", ur: "چوٹی تک", zh: "顶部" },
  subtitle:   { ar: "شاهد فيديو الشركة واكتشف رحلتنا من الأساس حتى التشطيب بأعلى معايير الجودة", en: "Watch our company video and discover our journey from foundation to finishing", hi: "हमारे कंपनी वीडियो देखें और नींव से फिनिशिंग तक हमारी यात्रा की खोज करें", ru: "Посмотрите видео нашей компании и откройте для себя наш путь от фундамента до финишной отделки", de: "Sehen Sie unser Firmenvideo und entdecken Sie unsere Reise vom Fundament bis zur Fertigstellung", fr: "Regardez notre vidéo d'entreprise et découvrez notre parcours de la fondation à la finition", es: "Vea nuestro video corporativo y descubra nuestro camino de la cimentación al acabado", tr: "Şirket videomuzu izleyin ve temelden bitişe kadar olan yolculuğumuzu keşfedin", ur: "ہمارا کمپنی ویڈیو دیکھیں اور بنیاد سے فنشنگ تک ہمارے سفر کو دریافت کریں", zh: "观看我们的公司视频，了解我们从基础到完工的建设旅程" },
  done:       { ar: "مكتمل", en: "Done", hi: "पूर्ण", ru: "Готово", de: "Fertig", fr: "Terminé", es: "Listo", tr: "Tamamlandı", ur: "مکمل", zh: "完成" },
  inProgress: { ar: "جارٍ الآن", en: "In Progress", hi: "जारी है", ru: "В процессе", de: "Läuft", fr: "En cours", es: "En progreso", tr: "Devam Ediyor", ur: "جاری ہے", zh: "进行中" },
  progress:   { ar: "التقدم الإجمالي", en: "Overall Progress", hi: "कुल प्रगति", ru: "Общий прогресс", de: "Gesamtfortschritt", fr: "Progression globale", es: "Progreso general", tr: "Genel İlerleme", ur: "مجموعی پیشرفت", zh: "总体进度" },
  complete:   { ar: "المشروع مكتمل — من الأساس إلى التشطيب بأعلى معايير الجودة", en: "Project Complete — From Foundation to Finishing with the highest quality standards", hi: "परियोजना पूर्ण — नींव से फिनिशिंग तक उच्चतम गुणवत्ता मानकों के साथ", ru: "Проект завершен — от фундамента до отделки по высочайшим стандартам", de: "Projekt abgeschlossen — vom Fundament bis zur Fertigstellung", fr: "Projet terminé — De la fondation à la finition avec les normes de qualité les plus élevées", es: "Proyecto completo — desde la cimentación hasta el acabado con los más altos estándares", tr: "Proje Tamamlandı — Temelden Bitişe En Yüksek Kalite Standartlarıyla", ur: "منصوبہ مکمل — بنیاد سے فنشنگ تک اعلیٰ ترین معیار کے ساتھ", zh: "项目完成——从基础到完工，达到最高质量标准" },
  companyBadge: { ar: "شركة ام ان سى للانشاءات", en: "MNC General Contracting", hi: "MNC जनरल कॉन्ट्रैक्टिंग", ru: "MNC General Contracting", de: "MNC General Contracting", fr: "MNC General Contracting", es: "MNC General Contracting", tr: "MNC General Contracting", ur: "MNC جنرل کنٹریکٹنگ", zh: "MNC 总承包" },
};

/* ── Video Player ── */
function VideoPlayer({ lang }) {
  const videoRef          = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [started,  setStarted]  = useState(false);
  const [progress, setProgress] = useState(0);
  const { pauseMusicForVoice, resumeMusicAfterVoice } = useMusic();

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      setStarted(true);
      pauseMusicForVoice();
    } else {
      v.pause();
      setPlaying(false);
      resumeMusicAfterVoice();
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

  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  return (
    <div className="relative w-full h-full">
      {/* Outer glow ring */}
      <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-br from-[#D5B25D]/40 via-transparent to-[#D5B25D]/20 z-0" />

      {/* Card */}
      <div
        className="relative rounded-[20px] overflow-hidden bg-[#060E1A] z-10 cursor-pointer group h-full flex flex-col"
        onClick={togglePlay}
      >
        {/* Video */}
        <div className="relative flex-1 min-h-0">
          <video
            ref={videoRef}
            src="/assets/video/MNC-videos.mp4"
            className="w-full h-full object-cover block"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setPlaying(false); setProgress(0); resumeMusicAfterVoice(); }}
          />

          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/45 transition-opacity duration-500 ${playing ? "opacity-0 group-hover:opacity-20" : "opacity-100"}`} />

          {/* Play button */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#D5B25D]/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-[#D5B25D]/10 animate-pulse" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#D5B25D] to-[#E8C96A] flex items-center justify-center shadow-[0_0_40px_rgba(213,178,93,0.55)] hover:scale-110 transition-transform duration-300">
                  <Play className="text-black fill-black" size={26} style={{ marginLeft: 3 }} />
                </div>
              </div>
            </div>
          )}

          {/* Pause hint */}
          {playing && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Pause size={18} className="text-white" />
              </div>
            </div>
          )}

          {/* Company badge */}
          {!started && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-[#D5B25D]/25 rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D5B25D] animate-pulse" />
              <span className="text-white text-[10px] font-bold">{TX.companyBadge[lang] || TX.companyBadge.en}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={`absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
          {/* Progress */}
          <div className="w-full h-1 bg-white/20 rounded-full mb-2.5 cursor-pointer overflow-hidden" onClick={handleSeek}>
            <div className="h-full bg-gradient-to-r from-[#D5B25D] to-[#E8C96A] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          {/* Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D5B25D]/30 border border-white/15 flex items-center justify-center transition-all">
                {playing ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white fill-white" style={{ marginLeft: 1 }} />}
              </button>
            </div>
            <button onClick={handleFullscreen} className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D5B25D]/30 border border-white/15 flex items-center justify-center transition-all">
              <Maximize size={11} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-3 left-3  w-5 h-5 border-t-2 border-l-2 border-[#D5B25D]/60 rounded-tl-lg z-20 pointer-events-none" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#D5B25D]/60 rounded-tr-lg z-20 pointer-events-none" />
      <div className="absolute bottom-3 left-3  w-5 h-5 border-b-2 border-l-2 border-[#D5B25D]/60 rounded-bl-lg z-20 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#D5B25D]/60 rounded-br-lg z-20 pointer-events-none" />
    </div>
  );
}

/* ── Main Section ── */
export default function BuildingJourney() {
  const { lang, isRTL }   = useLanguage();
  const sectionRef        = useRef(null);
  const isInView          = useInView(sectionRef, { once: true, amount: 0.25 });
  const [builtFloors, setBuiltFloors] = useState(0);
  const [activeStage, setActiveStage] = useState(-1);

  const tx = (obj) => obj[lang] || obj.en;

  /* ── Auto-build animation ── */
  useEffect(() => {
    if (!isInView) return;
    let cancelled = false;
    let stageIdx  = 0;

    function buildNextStage() {
      if (cancelled || stageIdx >= STAGES.length) return;
      const stage = STAGES[stageIdx];
      setActiveStage(stageIdx);
      const prevFloors = stageIdx === 0 ? 0 : STAGES[stageIdx - 1].floorsTo;
      let cur = prevFloors;
      const iv = setInterval(() => {
        if (cancelled) { clearInterval(iv); return; }
        cur++;
        setBuiltFloors(cur);
        if (cur >= stage.floorsTo) {
          clearInterval(iv);
          stageIdx++;
          setTimeout(buildNextStage, 700);
        }
      }, 220);
    }

    const t = setTimeout(buildNextStage, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [isInView]);

  const isDone = builtFloors >= TOTAL_FLOORS;

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#04090F] relative overflow-hidden">
      {/* bg texture */}
      <div className="absolute inset-0 opacity-[0.022]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#D5B25D 0px,#D5B25D 1px,transparent 1px,transparent 80px)" }}
      />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5B25D] to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[600px] bg-[#D5B25D]/5 rounded-full blur-[180px]" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 bg-[#D5B25D]" />
            <span className="text-[#D5B25D] text-xs font-black uppercase tracking-[0.25em]">
              {tx(TX.eyebrow)}
            </span>
            <span className="h-px w-10 bg-[#D5B25D]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading mb-5 leading-tight">
            {tx(TX.h2a)}{" "}
            <span className="text-[#D5B25D]">{tx(TX.h2b)}</span>{" "}
            {tx(TX.h2c)}{" "}
            <span className="text-[#D5B25D]">{tx(TX.h2d)}</span>
          </h2>
          <p className="text-white/45 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {tx(TX.subtitle)}
          </p>
        </motion.div>

        {/* ── Main row: Video (left) + Stages (right) ── */}
        <div className={`flex flex-col lg:flex-row gap-10 lg:gap-14 items-start ${isRTL ? "lg:flex-row-reverse" : ""}`}>

          {/* Video — sticky so it doesn't move while stages animate */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-[50%] w-full min-h-[320px] sm:min-h-[400px] lg:h-[580px] lg:sticky lg:top-28 lg:self-start"
          >
            <VideoPlayer lang={lang} />
          </motion.div>

          {/* Stages — right */}
          <div className="lg:w-[50%] flex flex-col gap-3">
            {STAGES.map((stage, i) => {
              const { Icon }   = stage;
              const isActive   = activeStage === i;
              const isDoneStep = activeStage > i || isDone;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.55, delay: i * 0.1 + 0.4 }}
                  className={`relative flex gap-4 items-start p-4 md:p-5 rounded-2xl border transition-all duration-500 ${
                    isActive
                      ? "bg-gradient-to-br from-[#D5B25D]/12 to-[#D5B25D]/4 border-[#D5B25D]/40 shadow-[0_0_40px_rgba(213,178,93,0.1)]"
                      : isDoneStep
                      ? "bg-white/[0.03] border-[#D5B25D]/15"
                      : "bg-white/[0.015] border-white/5"
                  }`}
                >
                  {/* Side bar */}
                  {isActive && (
                    <div className={`absolute top-0 ${isRTL ? "right-0" : "left-0"} w-1 h-full bg-gradient-to-b from-[#D5B25D] to-[#E8C96A] rounded-full`} />
                  )}

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isActive
                      ? "bg-[#D5B25D] shadow-[0_0_22px_rgba(213,178,93,0.45)]"
                      : isDoneStep
                      ? "bg-[#D5B25D]/20 border border-[#D5B25D]/30"
                      : "bg-white/[0.04] border border-white/8"
                  }`}>
                    {isDoneStep && !isActive
                      ? <CheckCircle size={18} className="text-[#D5B25D]" />
                      : <Icon size={18} className={isActive ? "text-black" : "text-white/25"} />
                    }
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 mb-0.5 flex-wrap ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                      <span className={`text-[10px] font-black tracking-[0.2em] ${isActive || isDoneStep ? "text-[#D5B25D]" : "text-white/20"}`}>
                        0{stage.id}
                      </span>
                      {isDoneStep && !isActive && (
                        <span className="text-[9px] bg-[#D5B25D]/12 text-[#D5B25D] px-2 py-0.5 rounded-full font-black">✓ {tx(TX.done)}</span>
                      )}
                      {isActive && (
                        <span className="text-[9px] bg-[#D5B25D] text-black px-2 py-0.5 rounded-full font-black animate-pulse">
                          {tx(TX.inProgress)}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-black text-sm md:text-base leading-tight mb-1 transition-colors duration-300 ${
                      isActive ? "text-white" : isDoneStep ? "text-white/60" : "text-white/25"
                    }`}>
                      {tx(stage.title)}
                    </h3>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden"
                      >
                        <p className="text-white/50 text-xs md:text-sm leading-relaxed mb-2">
                          {tx(stage.desc)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(stage.tags[lang] || stage.tags.en).map((tag, j) => (
                            <motion.span
                              key={j}
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: j * 0.08 }}
                              className="text-[9px] bg-[#D5B25D]/10 border border-[#D5B25D]/25 text-[#D5B25D] px-2.5 py-1 rounded-full font-bold"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Progress bar */}
            <div className="mt-1 px-1">
              <div className="flex justify-between text-[9px] font-bold text-white/25 mb-1">
                <span>{tx(TX.progress)}</span>
                <span className="text-[#D5B25D]">{Math.round((builtFloors / TOTAL_FLOORS) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D5B25D] to-[#E8C96A] rounded-full"
                  animate={{ width: `${(builtFloors / TOTAL_FLOORS) * 100}%` }}
                  transition={{ duration: 0.28 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Done message */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-[#D5B25D]/15 via-[#D5B25D]/8 to-[#D5B25D]/15 border border-[#D5B25D]/30 rounded-2xl px-8 py-5 shadow-[0_0_60px_rgba(213,178,93,0.12)]">
              <Sparkles className="text-[#D5B25D]" size={20} />
              <p className="text-white font-black text-sm md:text-base">
                {tx(TX.complete)}
              </p>
              <Sparkles className="text-[#D5B25D]" size={20} />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
