// Regenerates all 9 presentation MP3s (Arabic + 8 languages) with the new
// full "MAN Engineering Consultancy" master text. Voice/lang/rate per
// language are copied unchanged from generate_tts_all.js.
const { EdgeTTS } = require('node-edge-tts');

const langs = [
  {
    code: 'ar',
    voice: 'ar-EG-SalmaNeural',
    lang: 'ar-SA',
    rate: '-10%',
    text: `مرحبًا بكم في شركة MAN للاستشارات الهندسية.

تُعد شركة MAN للاستشارات الهندسية علامة هندسية متميزة في مجال الاستشارات والتصميم الهندسي، تأسست في مدينة جدة بالمملكة العربية السعودية، وأثبتت خلال فترة وجيزة حضورًا قويًا في السوق الهندسي، من خلال تنفيذ عدة مشاريع تكللت بالنجاح بفضل الله.

يقود هذه الشركة المتميزة رئيس مجلس الإدارة المهندس مروان أحمد ناظر، صاحب الخبرة الهندسية الواسعة، وتحت إشرافه المباشر تعمل الشركة على تحقيق أعلى معايير الجودة في كل مشروع تتولى تنفيذه.

تقدم شركة MAN للاستشارات الهندسية باقة متكاملة من الخدمات الهندسية الاحترافية، تشمل: التصميم المعماري بأفكار مبتكرة وحلول عصرية، وإدارة المشاريع بإشراف متكامل على جميع مراحل التنفيذ، فضلًا عن التصميم الداخلي والديكور والتشطيب بأعلى مستوى من الجودة والأناقة.

شكرًا لزيارتكم، شركة MAN للاستشارات الهندسية، حيث تتحول رؤيتكم إلى واقع هندسي متميز.`,
  },
  {
    code: 'en',
    voice: 'en-US-JennyNeural',
    lang: 'en-US',
    rate: '-5%',
    text: `Welcome to MAN Engineering Consultancy.

MAN Engineering Consultancy is a distinguished engineering brand in engineering consulting and design, established in Jeddah, Saudi Arabia. Within a short period, it has built a strong presence in the engineering market by successfully delivering numerous projects, thanks to God.

This distinguished company is led by Chairman Eng. Marwan Ahmed Nazer, who brings extensive engineering expertise. Under his direct supervision, the company works to achieve the highest quality standards in every project it undertakes.

MAN Engineering Consultancy offers a comprehensive package of professional engineering services, including architectural design with innovative ideas and modern solutions, project management with integrated supervision across all execution phases, as well as interior design, decor, and finishing at the highest level of quality and elegance.

Thank you for visiting us. MAN Engineering Consultancy — where your vision becomes an outstanding engineering reality.`,
  },
  {
    code: 'de',
    voice: 'de-DE-KatjaNeural',
    lang: 'de-DE',
    rate: '-5%',
    text: `Willkommen bei MAN Engineering Consultancy.

MAN Engineering Consultancy ist eine herausragende Ingenieurmarke im Bereich technische Beratung und Design, gegründet in Jeddah, Saudi-Arabien. In kurzer Zeit hat sie sich durch die erfolgreiche Umsetzung zahlreicher Projekte eine starke Präsenz auf dem Ingenieurmarkt erarbeitet.

Dieses herausragende Unternehmen wird vom Vorstandsvorsitzenden, Ingenieur Marwan Ahmed Nazer, geleitet, der über umfangreiche technische Erfahrung verfügt. Unter seiner direkten Aufsicht arbeitet das Unternehmen daran, in jedem Projekt höchste Qualitätsstandards zu erreichen.

MAN Engineering Consultancy bietet ein umfassendes Paket professioneller Ingenieurdienstleistungen an, darunter architektonisches Design mit innovativen Ideen und modernen Lösungen, Projektmanagement mit ganzheitlicher Betreuung aller Ausführungsphasen sowie Innenarchitektur, Dekoration und Ausbau auf höchstem Niveau an Qualität und Eleganz.

Vielen Dank für Ihren Besuch. MAN Engineering Consultancy — wo Ihre Vision zu einer herausragenden ingenieurtechnischen Realität wird.`,
  },
  {
    code: 'es',
    voice: 'es-ES-ElviraNeural',
    lang: 'es-ES',
    rate: '-5%',
    text: `Bienvenidos a MAN Engineering Consultancy.

MAN Engineering Consultancy es una destacada marca de ingeniería en el ámbito de la consultoría y el diseño de ingeniería, fundada en Yeda, Arabia Saudita. En poco tiempo, ha logrado una fuerte presencia en el mercado de la ingeniería mediante la ejecución exitosa de numerosos proyectos.

Esta destacada empresa está dirigida por el presidente del consejo de administración, el ingeniero Marwan Ahmed Nazer, quien posee una amplia experiencia en ingeniería. Bajo su supervisión directa, la empresa trabaja para alcanzar los más altos estándares de calidad en cada proyecto que emprende.

MAN Engineering Consultancy ofrece un paquete integral de servicios de ingeniería profesionales, que incluye diseño arquitectónico con ideas innovadoras y soluciones modernas, gestión de proyectos con supervisión integral en todas las fases de ejecución, además de diseño de interiores, decoración y acabados con el más alto nivel de calidad y elegancia.

Gracias por visitarnos. MAN Engineering Consultancy, donde su visión se convierte en una extraordinaria realidad de ingeniería.`,
  },
  {
    code: 'fr',
    voice: 'fr-FR-DeniseNeural',
    lang: 'fr-FR',
    rate: '-5%',
    text: `Bienvenue chez MAN Engineering Consultancy.

MAN Engineering Consultancy est une marque d'ingénierie distinguée dans le domaine du conseil et de la conception en ingénierie, fondée à Djeddah, en Arabie saoudite. En peu de temps, elle a su s'imposer solidement sur le marché de l'ingénierie grâce à la réalisation réussie de nombreux projets.

Cette entreprise distinguée est dirigée par le président du conseil d'administration, l'ingénieur Marwan Ahmed Nazer, fort d'une vaste expérience en ingénierie. Sous sa supervision directe, l'entreprise s'efforce d'atteindre les plus hauts standards de qualité dans chaque projet qu'elle entreprend.

MAN Engineering Consultancy propose une gamme complète de services d'ingénierie professionnels, comprenant la conception architecturale avec des idées innovantes et des solutions modernes, la gestion de projets avec une supervision intégrée sur toutes les phases d'exécution, ainsi que la décoration intérieure et les finitions au plus haut niveau de qualité et d'élégance.

Merci de votre visite. MAN Engineering Consultancy, là où votre vision devient une réalité d'ingénierie exceptionnelle.`,
  },
  {
    code: 'tr',
    voice: 'tr-TR-EmelNeural',
    lang: 'tr-TR',
    rate: '-5%',
    text: `MAN Engineering Consultancy'e hoş geldiniz.

MAN Engineering Consultancy, mühendislik danışmanlığı ve tasarımı alanında öne çıkan bir mühendislik markasıdır ve Suudi Arabistan'ın Cidde şehrinde kurulmuştur. Kısa bir süre içinde, birçok projeyi başarıyla tamamlayarak mühendislik pazarında güçlü bir varlık oluşturmuştur.

Bu seçkin şirkete, geniş mühendislik deneyimine sahip Yönetim Kurulu Başkanı Mühendis Marwan Ahmed Nazer liderlik etmektedir. Onun doğrudan gözetimi altında şirket, üstlendiği her projede en yüksek kalite standartlarını sağlamaya çalışmaktadır.

MAN Engineering Consultancy; yenilikçi fikirler ve modern çözümlerle mimari tasarımı, tüm uygulama aşamalarında bütünleşik denetimle proje yönetimini, ayrıca en yüksek kalite ve zarafet seviyesinde iç mekân tasarımı, dekorasyon ve tamamlama hizmetlerini kapsayan kapsamlı bir profesyonel mühendislik hizmetleri paketi sunmaktadır.

Ziyaretiniz için teşekkür ederiz. MAN Engineering Consultancy — vizyonunuzun olağanüstü bir mühendislik gerçekliğine dönüştüğü yer.`,
  },
  {
    code: 'zh',
    voice: 'zh-CN-XiaoxiaoNeural',
    lang: 'zh-CN',
    rate: '-5%',
    text: `欢迎来到MAN工程咨询公司。

MAN工程咨询公司是工程咨询与设计领域一个卓越的工程品牌，创立于沙特阿拉伯吉达市。在短时间内，公司凭借成功完成的多个项目，在工程市场上建立了强大的影响力。

公司由董事长马尔万·艾哈迈德·纳泽尔工程师领导，他拥有丰富的工程经验。在他的直接监督下，公司致力于在其承接的每一个项目中实现最高质量标准。

MAN工程咨询公司提供全面的专业工程服务，包括以创新理念和现代解决方案进行的建筑设计、对所有施工阶段进行全面监督的项目管理，以及达到最高质量与优雅水准的室内设计、装饰与装修服务。

感谢您的光临。MAN工程咨询公司——让您的愿景变为卓越的工程现实。`,
  },
  {
    code: 'hi',
    voice: 'hi-IN-SwaraNeural',
    lang: 'hi-IN',
    rate: '-5%',
    text: `एमएएन इंजीनियरिंग कंसल्टेंसी में आपका स्वागत है।

एमएएन इंजीनियरिंग कंसल्टेंसी इंजीनियरिंग परामर्श और डिज़ाइन के क्षेत्र में एक उत्कृष्ट इंजीनियरिंग ब्रांड है, जिसकी स्थापना सऊदी अरब के जेद्दा शहर में हुई थी। बहुत ही कम समय में, कंपनी ने कई परियोजनाओं को सफलतापूर्वक पूरा करके इंजीनियरिंग बाज़ार में एक मजबूत उपस्थिति स्थापित की है।

इस उत्कृष्ट कंपनी का नेतृत्व अध्यक्ष इंजीनियर मारवान अहमद नाज़र कर रहे हैं, जिनके पास व्यापक इंजीनियरिंग अनुभव है। उनके सीधे मार्गदर्शन में, कंपनी हर परियोजना में उच्चतम गुणवत्ता मानकों को प्राप्त करने के लिए कार्य करती है।

एमएएन इंजीनियरिंग कंसल्टेंसी पेशेवर इंजीनियरिंग सेवाओं का एक संपूर्ण पैकेज प्रदान करती है, जिसमें नवीन विचारों और आधुनिक समाधानों के साथ वास्तुकला डिज़ाइन, सभी क्रियान्वयन चरणों में एकीकृत निरीक्षण के साथ परियोजना प्रबंधन, और साथ ही उच्चतम गुणवत्ता व सुंदरता के साथ इंटीरियर डिज़ाइन, सजावट और फिनिशिंग शामिल हैं।

आपकी यात्रा के लिए धन्यवाद। एमएएन इंजीनियरिंग कंसल्टेंसी — जहाँ आपकी सोच एक उत्कृष्ट इंजीनियरिंग वास्तविकता बनती है।`,
  },
  {
    code: 'ur',
    voice: 'ur-PK-UzmaNeural',
    lang: 'ur-PK',
    rate: '-10%',
    text: `ایم اے این انجینئرنگ کنسلٹنسی میں خوش آمدید۔

ایم اے این انجینئرنگ کنسلٹنسی انجینئرنگ مشاورت اور ڈیزائن کے شعبے میں ایک ممتاز انجینئرنگ برانڈ ہے، جس کی بنیاد سعودی عرب کے شہر جدہ میں رکھی گئی۔ بہت کم عرصے میں، کمپنی نے متعدد منصوبوں کو کامیابی سے مکمل کر کے انجینئرنگ مارکیٹ میں مضبوط موجودگی قائم کی ہے۔

اس ممتاز کمپنی کی قیادت چیئرمین انجینئر مروان احمد ناظر کر رہے ہیں، جو وسیع انجینئرنگ تجربے کے حامل ہیں۔ ان کی براہ راست نگرانی میں کمپنی ہر منصوبے میں اعلیٰ ترین معیار کے حصول کے لیے کام کرتی ہے۔

ایم اے این انجینئرنگ کنسلٹنسی پیشہ ورانہ انجینئرنگ خدمات کا ایک مکمل پیکیج پیش کرتی ہے، جس میں جدید خیالات اور عصری حل کے ساتھ تعمیراتی ڈیزائن، تمام مراحل پر مکمل نگرانی کے ساتھ پراجیکٹ مینجمنٹ، اور اعلیٰ ترین معیار اور خوبصورتی کے ساتھ اندرونی ڈیزائن، آرائش اور فنشنگ شامل ہیں۔

آپ کی زیارت کا شکریہ۔ ایم اے این انجینئرنگ کنسلٹنسی — جہاں آپ کا وژن ایک شاندار انجینئرنگ حقیقت بن جاتا ہے۔`,
  },
];

async function run() {
  for (const l of langs) {
    const tts = new EdgeTTS({
      voice: l.voice,
      lang: l.lang,
      rate: l.rate,
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });
    const out = `public/asstes/presentation-${l.code}.mp3`;
    console.log(`Generating ${out} ...`);
    await tts.ttsPromise(l.text, out);
    console.log(`  done`);
  }
  console.log('All 9 presentation audio files regenerated with the new master text.');
}

run().catch(console.error);
