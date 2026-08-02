'use client';
import { useRef, useState } from 'react';
import { Save, CheckCircle, Loader2, Upload, X, Plus } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/siteContent';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';

/* ── Input field ── */
export function Field({ label, value, onChange, type = 'text', placeholder = '', className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none transition-colors placeholder:text-white/15"
      />
    </div>
  );
}

/* ── Textarea ── */
export function TextArea({ label, value, onChange, rows = 3, placeholder = '', className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <textarea
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none transition-colors placeholder:text-white/15 resize-none"
      />
    </div>
  );
}

/* ── Section card ── */
export function Section({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-5 space-y-4 ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/[0.06]">
        {Icon && <Icon size={14} className="text-[#c8a96e]" />}
        <h3 className="text-[13px] font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/* ── Save button ── */
export function SaveBtn({ saving, saved, onClick, label }) {
  const { t } = useLanguage();
  const defaultLabel = label ?? t('admin.contentTabs.shared.saveChanges');
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60"
      style={{
        background: saved ? 'rgba(34,197,94,0.10)' : 'rgba(201,163,77,0.10)',
        border: `1px solid ${saved ? 'rgba(34,197,94,0.40)' : 'rgba(201,163,77,0.35)'}`,
        color: saved ? '#22c55e' : '#c8a96e',
      }}
    >
      {saving ? <Loader2 size={14} className="animate-spin" />
      : saved  ? <CheckCircle size={14} />
      :          <Save size={14} />}
      {saving ? t('admin.contentTabs.shared.saving') : saved ? t('admin.contentTabs.shared.saved') : defaultLabel}
    </button>
  );
}

/* ── Image upload ── */
export function ImageUpload({ label, value, onChange, className = '' }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useLanguage();
  const { alert } = useConfirm();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (err) {
      await alert(t('admin.contentTabs.shared.uploadFailed') + err.message, { variant: 'danger' });
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <div className="flex items-center gap-3">
        {value && (
          <div className="relative flex-shrink-0">
            <img src={value} alt="" className="w-14 h-14 object-cover rounded-xl border border-white/10" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500"
            >
              <X size={10} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0"
          style={{ background: 'rgba(201,163,77,0.08)', border: '1px solid rgba(201,163,77,0.25)', color: '#c8a96e' }}
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? t('admin.contentTabs.shared.uploading') : value ? t('admin.contentTabs.shared.change') : t('admin.contentTabs.shared.uploadImage')}
        </button>
        {value && <p className="text-[10px] text-white/20 truncate max-w-[120px]">{value.split('/').pop()}</p>}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
      </div>
    </div>
  );
}

/* ── List editor (array of strings) ── */
export function ListEditor({ label, items = [], onChange }) {
  const { t } = useLanguage();
  const add    = () => onChange([...items, '']);
  const update = (i, v) => { const a = [...items]; a[i] = v; onChange(a); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={e => update(i, e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none transition-colors"
            />
            <button type="button" onClick={() => remove(i)} className="text-red-400/50 hover:text-red-400 transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs text-[#c8a96e]/60 hover:text-[#c8a96e] transition-colors mt-1">
        <Plus size={12} /> {t('admin.contentTabs.shared.addItem')}
      </button>
    </div>
  );
}

/* ── Loading placeholder ── */
export function TabLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={22} className="animate-spin text-[#c8a96e]/40" />
    </div>
  );
}

/* ── Grid 2-col ── */
export function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
