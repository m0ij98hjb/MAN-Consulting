"use client";

import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/* ─── Editable data ─────────────────────────────────────────────────────── */

const VALUES = [
  {
    title:  { ar: "الجودة أولاً", en: "Quality First", hi: "गुणवत्ता सर्वोपरि", ru: "Качество прежде всего", de: "Qualität zuerst", es: "Calidad primero", fr: "La qualité d'abord", tr: "Önce Kalite", ur: "معیار سب سے پہلے", zh: "质量第一" },
    desc:   { ar: "نلتزم بأعلى معايير الجودة في كل تفصيلة من تفاصيل المشروع",
              en: "We commit to the highest quality standards in every project detail",
              hi: "हम परियोजना के हर विवरण में सर्वोच्च गुणवत्ता मानकों के लिए प्रतिबद्ध हैं",
              ru: "Мы придерживаемся высочайших стандартов качества в каждой детали проекта",
              de: "Wir verpflichten uns zu den höchsten Qualitätsstandards in jedem Projektdetail",
              es: "Nos comprometemos con los más altos estándares de calidad en cada detalle",
              fr: "Nous nous engageons aux normes de qualité les plus élevées dans chaque détail",
              tr: "Projenin her detayında en yüksek kalite standartlarına bağlı kalıyoruz",
              ur: "ہم منصوبے کی ہر تفصیل میں اعلیٰ ترین معیاری اصولوں کے پابند ہیں",
              zh: "我们致力于在项目的每个细节中遵循最高质量标准" },
    delay: "100",
  },
  {
    title:  { ar: "الابتكار المستمر", en: "Continuous Innovation", hi: "निरंतर नवाचार", ru: "Непрерывные инновации", de: "Kontinuierliche Innovation", es: "Innovación continua", fr: "Innovation continue", tr: "Sürekli İnovasyon", ur: "مسلسل جدت", zh: "持续创新" },
    desc:   { ar: "نطبّق أحدث التقنيات والأساليب الهندسية في كل أعمالنا",
              en: "We apply the latest engineering techniques and technologies",
              hi: "हम अपने सभी कार्यों में नवीनतम इंजीनियरिंग तकनीकों और तकनीकों को लागू करते हैं",
              ru: "Мы применяем новейшие инженерные методы и технологии во всех наших работах",
              de: "Wir wenden in allen unseren Arbeiten die neuesten Ingenieurtechniken an",
              es: "Aplicamos las últimas técnicas y tecnologías de ingeniería",
              fr: "Nous appliquons les dernières techniques et technologies d'ingénierie",
              tr: "Tüm çalışmalarımızda en son mühendislik tekniklerini uyguluyoruz",
              ur: "ہم اپنے تمام کاموں میں جدید ترین انجینئرنگ کی تکنیک کا اطلاق کرتے ہیں",
              zh: "我们在所有工作中应用最新的工程技术" },
    delay: "200",
  },
  {
    title:  { ar: "الشراكة الحقيقية", en: "True Partnership", hi: "सच्ची साझेदारी", ru: "Настоящее партнерство", de: "Echte Partnerschaft", es: "Verdadera asociación", fr: "Véritable partenariat", tr: "Gerçek Ortaklık", ur: "سچی شراکت داری", zh: "真诚合作" },
    desc:   { ar: "نبني علاقات استراتيجية طويلة الأمد مع عملائنا وشركائنا",
              en: "We build long-term strategic relationships with clients",
              hi: "हम ग्राहकों और भागीदारों के साथ दीर्घकालिक रणनीतिक संबंध बनाते हैं",
              ru: "Мы строим долгосрочные стратегические отношения с клиентами",
              de: "Wir bauen langfristige strategische Beziehungen zu Kunden auf",
              es: "Construimos relaciones estratégicas a largo plazo con nuestros clientes",
              fr: "Nous construisons des relations stratégiques à long terme avec nos clients",
              tr: "Müşterilerimizle uzun vadeli stratejik ilişkiler kuruyoruz",
              ur: "ہم اپنے کلائنٹس کے ساتھ طویل مدتی حکمت عملی پر مبنی تعلقات استوار کرتے ہیں",
              zh: "我们与客户建立长期的战略合作关系" },
    delay: "300",
  },
  {
    title:  { ar: "الالتزام بالمواعيد", en: "On-Time Delivery", hi: "समय पर डिलीवरी", ru: "Соблюдение сроков", de: "Pünktliche Lieferung", es: "Entrega a tiempo", fr: "Livraison dans les délais", tr: "Zamanında Teslimat", ur: "وقت کی پابندی", zh: "按时交付" },
    desc:   { ar: "نسلّم مشاريعنا في الوقت المحدد دون أي تنازل عن الجودة",
              en: "We deliver on schedule without compromising quality",
              hi: "हम गुणवत्ता से समझौता किए बिना समय पर अपनी परियोजनाएं वितरित करते हैं",
              ru: "Мы сдаем наши проекты в срок без ущерба для качества",
              de: "Wir liefern pünktlich ohne Kompromisse bei der Qualität",
              es: "Entregamos a tiempo sin comprometer la calidad",
              fr: "Nous livrons dans les délais sans compromettre la qualité",
              tr: "Kaliteden ödün vermeden zamanında teslim ediyoruz",
              ur: "ہم معیار پر کوئی سمجھوتہ کیے بغیر وقت پر اپنے منصوبے فراہم کرتے ہیں",
              zh: "我们在不妥协质量的前提下按时交付项目" },
    delay: "400",
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

const Vision = () => {
  const { lang, isRTL } = useLanguage();

  const tx = (obj) => obj[lang] || obj.en;

  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >

      {/* ── Blueprint grid ──────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(213,178,93,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(213,178,93,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Ambient glows ───────────────────────────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/10 to-transparent" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-[#D5B25D]/[0.04] blur-[140px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#D5B25D]/[0.03] blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">

        {/* ── Section Header ──────────────────────────────────────────────── */}
        <div className={`mb-16 ${isRTL ? 'text-right' : 'text-left'}`} data-aos="fade-up">

          {/* Eyebrow */}
          <div className={`inline-flex items-center gap-3 mb-5 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D5B25D]" />
            <span className="text-[#D5B25D] font-bold tracking-[0.2em] uppercase text-[11px]">
              {{ ar: "رؤية وخبرة", en: "Vision & Expertise", zh: "愿景与专长",
                 es: "Visión y experiencia", fr: "Vision et expertise",
                 de: "Vision & Expertise", tr: "Vizyon & Uzmanlık", ur: "وژن اور مہارت",
                 hi: "दृष्टि और विशेषज्ञता", ru: "Видение и опыт" }[lang] || "Vision & Expertise"}
            </span>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D5B25D]" />
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4" data-aos="fade-up" data-aos-delay="100">
            <span className="text-white block">
              {{ ar: "نحن لا نبني مشاريع فقط", en: "We Don't Just Build Projects",
                 zh: "我们不只是建造项目", es: "No solo construimos proyectos",
                 fr: "Nous ne construisons pas que des projets",
                 de: "Wir bauen nicht nur Projekte",
                 tr: "Sadece proje inşa etmiyoruz", ur: "ہم صرف منصوبے نہیں بناتے",
                 hi: "हम केवल परियोजनाएं नहीं बनाते", ru: "Мы не просто строим объекты" }[lang] || "We Don't Just Build Projects"}
            </span>
            <span className="text-gradient">
              {{ ar: "نحن نصنع معالم معمارية خالدة", en: "We Create Timeless Architectural Landmarks",
                 zh: "我们创造永恒的建筑地标", es: "Creamos hitos arquitectónicos atemporales",
                 fr: "Nous créons des repères architecturaux intemporels",
                 de: "Wir schaffen zeitlose architektonische Wahrzeichen",
                 tr: "Zamansız mimari yapıtlar yaratıyoruz", ur: "ہم لازوال معمارانہ شاہکار بناتے ہیں",
                 hi: "हम कालातीत वास्तुकला के लैंडमार्क बनाते हैं", ru: "Мы создаем вечные архитектурные шедевры" }[lang] || "We Create Timeless Architectural Landmarks"}
            </span>
          </h2>

          {/* Gold underline */}
          <div className={`h-1 w-16 rounded-full bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] ${isRTL ? 'mr-0' : 'ml-0'}`} data-aos="fade-up" data-aos-delay="150" />

          {/* Description */}
          <p className="mt-6 text-white/50 text-base md:text-lg leading-relaxed max-w-2xl" data-aos="fade-up" data-aos-delay="200">
            {{ ar: "شركة MNC للمقاولات تجمع بين الخبرة الراسخة والرؤية الاستشرافية لتقديم مشاريع تتجاوز التوقعات — من التصميم إلى التسليم.",
               en: "MNC Construction bridges deep expertise with forward-thinking vision to deliver projects that exceed expectations — from design to handover.",
               zh: "MNC建筑将深厚的专业知识与前瞻性愿景相结合，提供超出预期的项目。",
               fr: "MNC Construction allie expertise solide et vision prospective pour livrer des projets dépassant les attentes.",
               es: "MNC Construction combina experiencia sólida con visión prospectiva para entregar proyectos que superan las expectativas.",
               de: "MNC verbindet tiefe Expertise mit zukunftsorientierter Vision für Projekte, die Erwartungen übertreffen.",
               tr: "MNC, derin uzmanlığı ileri görüşlü bir vizyonla birleştirerek beklentilerin ötesinde projeler sunar.",
               ur: "MNC تعمیرات گہری مہارت اور دور اندیش وژن کو یکجا کرکے توقعات سے بڑھ کر منصوبے فراہم کرتی ہے۔",
               hi: "MNC कंस्ट्रक्शन डिजाइन से लेकर हैंडओवर तक, अपेक्षाओं से परे परियोजनाएं देने के लिए गहरी विशेषज्ञता को दूरदर्शी दृष्टि के साथ जोड़ती है।",
               ru: "MNC Construction объединяет глубокий опыт с перспективным видением для создания проектов, превосходящих ожидания."
            }[lang] || "MNC Construction bridges deep expertise with forward-thinking vision to deliver projects that exceed expectations."}
          </p>
        </div>

        {/* ── Vision + Mission Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {[
            {
              label: { ar: "رؤيتنا",    en: "Our Vision",   zh: "我们的愿景", fr: "Notre Vision",   es: "Nuestra Visión",   de: "Unsere Vision",  tr: "Vizyonumuz",  ur: "ہمارا وژن",  hi: "हमारी दृष्टि",  ru: "Наше видение"  },
              text:  { ar: "أن نكون الشركة الرائدة في قطاع الإنشاءات على مستوى المنطقة، من خلال تقديم مشاريع استثنائية تجمع بين الجودة والابتكار والاستدامة.",
                       en: "To be the leading construction company in the region by delivering exceptional projects that blend quality, innovation, and sustainability.",
                       hi: "गुणवत्ता, नवाचार और स्थिरता को जोड़ने वाली असाधारण परियोजनाएं प्रदान करके क्षेत्र में अग्रणी निर्माण कंपनी बनना।",
                       ru: "Быть ведущей строительной компанией в регионе, реализуя исключительные проекты, сочетающие качество, инновации и устойчивость.",
                       de: "Das führende Bauunternehmen der Region zu sein, indem wir außergewöhnliche Projekte liefern.",
                       es: "Ser la empresa de construcción líder en la región entregando proyectos excepcionales.",
                       fr: "Être la première entreprise de construction de la région en réalisant des projets d'exception.",
                       tr: "Kalite, yenilik ve sürdürülebilirliği harmanlayan olağanüstü projeler sunarak bölgenin lider inşaat şirketi olmak.",
                       ur: "اعلیٰ معیار، جدت اور پائیداری کو جوڑنے والے غیر معمولی منصوبے فراہم کرکے خطے کی اہم تعمیراتی کمپنی بننا۔",
                       zh: "通过交付融合质量、创新和可持续性的卓越项目，成为该地区领先的建筑公司。" },
              num: "01",
              delay: "100",
            },
            {
              label: { ar: "رسالتنا",   en: "Our Mission",  zh: "我们的使命", fr: "Notre Mission",  es: "Nuestra Misión",  de: "Unsere Mission", tr: "Misyonumuz", ur: "ہمارا مشن", hi: "हमारा मिशन", ru: "Наша миссия" },
              text:  { ar: "تحقيق طموحات عملائنا من خلال تنفيذ مشاريع بأعلى معايير الجودة والسلامة، وبناء شراكات مبنية على الثقة والشفافية.",
                       en: "Realising our clients' ambitions through projects built to the highest standards of quality and safety, founded on trust and transparency.",
                       hi: "विश्वास और पारदर्शिता पर आधारित गुणवत्ता और सुरक्षा के उच्चतम मानकों के साथ परियोजनाओं के माध्यम से अपने ग्राहकों की आकांक्षाओं को पूरा करना।",
                       ru: "Реализация амбиций наших клиентов через проекты, построенные по высочайшим стандартам качества и безопасности.",
                       de: "Die Ambitionen unserer Kunden durch Projekte nach höchsten Qualitäts- und Sicherheitsstandards zu verwirklichen.",
                       es: "Hacer realidad las ambiciones de nuestros clientes a través de proyectos construidos con los más altos estándares.",
                       fr: "Réaliser les ambitions de nos clients grâce à des projets répondant aux normes les plus élevées.",
                       tr: "Müşterilerimizin beklentilerini en yüksek kalite ve güvenlik standartlarında projelerle karşılamak.",
                       ur: "اعتماد اور شفافیت پر مبنی اعلیٰ ترین معیار اور حفاظت کے ساتھ اپنے کلائنٹس کی خواہشات کو پورا کرنا۔",
                       zh: "通过以最高质量和安全标准构建的项目，实现客户的抱负。" },
              num: "02",
              delay: "200",
            },
          ].map((card) => (
            <div
              key={card.num}
              className="group relative rounded-2xl p-7 overflow-hidden transition-all duration-500 cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B25D]/60"
              tabIndex={0}
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
              data-aos-delay={card.delay}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner brackets */}
              <span aria-hidden="true"
                className={`absolute top-3 w-4 h-4 transition-colors duration-500 ${isRTL ? 'right-3' : 'left-3'}`}
                style={{ borderTop: '1px solid rgba(213,178,93,0.3)', [isRTL ? 'borderRight' : 'borderLeft']: '1px solid rgba(213,178,93,0.3)' }}
              />
              <span aria-hidden="true"
                className={`absolute bottom-3 w-4 h-4 transition-colors duration-500 ${isRTL ? 'left-3' : 'right-3'}`}
                style={{ borderBottom: '1px solid rgba(213,178,93,0.3)', [isRTL ? 'borderLeft' : 'borderRight']: '1px solid rgba(213,178,93,0.3)' }}
              />

              {/* Number watermark */}
              <span className={`absolute top-4 ${isRTL ? 'left-5' : 'right-5'} text-6xl font-black text-white/[0.03] group-hover:text-[#D5B25D]/[0.07] transition-colors duration-500 select-none leading-none`}>
                {card.num}
              </span>

              {/* Gold pill label */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full"
                style={{ background: "rgba(213,178,93,0.1)", border: "1px solid rgba(213,178,93,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5B25D]" />
                <span className="text-[#D5B25D] text-[11px] font-bold tracking-widest uppercase">
                  {tx(card.label)}
                </span>
              </div>

              <p className="text-white/55 text-sm md:text-base leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                {tx(card.text)}
              </p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D5B25D]/0 to-transparent group-hover:via-[#D5B25D]/20 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* ── Values 2×2 Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VALUES.map((val, i) => (
            <div
              key={i}
              className="group flex items-start gap-4 rounded-xl p-5 transition-all duration-400 cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B25D]/60"
              tabIndex={0}
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(213,178,93,0.07)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(213,178,93,0.04)";
                e.currentTarget.style.border = "1px solid rgba(213,178,93,0.18)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.015)";
                e.currentTarget.style.border = "1px solid rgba(213,178,93,0.07)";
              }}
              data-aos="fade-up"
              data-aos-delay={val.delay}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: "rgba(213,178,93,0.1)", border: "1px solid rgba(213,178,93,0.2)" }}>
                <CheckCircle2 size={16} className="text-[#D5B25D]" />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1 min-w-0">
                <h4 className="text-white font-bold text-sm md:text-base leading-snug group-hover:text-[#D5B25D] transition-colors duration-300">
                  {tx(val.title)}
                </h4>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed group-hover:text-white/55 transition-colors duration-300">
                  {tx(val.desc)}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Vision;
