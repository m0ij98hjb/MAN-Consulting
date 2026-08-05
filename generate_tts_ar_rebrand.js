// Regenerates presentation-ar.mp3 with the updated "MAN Engineering
// Consultancy" brand text, using the exact same voice/lang/rate that
// generate_tts_all.js originally used for Arabic.
const { EdgeTTS } = require('node-edge-tts');

const text = `مكتب MAN للاستشارات الهندسية علامة هندسية رائدة في مجال التصميم والاستشارات الهندسية، تأسس في جدة بالمملكة العربية السعودية. نقدم خدمات التصميم المعماري والإنشائي وإدارة المشاريع والإشراف الهندسي بأعلى معايير الجودة والاحترافية. تواصلوا معنا اليوم للحصول على استشارة احترافية.`;

const tts = new EdgeTTS({
  voice: 'ar-EG-SalmaNeural',
  lang: 'ar-SA',
  rate: '-10%',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
});

async function run() {
  await tts.ttsPromise(text, 'public/asstes/presentation-ar.mp3');
  console.log('presentation-ar.mp3 regenerated.');
}

run().catch(console.error);
