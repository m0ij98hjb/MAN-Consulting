const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');

const langs = [
  {
    code: 'ar',
    voice: 'ar-EG-SalmaNeural',
    lang: 'ar-SA',
    rate: '-10%',
    text: `مرحباً بكم في شركة ام ان سي للانشاءات.

تعد شركة إم إن سي علامة هندسية متميزة في مجال البناء والتطوير، تأسست في مدينة جدة بالمملكة العربية السعودية، وأثبتت خلال فترة وجيزة حضوراً قوياً في السوق الهندسي، من خلال تنفيذ مشاريع عديدة تكللت بالنجاح بفضل الله.

يقود هذه الشركة المتميزة المدير التنفيذي المهندس مروان أحمد ناظر، صاحب الخبرة الهندسية الواسعة، وتحت إشرافه المباشر تعمل الشركة على تحقيق أعلى معايير الجودة في كل مشروع تتولى تنفيذه.

تقدم شركة إم إن سي باقة متكاملة من الخدمات الهندسية الاحترافية، تشمل: مشاريع المقاولات من خلال الدراسة والتنفيذ الكامل، والتصميم المعماري بأفكار مبتكرة وحلول عصرية، وإدارة المشاريع بإشراف متكامل على جميع مراحل التنفيذ، فضلاً عن التصميم الداخلي والديكور والتشطيب بأعلى مستوى من الجودة والأناقة.

شركة إم إن سي، حيث تتحول رؤيتكم إلى واقع هندسي متميز. شكراً لزيارتكم.`,
  },
  {
    code: 'ur',
    voice: 'ur-PK-UzmaNeural',
    lang: 'ur-PK',
    rate: '-10%',
    text: `ایم این سی کنسٹرکشن میں خوش آمدید۔

ایم این سی تعمیر اور ترقی کے شعبے میں ایک ممتاز انجینئرنگ برانڈ ہے، جو سعودی عرب کے شہر جدہ میں قائم کی گئی ہے۔

کمپنی کی قیادت سی ای او انجینئر مروان احمد ناظر کر رہے ہیں، جو وسیع انجینئرنگ تجربے کے حامل ہیں۔ ان کی براہ راست نگرانی میں کمپنی ہر منصوبے میں معیار کی اعلیٰ سطح حاصل کرنے کی کوشش کرتی ہے۔

ایم این سی پیشہ ورانہ انجینئرنگ خدمات کا ایک جامع پیکیج پیش کرتی ہے، جس میں ٹھیکیداری کے منصوبے، تعمیراتی ڈیزائن، پروجیکٹ مینیجمنٹ اور اندرونی ڈیزائن اور فنشنگ شامل ہیں۔

ایم این سی، جہاں آپ کا وژن ایک غیر معمولی انجینئرنگ حقیقت بن جاتا ہے۔ آپ کی زیارت کا شکریہ۔`,
  },
  {
    code: 'en',
    voice: 'en-US-JennyNeural',
    lang: 'en-US',
    rate: '-5%',
    text: `Welcome to MNC Construction Company.

MNC is a distinguished engineering brand in the field of construction and development, established in Jeddah, Saudi Arabia. Within a short period, the company has built a strong presence in the engineering market by successfully completing numerous projects.

The company is led by CEO Engineer Marwan Ahmed Nazer, with vast engineering expertise. Under his direct supervision, MNC strives to achieve the highest quality standards in every project.

MNC offers a comprehensive package of professional engineering services, including contracting projects, architectural design with innovative ideas, integrated project management, and interior design and finishing at the highest level of quality and elegance.

MNC — where your vision becomes outstanding engineering reality. We look forward to serving you. Thank you for visiting us.`,
  },
  {
    code: 'fr',
    voice: 'fr-FR-DeniseNeural',
    lang: 'fr-FR',
    rate: '-5%',
    text: `Bienvenue chez MNC Construction.

MNC est une marque d'ingénierie distinguée dans le domaine de la construction et du développement, fondée à Djeddah, en Arabie Saoudite. En peu de temps, la société a établi une forte présence sur le marché de l'ingénierie grâce à la réalisation réussie de nombreux projets.

La société est dirigée par le PDG, l'ingénieur Marwan Ahmed Nazer, doté d'une vaste expertise en ingénierie. MNC offre un ensemble complet de services d'ingénierie professionnels, comprenant des projets de construction, la conception architecturale, la gestion de projets et la conception intérieure.

MNC, où votre vision devient une réalité d'ingénierie remarquable. Merci de nous rendre visite.`,
  },
  {
    code: 'de',
    voice: 'de-DE-KatjaNeural',
    lang: 'de-DE',
    rate: '-5%',
    text: `Willkommen bei MNC Bau.

MNC ist eine herausragende Ingenieurmarke im Bereich Bau und Entwicklung, gegründet in Dschidda, Saudi-Arabien. In kurzer Zeit hat das Unternehmen durch die erfolgreiche Umsetzung zahlreicher Projekte eine starke Präsenz auf dem Ingenieurmarkt aufgebaut.

Das Unternehmen wird vom CEO, Ingenieur Marwan Ahmed Nazer, mit umfangreicher Ingenieurfachkenntnis geleitet. MNC bietet ein umfassendes Paket professioneller Ingenieurdienstleistungen an, darunter Bauprojekte, Architekturdesign, Projektmanagement und Innenarchitektur.

MNC, wo Ihre Vision zur herausragenden Ingenieurwirklichkeit wird. Vielen Dank für Ihren Besuch.`,
  },
  {
    code: 'es',
    voice: 'es-ES-ElviraNeural',
    lang: 'es-ES',
    rate: '-5%',
    text: `Bienvenidos a MNC Construcción.

MNC es una marca de ingeniería distinguida en el campo de la construcción y el desarrollo, fundada en Yeda, Arabia Saudita. En poco tiempo, la empresa ha establecido una fuerte presencia en el mercado de la ingeniería mediante la exitosa ejecución de numerosos proyectos.

La empresa está dirigida por el Director Ejecutivo, el Ingeniero Marwan Ahmed Nazer, con vasta experiencia en ingeniería. MNC ofrece un paquete completo de servicios de ingeniería profesionales, que incluyen proyectos de contratación, diseño arquitectónico, gestión de proyectos y diseño de interiores.

MNC, donde su visión se convierte en una realidad de ingeniería sobresaliente. Gracias por visitarnos.`,
  },
  {
    code: 'tr',
    voice: 'tr-TR-EmelNeural',
    lang: 'tr-TR',
    rate: '-5%',
    text: `MNC İnşaat'a hoş geldiniz.

MNC, Suudi Arabistan'ın Cidde şehrinde kurulmuş, inşaat ve geliştirme alanında seçkin bir mühendislik markasıdır. Kısa sürede çok sayıda projeyi başarıyla tamamlayarak mühendislik pazarında güçlü bir varlık oluşturmuştur.

Şirket, geniş mühendislik deneyimiyle CEO Mühendis Marwan Ahmed Nazer tarafından yönetilmektedir. MNC, müteahhitlik projeleri, mimari tasarım, proje yönetimi ve iç mimarlık dahil kapsamlı profesyonel mühendislik hizmetleri sunmaktadır.

MNC, vizyonunuzun olağanüstü bir mühendislik gerçekliğine dönüştüğü yer. Bizi ziyaret ettiğiniz için teşekkür ederiz.`,
  },
  {
    code: 'zh',
    voice: 'zh-CN-XiaoxiaoNeural',
    lang: 'zh-CN',
    rate: '-5%',
    text: `欢迎来到MNC建筑公司。

MNC是建筑与开发领域一个杰出的工程品牌，成立于沙特阿拉伯吉达市。在短时间内，公司通过成功完成众多项目，在工程市场建立了强大的影响力。

公司由首席执行官工程师马尔万·艾哈迈德·纳泽尔领导，拥有丰富的工程经验。MNC提供全面的专业工程服务，包括承包项目、建筑设计、项目管理以及室内设计与精装修。

MNC——让您的愿景成为卓越的工程现实。感谢您的来访。`,
  },
  {
    code: 'hi',
    voice: 'hi-IN-SwaraNeural',
    lang: 'hi-IN',
    rate: '-5%',
    text: `एमएनसी कंस्ट्रक्शन कंपनी में आपका स्वागत है।

एमएनसी निर्माण और विकास के क्षेत्र में एक उत्कृष्ट इंजीनियरिंग ब्रांड है, जिसकी स्थापना सऊदी अरब के जेद्दा शहर में हुई है। बहुत ही कम समय में कंपनी ने कई सफल परियोजनाओं को पूरा करके इंजीनियरिंग बाजार में एक मजबूत पहचान बनाई है।

कंपनी का नेतृत्व विशाल इंजीनियरिंग अनुभव वाले सीईओ इंजीनियर मारवान अहमद नाज़र कर रहे हैं। उनके सीधे मार्गदर्शन में कंपनी हर परियोजना में गुणवत्ता के उच्चतम मानकों को प्राप्त करने का प्रयास करती है।

एमएनसी पेशेवर इंजीनियरिंग सेवाओं का एक संपूर्ण पैकेज प्रदान करती है, जिसमें ठेकेदारी परियोजनाएं, नवीन विचारों के साथ वास्तुकला डिज़ाइन, एकीकृत परियोजना प्रबंधन और उच्चतम गुणवत्ता वाला इंटीरियर डिज़ाइन शामिल है।

एमएनसी — जहाँ आपकी सोच एक उत्कृष्ट इंजीनियरिंग वास्तविकता बनती है। हमसे जुड़ने के लिए धन्यवाद।`,
  },
];

async function generateAll() {
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
    console.log(`  ✓ done`);
  }
  console.log('\nAll audio files generated!');
}

generateAll().catch(console.error);
