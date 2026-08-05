// TEST ONLY: new Arabic phonetic-spelling variant for "MAN" using a
// shorter "إي" instead of "إيه" for the middle letter, generated as a
// separate file (not overwriting presentation-ar.mp3).
const { EdgeTTS } = require('node-edge-tts');

const man = 'إمْ - إي - إنْ';

const text = `مرحبًا بكم في شركة ${man} للاستشارات الهندسية.

تُعد شركة ${man} للاستشارات الهندسية علامة هندسية متميزة في مجال الاستشارات والتصميم الهندسي، تأسست في مدينة جدة بالمملكة العربية السعودية، وأثبتت خلال فترة وجيزة حضورًا قويًا في السوق الهندسي، من خلال تنفيذ عدة مشاريع تكللت بالنجاح بفضل الله.

يقود هذه الشركة المتميزة رئيس مجلس الإدارة المهندس مروان أحمد ناظر، صاحب الخبرة الهندسية الواسعة، وتحت إشرافه المباشر تعمل الشركة على تحقيق أعلى معايير الجودة في كل مشروع تتولى تنفيذه.

تقدم شركة ${man} للاستشارات الهندسية باقة متكاملة من الخدمات الهندسية الاحترافية، تشمل: التصميم المعماري بأفكار مبتكرة وحلول عصرية، وإدارة المشاريع بإشراف متكامل على جميع مراحل التنفيذ، فضلًا عن التصميم الداخلي والديكور والتشطيب بأعلى مستوى من الجودة والأناقة.

شكرًا لزيارتكم، شركة ${man} للاستشارات الهندسية، حيث تتحول رؤيتكم إلى واقع هندسي متميز.`;

const tts = new EdgeTTS({
  voice: 'ar-EG-SalmaNeural',
  lang: 'ar-SA',
  rate: '-10%',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
});

async function run() {
  await tts.ttsPromise(text, 'public/asstes/presentation-ar-variant6.mp3');
  console.log('presentation-ar-variant6.mp3 generated.');
}

run().catch(console.error);
