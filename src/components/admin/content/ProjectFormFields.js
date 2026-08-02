'use client';
import { useState, useRef } from 'react';
import { RefreshCw, Check, X as XIcon, Plus, FileText, GripVertical, Eye, EyeOff, Archive, ArchiveRestore } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { slugExists } from '@/lib/projectsRepo';
import MediaPicker from '@/components/admin/media/MediaPicker';

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ── Slug field: auto-generate from a source text + async uniqueness check ── */
export function SlugField({ label, value, onChange, sourceText, currentSlug }) {
  const { t } = useLanguage();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null); // 'ok' | 'taken' | null

  const regenerate = () => onChange(slugify(sourceText));

  const checkUnique = async () => {
    if (!value || value === currentSlug) { setStatus(null); return; }
    setChecking(true);
    try {
      const exists = await slugExists(value);
      setStatus(exists ? 'taken' : 'ok');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          value={value ?? ''}
          onChange={(e) => { onChange(slugify(e.target.value)); setStatus(null); }}
          onBlur={checkUnique}
          className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none transition-colors"
          dir="ltr"
        />
        <button
          type="button"
          onClick={regenerate}
          title={t('admin.contentTabs.projectsTab.regenerateSlug')}
          className="p-2.5 rounded-xl text-white/40 hover:text-[#c8a96e] hover:bg-white/5 transition-all flex-shrink-0"
        >
          <RefreshCw size={13} />
        </button>
      </div>
      {checking && <p className="text-[11px] text-white/30">{t('admin.contentTabs.projectsTab.checkingSlug')}</p>}
      {status === 'taken' && <p className="text-[11px] text-red-400">{t('admin.contentTabs.projectsTab.slugTaken')}</p>}
      {status === 'ok' && <p className="text-[11px] text-green-400 flex items-center gap-1"><Check size={11} /> {t('admin.contentTabs.projectsTab.slugAvailable')}</p>}
    </div>
  );
}

/* ── Tags input: chip-style, for tags/keywords ── */
export function TagsInput({ label, value = [], onChange }) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState('');

  const commit = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };

  const remove = (tag) => onChange(value.filter((v) => v !== tag));

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
            style={{ background: 'rgba(201,163,77,0.08)', border: '1px solid rgba(201,163,77,0.25)', color: '#c8a96e' }}>
            {tag}
            <button type="button" onClick={() => remove(tag)} className="hover:text-red-400"><XIcon size={11} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
          placeholder={t('admin.contentTabs.projectsTab.tagsPlaceholder')}
          className="flex-1 px-3 py-2 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none"
        />
        <button type="button" onClick={commit} className="px-3 py-2 rounded-xl text-white/40 hover:text-[#c8a96e] hover:bg-white/5">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Multi-image gallery upload: opens MediaPicker, supports drag-reorder ── */
export function MultiImageUpload({ label, value = [], onChange }) {
  const { t } = useLanguage();
  const [pickerOpen, setPickerOpen] = useState(false);
  const dragIndex = useRef(null);

  const handleSelect = (picked) => {
    const items = Array.isArray(picked) ? picked : [picked];
    onChange([...value, ...items.map((p) => ({ url: p.url, publicId: p.publicId }))]);
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const onDragStart = (idx) => { dragIndex.current = idx; };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (idx) => {
    const from = dragIndex.current;
    if (from === null || from === idx) return;
    const items = [...value];
    const [moved] = items.splice(from, 1);
    items.splice(idx, 0, moved);
    onChange(items);
    dragIndex.current = null;
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {value.map((img, idx) => (
          <div
            key={img.publicId || img.url || idx}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(idx)}
            className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 cursor-move group"
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <GripVertical size={12} className="text-white/0 group-hover:text-white/60 transition-colors absolute top-0.5 left-0.5" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="w-5 h-5 rounded-full bg-red-500/0 group-hover:bg-red-500/80 text-white flex items-center justify-center transition-colors"
              >
                <XIcon size={10} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-16 h-16 rounded-xl flex items-center justify-center border border-dashed border-white/15 text-white/30 hover:text-[#c8a96e] hover:border-[#c8a96e]/40 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>
      <p className="text-[10px] text-white/20">{t('admin.contentTabs.projectsTab.galleryReorderHint')}</p>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelect} accept="image" multiple />
    </div>
  );
}

/* ── PDF upload: opens MediaPicker in pdf mode ── */
export function PdfUpload({ label, value, onChange }) {
  const { t } = useLanguage();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <div className="flex items-center gap-3">
        {value?.url && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
            <FileText size={14} className="text-[#c8a96e]" />
            <span className="text-xs text-white/60 truncate max-w-[140px]">{value.url.split('/').pop()}</span>
            <button type="button" onClick={() => onChange(null)} className="text-red-400/50 hover:text-red-400">
              <XIcon size={12} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'rgba(201,163,77,0.08)', border: '1px solid rgba(201,163,77,0.25)', color: '#c8a96e' }}
        >
          <FileText size={12} /> {value?.url ? t('admin.contentTabs.shared.change') : t('admin.contentTabs.projectsTab.uploadPdf')}
        </button>
      </div>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(picked) => onChange({ url: picked.url, publicId: picked.publicId })}
        accept="pdf"
      />
    </div>
  );
}

/* ── Single image picker (cover image): routes through MediaPicker/Media
   Library. `value` is { url, publicId }; onChange receives the same shape
   (or null on remove) so the caller can store both fields. ── */
export function SingleImageUpload({ label, value, onChange }) {
  const { t } = useLanguage();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{label}</label>}
      <div className="flex items-center gap-3">
        {value?.url && (
          <div className="relative flex-shrink-0">
            <img src={value.url} alt="" className="w-14 h-14 object-cover rounded-xl border border-white/10" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500"
            >
              <XIcon size={10} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
          style={{ background: 'rgba(201,163,77,0.08)', border: '1px solid rgba(201,163,77,0.25)', color: '#c8a96e' }}
        >
          {value?.url ? t('admin.contentTabs.shared.change') : t('admin.contentTabs.shared.uploadImage')}
        </button>
      </div>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(picked) => onChange({ url: picked.url, publicId: picked.publicId })}
        accept="image"
      />
    </div>
  );
}

/* ── Draft/Published + Active/Archived pill toggles ── */
export function StatusToggleGroup({ draft, archived, onChangeDraft, onChangeArchived }) {
  const { t } = useLanguage();
  const pill = (active) => `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
    active ? 'bg-[#c8a96e]/12 text-[#c8a96e] border border-[#c8a96e]/30' : 'text-white/35 border border-white/10 hover:text-white/60'
  }`;
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex gap-1.5">
        <button type="button" onClick={() => onChangeDraft(false)} className={pill(!draft)}>
          <Eye size={12} /> {t('admin.contentTabs.projectsTab.published')}
        </button>
        <button type="button" onClick={() => onChangeDraft(true)} className={pill(draft)}>
          <EyeOff size={12} /> {t('admin.contentTabs.projectsTab.draft')}
        </button>
      </div>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => onChangeArchived(false)} className={pill(!archived)}>
          <ArchiveRestore size={12} /> {t('admin.contentTabs.projectsTab.active')}
        </button>
        <button type="button" onClick={() => onChangeArchived(true)} className={pill(archived)}>
          <Archive size={12} /> {t('admin.contentTabs.projectsTab.archived')}
        </button>
      </div>
    </div>
  );
}
