// TEST ONLY: regenerates presentation-ar.mp3 with "MAN" written as "M.A.N."
// so the TTS engine spells it out letter-by-letter instead of reading it as
// the English word "man". This text variant exists only for TTS generation
// — the locale voice.text source keeps the normal "MAN" spelling.
const { EdgeTTS } = require('node-edge-tts');

const text = `مرحبًا بكم في شركة M.A.N. للاستشارات الهندسية.

تُعد شركة M.A.N. للاستشارات الهندسية علامة هندسية متميزة في مجال الاستشارات والتصميم الهندسي، تأسست في مدينة جدة بالمملكة العربية السعودية، وأثبتت خلال فترة وجيزة حضورًا قويًا في السوق الهندسي، من خلال تنفيذ عدة مشاريع تكللت بالنجاح بفضل الله.

يقود هذه الشركة المتميزة رئيس مجلس الإدارة المهندس مروان أحمد ناظر، صاحب الخبرة الهندسية الواسعة، وتحت إشرافه المباشر تعمل الشركة على تحقيق أعلى معايير الجودة في كل مشروع تتولى تنفيذه.

تقدم شركة M.A.N. للاستشارات الهندسية باقة متكاملة من الخدمات الهندسية الاحترافية، تشمل: التصميم المعماري بأفكار مبتكرة وحلول عصرية، وإدارة المشاريع بإشراف متكامل على جميع مراحل التنفيذ، فضلًا عن التصميم الداخلي والديكور والتشطيب بأعلى مستوى من الجودة والأناقة.

شكرًا لزيارتكم، شركة M.A.N. للاستشارات الهندسية، حيث تتحول رؤيتكم إلى واقع هندسي متميز.`;

const tts = new EdgeTTS({
  voice: 'ar-EG-SalmaNeural',
  lang: 'ar-SA',
  rate: '-10%',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
});

async function run() {
  await tts.ttsPromise(text, 'public/asstes/presentation-ar.mp3');
  console.log('presentation-ar.mp3 regenerated with M.A.N. spelling test.');
}

run().catch(console.error);
