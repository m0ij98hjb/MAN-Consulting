'use client';
import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Check, FileText, Film, Search, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { validateFile, uploadAsset } from '@/lib/cloudinary';
import { createMediaAsset, subscribeMedia } from '@/lib/mediaLibraryRepo';

const ACCEPT_CONFIG = {
  image: { mime: 'image/*', ext: ['.jpg', '.jpeg', '.png', '.webp', '.gif'], type: 'image' },
  pdf:   { mime: 'application/pdf', ext: ['.pdf'], type: 'pdf' },
  video: { mime: 'video/*', ext: ['.mp4', '.webm', '.mov'], type: 'video' },
};

// Reusable media selection/upload modal — the single entry point every field
// that needs an image/PDF/video (Projects cover/gallery/brochure, and any
// future CMS field) opens. Backs onto the mediaLibrary Firestore index so
// every upload becomes reusable across the whole site.
export default function MediaPicker({ open, onClose, onSelect, accept = 'image', multiple = false }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState('upload');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const inputRef = useRef(null);
  const cfg = ACCEPT_CONFIG[accept] || ACCEPT_CONFIG.image;

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeMedia(setAssets, { type: cfg.type, search: search || undefined });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cfg.type, search]);

  useEffect(() => {
    if (open) { setTab('upload'); setSelected([]); setError(''); setSearch(''); }
  }, [open]);

  if (!open) return null;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setError('');
    const bad = files.find((f) => validateFile(f, { maxSizeMB: 20, acceptedExt: cfg.ext }));
    if (bad) {
      const code = validateFile(bad, { maxSizeMB: 20, acceptedExt: cfg.ext });
      setError(code === 'too_large' ? t('admin.contentTabs.mediaLibrary.fileTooLarge') : t('admin.contentTabs.mediaLibrary.invalidFileType'));
      return;
    }
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const asset = await uploadAsset(file, { folder: 'general' });
        const id = await createMediaAsset({
          url: asset.url,
          publicId: asset.publicId,
          type: cfg.type,
          folder: 'general',
          width: asset.width,
          height: asset.height,
          size: asset.bytes,
          originalFilename: asset.originalFilename,
          uploadedBy: user?.email || '',
        });
        uploaded.push({ id, url: asset.url, publicId: asset.publicId, type: cfg.type });
        if (!multiple) break;
      }
      if (multiple) {
        onSelect(uploaded);
        onClose();
      } else {
        onSelect(uploaded[0]);
        onClose();
      }
    } catch (err) {
      setError(err.message || t('admin.contentTabs.mediaLibrary.uploadFailed'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const toggleSelect = (asset) => {
    if (!multiple) { onSelect(asset); onClose(); return; }
    setSelected((prev) =>
      prev.some((a) => a.id === asset.id) ? prev.filter((a) => a.id !== asset.id) : [...prev, asset],
    );
  };

  const confirmMultiSelect = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-6 space-y-4 overflow-y-auto max-h-[90vh]"
        style={{ background: '#0a0e17', border: '1px solid rgba(201,163,77,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.9)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{t('admin.contentTabs.mediaLibrary.pickerTitle')}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={15} /></button>
        </div>

        <div className="flex gap-1.5">
          {['upload', 'existing'].map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === id ? 'bg-[#c8a96e]/12 text-[#c8a96e]' : 'text-white/35 hover:text-white/70 hover:bg-white/5'
              }`}
              style={tab === id ? { border: '1px solid rgba(201,163,77,0.30)' } : { border: '1px solid transparent' }}
            >
              {id === 'upload' ? t('admin.contentTabs.mediaLibrary.uploadNew') : t('admin.contentTabs.mediaLibrary.chooseExisting')}
            </button>
          ))}
        </div>

        {tab === 'upload' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => !uploading && inputRef.current?.click()}
            className="rounded-2xl py-16 text-center cursor-pointer transition-colors"
            style={{
              border: `1px dashed ${dragOver ? 'rgba(201,163,77,0.6)' : 'rgba(255,255,255,0.15)'}`,
              background: dragOver ? 'rgba(201,163,77,0.05)' : 'transparent',
            }}
          >
            {uploading ? (
              <Loader2 size={28} className="text-[#c8a96e] mx-auto mb-2 animate-spin" />
            ) : (
              <Upload size={28} className="text-white/15 mx-auto mb-2" />
            )}
            <p className="text-white/40 text-sm">
              {uploading ? t('admin.contentTabs.mediaLibrary.uploading') : t('admin.contentTabs.mediaLibrary.dragDropHint')}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={cfg.mime}
              multiple={multiple}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.contentTabs.mediaLibrary.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none"
              />
            </div>
            {assets.length === 0 ? (
              <p className="text-center text-white/20 text-sm py-10">{t('admin.contentTabs.mediaLibrary.noAssets')}</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                {assets.map((asset) => {
                  const isSelected = selected.some((a) => a.id === asset.id);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => toggleSelect(asset)}
                      className="relative aspect-square rounded-xl overflow-hidden border transition-all"
                      style={{ borderColor: isSelected ? '#c8a96e' : 'rgba(255,255,255,0.1)' }}
                    >
                      {asset.type === 'image' ? (
                        <img src={asset.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-white/5">
                          {asset.type === 'video' ? <Film size={20} className="text-white/30" /> : <FileText size={20} className="text-white/30" />}
                          <span className="text-[9px] text-white/30 px-1 truncate w-full text-center">{asset.originalFilename}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#c8a96e]/20 flex items-center justify-center">
                          <Check size={18} className="text-[#c8a96e]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {multiple && (
              <button
                onClick={confirmMultiSelect}
                disabled={!selected.length}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: 'rgba(201,163,77,0.12)', border: '1px solid rgba(201,163,77,0.35)', color: '#c8a96e' }}
              >
                {t('admin.contentTabs.mediaLibrary.useSelected')} ({selected.length})
              </button>
            )}
          </div>
        )}

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </div>
    </div>
  );
}
