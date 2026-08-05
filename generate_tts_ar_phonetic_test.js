// TEST ONLY: generates two Arabic phonetic-spelling variants of "MAN" as
// separate files (not overwriting presentation-ar.mp3) so both can be
// compared before picking one.
const { EdgeTTS } = require('node-edge-tts');

const base = (man) => `مرحبًا بكم في شركة ${man} للاستشارات الهندسية.

تُعد شركة ${man} للاستشارات الهندسية علامة هندسية متميزة في مجال الاستشارات والتصميم الهندسي، تأسست في مدينة جدة بالمملكة العربية السعودية، وأثبتت خلال فترة وجيزة حضورًا قويًا في السوق الهندسي، من خلال تنفيذ عدة مشاريع تكللت بالنجاح بفضل الله.

يقود هذه الشركة المتميزة رئيس مجلس الإدارة المهندس مروان أحمد ناظر، صاحب الخبرة الهندسية الواسعة، وتحت إشرافه المباشر تعمل الشركة على تحقيق أعلى معايير الجودة في كل مشروع تتولى تنفيذه.

تقدم شركة ${man} للاستشارات الهندسية باقة متكاملة من الخدمات الهندسية الاحترافية، تشمل: التصميم المعماري بأفكار مبتكرة وحلول عصرية، وإدارة المشاريع بإشراف متكامل على جميع مراحل التنفيذ، فضلًا عن التصميم الداخلي والديكور والتشطيب بأعلى مستوى من الجودة والأناقة.

شكرًا لزيارتكم، شركة ${man} للاستشارات الهندسية، حيث تتحول رؤيتكم إلى واقع هندسي متميز.`;

const variants = [
  { file: 'public/asstes/presentation-ar-variant1.mp3', man: 'إم إيه إن' },
  { file: 'public/asstes/presentation-ar-variant2.mp3', man: 'إم . إيه . إن' },
];

async function run() {
  for (const v of variants) {
    const tts = new EdgeTTS({
      voice: 'ar-EG-SalmaNeural',
      lang: 'ar-SA',
      rate: '-10%',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });
    console.log(`Generating ${v.file} ...`);
    await tts.ttsPromise(base(v.man), v.file);
    console.log('  done');
  }
  console.log('Both phonetic test variants generated.');
}

run().catch(console.error);
