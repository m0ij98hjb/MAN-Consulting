// Regenerates the pre-recorded voice-presentation MP3s with the updated
// "MAN Engineering Consultancy" brand text. Voice/lang/rate per language are
// copied unchanged from generate_tts_all.js. Arabic is intentionally NOT in
// this list — presentation-ar.mp3 must never be touched by this script.
const { EdgeTTS } = require('node-edge-tts');

const langs = [
  {
    code: 'en',
    voice: 'en-US-JennyNeural',
    lang: 'en-US',
    rate: '-5%',
    text: `MAN Engineering Consultancy is a leading engineering brand in design and engineering consultancy, established in Jeddah, Saudi Arabia. We provide architectural and structural design, project management, and engineering supervision services with the highest standards of quality and professionalism. Contact us today for a professional consultation.`,
  },
  {
    code: 'de',
    voice: 'de-DE-KatjaNeural',
    lang: 'de-DE',
    rate: '-5%',
    text: `MAN Engineering Consultancy ist eine führende Ingenieurmarke im Bereich Design und technische Beratung mit Sitz in Jeddah, Saudi-Arabien. Wir bieten architektonische und statische Planung, Projektmanagement und technische Bauüberwachung mit höchsten Standards an Qualität und Professionalität. Kontaktieren Sie uns noch heute für eine professionelle Beratung.`,
  },
  {
    code: 'es',
    voice: 'es-ES-ElviraNeural',
    lang: 'es-ES',
    rate: '-5%',
    text: `MAN Engineering Consultancy es una marca de ingeniería líder en diseño y consultoría de ingeniería, fundada en Yeda, Arabia Saudita. Ofrecemos diseño arquitectónico y estructural, gestión de proyectos y supervisión de ingeniería con los más altos estándares de calidad y profesionalismo. Contáctenos hoy para una consulta profesional.`,
  },
  {
    code: 'fr',
    voice: 'fr-FR-DeniseNeural',
    lang: 'fr-FR',
    rate: '-5%',
    text: `MAN Engineering Consultancy est une marque d'ingénierie de premier plan dans le conseil et la conception en ingénierie, fondée à Djeddah, en Arabie saoudite. Nous proposons des services de conception architecturale et structurelle, de gestion de projets et de supervision technique avec les plus hauts standards de qualité et de professionnalisme. Contactez-nous dès aujourd'hui pour une consultation professionnelle.`,
  },
  {
    code: 'tr',
    voice: 'tr-TR-EmelNeural',
    lang: 'tr-TR',
    rate: '-5%',
    text: `MAN Engineering Consultancy, Suudi Arabistan'ın Cidde şehrinde kurulmuş, tasarım ve mühendislik danışmanlığı alanında öncü bir mühendislik markasıdır. Mimari ve yapısal tasarım, proje yönetimi ve mühendislik denetim hizmetlerini en yüksek kalite ve profesyonellik standartlarıyla sunuyoruz. Profesyonel bir danışma için bugün bizimle iletişime geçin.`,
  },
  {
    code: 'zh',
    voice: 'zh-CN-XiaoxiaoNeural',
    lang: 'zh-CN',
    rate: '-5%',
    text: `MAN工程咨询是设计与工程咨询领域的领先工程品牌，创立于沙特阿拉伯吉达。我们提供建筑与结构设计、项目管理和工程监理服务，秉持最高的质量和专业标准。立即联系我们，获取专业咨询。`,
  },
  {
    code: 'hi',
    voice: 'hi-IN-SwaraNeural',
    lang: 'hi-IN',
    rate: '-5%',
    text: `एमएएन इंजीनियरिंग कंसल्टेंसी डिज़ाइन और इंजीनियरिंग परामर्श के क्षेत्र में एक अग्रणी इंजीनियरिंग ब्रांड है, जिसकी स्थापना जेद्दा, सऊदी अरब में हुई है। हम उच्चतम गुणवत्ता मानकों के साथ वास्तुकला और संरचनात्मक डिज़ाइन, परियोजना प्रबंधन और इंजीनियरिंग निरीक्षण सेवाएं प्रदान करते हैं। पेशेवर परामर्श के लिए आज ही हमसे संपर्क करें।`,
  },
  {
    code: 'ur',
    voice: 'ur-PK-UzmaNeural',
    lang: 'ur-PK',
    rate: '-10%',
    text: `ایم اے این انجینئرنگ کنسلٹنسی ڈیزائن اور انجینئرنگ مشاورت کے شعبے میں ایک سرکردہ انجینئرنگ برانڈ ہے، جس کی بنیاد جدہ، سعودی عرب میں رکھی گئی۔ ہم اعلیٰ ترین معیار اور پیشہ ورانہ مہارت کے ساتھ تعمیراتی اور ساختی ڈیزائن، پراجیکٹ مینجمنٹ اور انجینئرنگ نگرانی کی خدمات فراہم کرتے ہیں۔ پیشہ ورانہ مشاورت کے لیے آج ہی ہم سے رابطہ کریں۔`,
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
  console.log('All non-Arabic presentation audio files regenerated.');
}

run().catch(console.error);
