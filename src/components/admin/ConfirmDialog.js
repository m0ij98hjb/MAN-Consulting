'use client';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const VARIANTS = {
  danger:  { tint: 'rgba(239,68,68,0.10)',  color: '#ef4444', btn: 'bg-red-500 hover:bg-red-600 text-white' },
  warning: { tint: 'rgba(245,158,11,0.10)', color: '#f59e0b', btn: 'bg-amber-500 hover:bg-amber-600 text-black' },
  default: { tint: 'rgba(201,163,77,0.10)', color: '#c8a96e', btn: 'bg-[#c8a96e] hover:bg-[#dcbb7d] text-black' },
};

export default function ConfirmDialog({
  mode = 'confirm',
  title,
  message,
  variant = 'default',
  icon: CustomIcon,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  const { t, isRTL } = useLanguage();
  const v = VARIANTS[variant] || VARIANTS.default;
  const Icon = CustomIcon || (mode === 'alert' ? Info : AlertTriangle);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={mode === 'alert' ? onConfirm : onCancel}
    >
      <div
        className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: v.tint, color: v.color }}
          >
            <Icon size={20} />
          </div>
          {title && <h3 className="text-white font-bold text-lg">{title}</h3>}
        </div>

        <p className={`text-white/60 text-sm mb-6 leading-relaxed whitespace-pre-line ${isRTL ? 'text-right' : 'text-left'}`}>
          {message}
        </p>

        <div className="flex gap-3">
          {mode !== 'alert' && (
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/25 transition-all"
            >
              {cancelLabel || t('admin.cancel')}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${v.btn}`}
          >
            {confirmLabel || (mode === 'alert' ? t('admin.okBtn') : t('admin.confirmBtn'))}
          </button>
        </div>
      </div>
    </div>
  );
}
