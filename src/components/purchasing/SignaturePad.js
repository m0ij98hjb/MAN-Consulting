'use client';
import { useRef, useState } from 'react';
import { Eraser, PenLine, Type } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Lightweight e-signature capture — no external dependency.
 * Two modes: hand-drawn (canvas) or typed full name.
 * Calls onChange({ type: 'drawn', value: dataUrl } | { type: 'typed', value: text } | null).
 */
export default function SignaturePad({ onChange, defaultName = '' }) {
  const { t, isRTL } = useLanguage();
  const [mode, setMode] = useState('drawn');
  const [typedName, setTypedName] = useState(defaultName);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (point.clientX - rect.left) * scaleX, y: (point.clientY - rect.top) * scaleY };
  };

  const start = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPosRef.current = getPos(e);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.strokeStyle = '#e8d9b5';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
    hasDrawnRef.current = true;
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (hasDrawnRef.current) {
      onChange({ type: 'drawn', value: canvasRef.current.toDataURL('image/png') });
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    onChange(null);
  };

  const handleTypedChange = (val) => {
    setTypedName(val);
    onChange(val.trim() ? { type: 'typed', value: val.trim() } : null);
  };

  const switchMode = (next) => {
    setMode(next);
    onChange(null);
    hasDrawnRef.current = false;
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => switchMode('drawn')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${mode === 'drawn' ? 'bg-[#c8a96e] text-black border-[#c8a96e]' : 'text-white/50 border-white/10 hover:text-white'}`}>
          <PenLine size={13} /> {t('purchasing.signatureDraw')}
        </button>
        <button type="button" onClick={() => switchMode('typed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${mode === 'typed' ? 'bg-[#c8a96e] text-black border-[#c8a96e]' : 'text-white/50 border-white/10 hover:text-white'}`}>
          <Type size={13} /> {t('purchasing.signatureType')}
        </button>
      </div>

      {mode === 'drawn' ? (
        <div className="space-y-2">
          <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden" style={{ touchAction: 'none' }}>
            <canvas
              ref={canvasRef}
              width={480} height={160}
              className="w-full h-[140px] cursor-crosshair"
              onMouseDown={start} onMouseMove={draw} onMouseUp={end} onMouseLeave={end}
              onTouchStart={start} onTouchMove={draw} onTouchEnd={end}
            />
          </div>
          <button type="button" onClick={clear} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors">
            <Eraser size={12} /> {t('purchasing.signatureClear')}
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <input
            type="text" dir={isRTL ? 'rtl' : 'ltr'}
            value={typedName}
            onChange={e => handleTypedChange(e.target.value)}
            placeholder={t('purchasing.signatureTypedPlaceholder')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:border-[#c8a96e]/50 outline-none transition-all"
            style={{ fontFamily: 'cursive', fontSize: '20px' }}
          />
          <p className="text-[11px] text-white/30">{t('purchasing.signatureConfirmText')}</p>
        </div>
      )}
    </div>
  );
}
