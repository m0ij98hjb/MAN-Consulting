'use client'
import { useEffect, useRef, useState } from 'react'

const FULL_SCRIPT = `مرحباً بكم في مؤسسة مروان أحمد ناظر للمقاولات العامة. أنا نورا، مساعدتكم الصوتية، ويسعدني أن أرحب بكم في موقع شركة MNC Construction. شركتنا من المؤسسات الرائدة في مجال الإنشاءات والتصميم المعماري بالمملكة العربية السعودية. يشرفنا تقديم المهندس مروان أحمد ناظر، المدير التنفيذي والمؤسس للشركة. يمتلك المهندس مروان خبرة تمتد لأكثر من خمس عشرة سنة في مجال الهندسة المعمارية والإنشاءات، وتحت قيادته أنجزت الشركة أكثر من مئتي مشروع ناجح في مختلف أنحاء المملكة. تقدم شركة MNC Construction خدمات هندسية متكاملة تشمل: تنفيذ المباني السكنية والتجارية بأعلى معايير الجودة، والتصميم المعماري الذي يجمع بين الجمالية والوظيفة العملية، وإدارة المشاريع بإشراف هندسي متكامل على كل مرحلة، فضلاً عن التصميم الداخلي بلمسات إبداعية تضفي الفخامة والراحة. تتميز شركتنا بدقة التنفيذ والالتزام بأعلى المعايير الهندسية، وتقديم حلول مبتكرة باستخدام أحدث التقنيات المعمارية، مع إدارة احترافية تضمن تسليم مشروعك في موعده المحدد دون أي تأخير. نحن لا نبني جدراناً، بل نُصمم مستقبلاً متميزاً. نلتزم بتحويل رؤيتكم ومخططاتكم إلى بصمات معمارية تنبض بالحياة والجودة. يسعدنا التواصل معكم والإجابة على جميع استفساراتكم. شكراً لزيارتكم موقع MNC Construction.`

export default function VoiceAssistant() {
  const [speaking, setSpeaking] = useState(false)
  const [done, setDone] = useState(false)
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { return () => { window.speechSynthesis?.cancel() } }, [])

  function getVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find(v => v.lang === 'ar-SA' && v.name.toLowerCase().includes('layla')) ||
      voices.find(v => v.lang === 'ar-SA' && !v.name.includes('Maged')) ||
      voices.find(v => v.lang === 'ar-SA') ||
      voices.find(v => v.lang.startsWith('ar')) ||
      null
    )
  }

  function startSpeech() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(FULL_SCRIPT)
    u.lang = 'ar-SA'; u.rate = 0.85; u.pitch = 1.2; u.volume = 1

    const trySpeak = () => {
      const voice = getVoice()
      if (voice) u.voice = voice
      u.onstart = () => { setSpeaking(true); setDone(false); setProgress(5) }
      u.onboundary = (e) => { setProgress(Math.round(Math.min(95, 5 + (e.charIndex / FULL_SCRIPT.length) * 90))) }
      u.onend = () => { setSpeaking(false); setDone(true); setProgress(100) }
      u.onerror = () => { setSpeaking(false); setProgress(0) }
      window.speechSynthesis.speak(u)
    }

    window.speechSynthesis.getVoices().length === 0
      ? (window.speechSynthesis.onvoiceschanged = trySpeak)
      : trySpeak()
  }

  function stopSpeech() {
    window.speechSynthesis.cancel()
    setSpeaking(false); setProgress(0)
  }

  function togglePanel() {
    if (show) { stopSpeech(); setShow(false) }
    else { setShow(true); setDone(false); setProgress(0) }
  }

  const btn = (extra = {}) => ({
    flex: 1, padding: '11px', borderRadius: '12px', border: 'none',
    fontFamily: "'Cairo',sans-serif", fontSize: '13px', fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px', ...extra,
  } as React.CSSProperties)

  return (
    <>
      <button onClick={togglePanel} aria-label="المساعدة الصوتية"
        style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg,#D4AF65,#8A6C27)',
          boxShadow: '0 4px 20px rgba(184,146,58,0.5)',
          cursor: 'pointer', fontSize: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
        {show ? '✕' : '🎙️'}
      </button>

      {show && (
        <div style={{
          position: 'fixed', bottom: '92px', left: '24px', zIndex: 9998,
          width: '300px', borderRadius: '20px', overflow: 'hidden',
          background: 'linear-gradient(160deg,#0f0e0a,#1c1408)',
          border: '1px solid rgba(184,146,58,0.35)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          fontFamily: "'Cairo',sans-serif", direction: 'rtl',
        }}>

          <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(184,146,58,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#D4AF65,#8A6C27)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', position: 'relative',
                boxShadow: speaking ? '0 0 0 3px rgba(184,146,58,0.35)' : 'none',
                transition: 'box-shadow .3s',
              }}>
                🎙️
                {speaking && (
                  <span style={{
                    position: 'absolute', inset: '-5px', borderRadius: '50%',
                    border: '2px solid #B8923A',
                    animation: 'va-ring 1.2s ease-out infinite',
                  }} />
                )}
              </div>
              <div>
                <p style={{ color: '#D4AF65', fontWeight: 700, fontSize: '14px', margin: 0 }}>نورا</p>
                <p style={{ color: '#777', fontSize: '11px', margin: '2px 0 0' }}>المساعدة الصوتية · MNC</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#B8923A', flexShrink: 0,
                animation: speaking ? 'va-pulse 1s infinite' : 'none',
              }} />
              <span style={{ color: '#B8923A', fontSize: '11px' }}>
                {speaking ? 'تتحدث الآن...' : done ? 'انتهت المقدمة' : 'جاهزة للتحدث'}
              </span>
            </div>

            <div style={{ marginTop: '8px', height: '3px', borderRadius: '2px', overflow: 'hidden', background: 'rgba(255,255,255,0.07)' }}>
              <div style={{
                height: '100%', borderRadius: '2px', transition: 'width .4s',
                width: `${progress}%`,
                background: 'linear-gradient(90deg,#D4AF65,#B8923A)',
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '12px 0', height: '52px' }}>
            {[0, .1, .2, .35, .5, .35, .2, .1, 0].map((d, i) => (
              <div key={i} style={{
                width: '4px', borderRadius: '3px', background: '#B8923A',
                opacity: speaking ? 1 : 0.18,
                height: speaking ? undefined : '5px',
                animation: speaking ? `va-wave .9s ${d}s ease-in-out infinite` : 'none',
              }} />
            ))}
          </div>

          <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
            {!speaking ? (
              <button onClick={startSpeech} style={btn({
                background: 'linear-gradient(135deg,#D4AF65,#8A6C27)', color: '#000',
              })}>
                {done ? '🔄 أعد التشغيل' : '▶ ابدأ الاستماع'}
              </button>
            ) : (
              <button onClick={stopSpeech} style={btn({
                background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.35)',
              })}>
                ⏹ إيقاف
              </button>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#444', padding: '0 16px 14px', lineHeight: 1.5 }}>
            يعمل بشكل أفضل على Chrome وEdge
          </p>
        </div>
      )}

      <style>{`
        @keyframes va-ring  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.4);opacity:0} }
        @keyframes va-wave  { 0%,100%{height:4px} 50%{height:30px} }
        @keyframes va-pulse { 0%,100%{opacity:1}  50%{opacity:.25} }
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
      `}</style>
    </>
  )
}
