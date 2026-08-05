// TEST ONLY: generates presentation-ar-variant7.mp3, where "MAN" is spoken
// in genuine English pronunciation (via an embedded SSML <lang xml:lang="en-US">
// switch) inside the otherwise-Arabic narration, instead of an Arabic
// phonetic approximation. node-edge-tts's public API XML-escapes the whole
// text, so this bypasses that and builds the SSML payload directly using
// the same websocket protocol the library uses internally.
const { WebSocket } = require('ws');
const { createWriteStream } = require('node:fs');
const { randomBytes } = require('node:crypto');
const { TRUSTED_CLIENT_TOKEN, generateSecMsGecToken, CHROMIUM_FULL_VERSION } = require('node-edge-tts/dist/drm');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

// "MAN" spoken with real English pronunciation via an embedded <lang> switch.
const MAN_EN = `<lang xml:lang="en-US">M A N</lang>`;

const parts = [
  `مرحبًا بكم في شركة ${MAN_EN} للاستشارات الهندسية.`,
  `تُعد شركة ${MAN_EN} للاستشارات الهندسية علامة هندسية متميزة في مجال الاستشارات والتصميم الهندسي، تأسست في مدينة جدة بالمملكة العربية السعودية، وأثبتت خلال فترة وجيزة حضورًا قويًا في السوق الهندسي، من خلال تنفيذ عدة مشاريع تكللت بالنجاح بفضل الله.`,
  `يقود هذه الشركة المتميزة رئيس مجلس الإدارة المهندس مروان أحمد ناظر، صاحب الخبرة الهندسية الواسعة، وتحت إشرافه المباشر تعمل الشركة على تحقيق أعلى معايير الجودة في كل مشروع تتولى تنفيذه.`,
  `تقدم شركة ${MAN_EN} للاستشارات الهندسية باقة متكاملة من الخدمات الهندسية الاحترافية، تشمل: التصميم المعماري بأفكار مبتكرة وحلول عصرية، وإدارة المشاريع بإشراف متكامل على جميع مراحل التنفيذ، فضلًا عن التصميم الداخلي والديكور والتشطيب بأعلى مستوى من الجودة والأناقة.`,
  `شكرًا لزيارتكم، شركة ${MAN_EN} للاستشارات الهندسية، حيث تتحول رؤيتكم إلى واقع هندسي متميز.`,
];

// Each part is a mix of plain Arabic text and the raw MAN_EN tag. Escape
// only the Arabic segments, leave the tag itself intact.
function buildSsmlBody(part) {
  return part.split(MAN_EN).map(escapeXml).join(MAN_EN);
}

const bodyText = parts.map(buildSsmlBody).join('\n\n');

const voice = 'ar-EG-SalmaNeural';
const lang = 'ar-SA';
const rate = '-10%';
const outputFormat = 'audio-24khz-48kbitrate-mono-mp3';
const audioPath = 'public/asstes/presentation-ar-variant7.mp3';

async function connectWebSocket() {
  const wsConnect = new WebSocket(
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${generateSecMsGecToken()}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}`,
    {
      host: 'speech.platform.bing.com',
      origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_FULL_VERSION.split('.')[0]}.0.0.0 Safari/537.36 Edg/${CHROMIUM_FULL_VERSION.split('.')[0]}.0.0.0`,
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }
  );
  return new Promise((resolve, reject) => {
    wsConnect.on('open', () => {
      wsConnect.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n
        {
          "context": {
            "synthesis": {
              "audio": {
                "metadataoptions": {
                  "sentenceBoundaryEnabled": "false",
                  "wordBoundaryEnabled": "true"
                },
                "outputFormat": "${outputFormat}"
              }
            }
          }
        }
      `);
      resolve(wsConnect);
    });
    wsConnect.on('error', reject);
  });
}

async function run() {
  const wsConnect = await connectWebSocket();
  await new Promise((resolve, reject) => {
    const audioStream = createWriteStream(audioPath);
    const timeout = setTimeout(() => reject('Timed out'), 15000);
    wsConnect.on('message', (data, isBinary) => {
      if (isBinary) {
        const separator = 'Path:audio\r\n';
        const index = data.indexOf(separator) + separator.length;
        audioStream.write(data.subarray(index));
      } else {
        const message = data.toString();
        if (message.includes('Path:turn.end')) {
          audioStream.end();
          audioStream.on('finish', () => {
            wsConnect.close();
            clearTimeout(timeout);
            resolve();
          });
        }
      }
    });
    const requestId = randomBytes(16).toString('hex');
    wsConnect.send(`X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n
      ` + `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="default" volume="default">
            ${bodyText}
          </prosody>
        </voice>
      </speak>`);
  });
  console.log('presentation-ar-variant7.mp3 generated (English-pronounced M A N).');
}

run().catch((e) => { console.error(e); process.exit(1); });
