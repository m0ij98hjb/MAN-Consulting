'use client';
import { useLanguage } from '@/context/LanguageContext';
import { X, Download } from 'lucide-react';

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.webp'];
const OFFICE_EXT = ['.doc', '.docx', '.xls', '.xlsx'];

function extOf(name) {
  const m = String(name || '').toLowerCase().match(/\.[a-z0-9]+$/);
  return m ? m[0] : '';
}

export default function AttachmentPreviewModal({ attachment, onClose }) {
  const { t, isRTL } = useLanguage();
  if (!attachment) return null;
  const ext = extOf(attachment.name);
  const isImage = IMAGE_EXT.includes(ext);
  const isPdf = ext === '.pdf';
  const isOffice = OFFICE_EXT.includes(ext);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-3xl h-[80vh] bg-[#111118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] shrink-0">
          <p className="text-white font-bold text-sm truncate">{attachment.name}</p>
          <div className="flex items-center gap-2 shrink-0">
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8"><Download size={16} /></a>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8"><X size={18} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-black/20 flex items-center justify-center">
          {isImage ? (
            <img src={attachment.url} alt={attachment.name} className="max-w-full max-h-full object-contain" />
          ) : isPdf ? (
            <iframe src={attachment.url} title={attachment.name} className="w-full h-full border-0" />
          ) : isOffice ? (
            <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(attachment.url)}&embedded=true`} title={attachment.name} className="w-full h-full border-0" />
          ) : (
            <p className="text-white/40 text-sm p-8 text-center">{t('purchasing.previewUnavailable')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
