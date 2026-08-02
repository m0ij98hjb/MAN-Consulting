const { EdgeTTS } = require('node-edge-tts');

const langs = [
  {
    code: 'de',
    voice: 'de-DE-KatjaNeural',
    lang: 'de-DE',
    rate: '-5%',
    text: `Willkommen bei MNC Bau. MNC ist eine herausragende Ingenieurmarke im Bereich Bau und Entwicklung, gegründet in Dschidda, Saudi-Arabien. Das Unternehmen wird vom CEO Ingenieur Marwan Ahmed Nazer geleitet. MNC bietet Bauprojekte, Architekturdesign, Projektmanagement und Innenarchitektur an. MNC, wo Ihre Vision zur Ingenieurwirklichkeit wird. Vielen Dank.`,
  },
  {
    code: 'es',
    voice: 'es-ES-ElviraNeural',
    lang: 'es-ES',
    rate: '-5%',
    text: `Bienvenidos a MNC Construcción. MNC es una marca de ingeniería distinguida fundada en Yeda, Arabia Saudita. La empresa está dirigida por el Ingeniero Marwan Ahmed Nazer. MNC ofrece proyectos de contratación, diseño arquitectónico, gestión de proyectos y diseño de interiores. MNC, donde su visión se convierte en realidad. Gracias por visitarnos.`,
  },
  {
    code: 'tr',
    voice: 'tr-TR-EmelNeural',
    lang: 'tr-TR',
    rate: '-5%',
    text: `MNC İnşaat'a hoş geldiniz. MNC, Suudi Arabistan Cidde'de kurulmuş seçkin bir mühendislik markasıdır. Şirket CEO Mühendis Marwan Ahmed Nazer tarafından yönetilmektedir. MNC müteahhitlik, mimari tasarım, proje yönetimi ve iç mimarlık hizmetleri sunmaktadır. MNC, vizyonunuzun gerçeğe dönüştüğü yer. Teşekkür ederiz.`,
  },
  {
    code: 'zh',
    voice: 'zh-CN-XiaoxiaoNeural',
    lang: 'zh-CN',
    rate: '-5%',
    text: `欢迎来到MNC建筑公司。MNC是沙特阿拉伯吉达市一个杰出的工程品牌。公司由首席执行官工程师马尔万·艾哈迈德·纳泽尔领导。MNC提供承包项目、建筑设计、项目管理以及室内设计服务。MNC让您的愿景成为卓越现实。感谢您的来访。`,
  },
];

async function generateRemaining() {
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
  console.log('Done!');
}

generateRemaining().catch(console.error);
