const { EdgeTTS } = require('node-edge-tts');

const hiText = `एमएनसी कंस्ट्रक्शन कंपनी में आपका स्वागत है।

एमएनसी निर्माण और विकास के क्षेत्र में एक उत्कृष्ट इंजीनियरिंग ब्रांड है, जिसकी स्थापना सऊदी अरब के जेद्दा शहर में हुई है। बहुत ही कम समय में कंपनी ने कई सफल परियोजनाओं को पूरा करके इंजीनियरिंग बाजार में एक मजबूत पहचान बनाई है।

कंपनी का नेतृत्व विशाल इंजीनियरिंग अनुभव वाले सीईओ इंजीनियर मारवान अहमद नाज़र कर रहे हैं। उनके सीधे मार्गदर्शन में कंपनी हर परियोजना में गुणवत्ता के उच्चतम मानकों को प्राप्त करने का प्रयास करती है।

एमएनसी पेशेवर इंजीनियरिंग सेवाओं का एक संपूर्ण पैकेज प्रदान करती है, जिसमें ठेकेदारी परियोजनाएं, नवीन विचारों के साथ वास्तुकला डिज़ाइन, एकीकृत परियोजना प्रबंधन और उच्चतम गुणवत्ता वाला इंटीरियर डिज़ाइन शामिल है।

एमएनसी — जहाँ आपकी सोच एक उत्कृष्ट इंजीनियरिंग वास्तविकता बनती है। हमसे जुड़ने के लिए धन्यवाद।`;

async function generateHindiTTS() {
  console.log('Generating Hindi audio presentation...');
  const tts = new EdgeTTS({
    voice: 'hi-IN-SwaraNeural',
    lang: 'hi-IN',
    rate: '-5%',
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  });
  const outPath = 'public/asstes/presentation-hi.mp3';
  await tts.ttsPromise(hiText, outPath);
  console.log('Hindi audio generated successfully at:', outPath);
}

generateHindiTTS().catch(console.error);
