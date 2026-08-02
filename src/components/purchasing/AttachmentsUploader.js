'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { ACCEPTED_ATTACHMENT_ACCEPT, ACCEPTED_ATTACHMENT_EXT, MAX_ATTACHMENT_SIZE_MB } from '@/lib/purchasingConfig';
import { exportAttachmentsZip } from '@/lib/purchasingExport';
import { Upload, Paperclip, X, Loader2, Eye, FolderArchive } from 'lucide-react';

const AttachmentPreviewModal = dynamic(() => import('./AttachmentPreviewModal'), { ssr: false });

/**
 * Uploads files straight to Firebase Storage under `${pathPrefix}/{timestamp}_{filename}`
 * and reports the resulting attachment metadata array via onChange.
 */
export default function AttachmentsUploader({ pathPrefix, attachments, onChange, disabled = false }) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [zipping, setZipping] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (fileList) => {
    setError('');
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const tooBig = files.find(f => f.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024);
    if (tooBig) { setError(t('purchasing.attachmentTooLarge')); return; }

    const invalidType = files.find(f => !ACCEPTED_ATTACHMENT_EXT.some(ext => f.name.toLowerCase().endsWith(ext)));
    if (invalidType) { setError(t('purchasing.attachmentInvalidType')); return; }

    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const path = `${pathPrefix}/${Date.now()}_${file.name}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, file);
        const url = await getDownloadURL(sRef);
        return { name: file.name, url, path, size: file.size, type: file.type, uploadedAt: new Date().toISOString() };
      }));
      onChange([...(attachments || []), ...uploaded]);
    } catch (e) {
      setError(t('purchasing.attachmentUploadFailed'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAttachment = (idx) => {
    onChange(attachments.filter((_, i) => i !== idx));
  };

  const downloadAllZip = async () => {
    setZipping(true);
    try { await exportAttachmentsZip('attachments', attachments); }
    finally { setZipping(false); }
  };

  return (
    <div className="space-y-2.5">
      {!disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#c8a96e]/30 text-[#c8a96e] hover:bg-[#c8a96e]/10 transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? t('purchasing.uploading') : t('purchasing.uploadAttachments')}
        </button>
      )}
      <input ref={inputRef} type="file" multiple accept={ACCEPTED_ATTACHMENT_ACCEPT} className="hidden"
        onChange={e => handleFiles(e.target.files)} />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {attachments?.length > 0 && (
        <>
          <ul className="space-y-1.5">
            {attachments.map((a, i) => (
              <li key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs">
                <Paperclip size={12} className="text-white/40 shrink-0" />
                <button type="button" onClick={() => setPreviewItem(a)} className="flex-1 min-w-0 truncate text-start text-white/70 hover:text-[#c8a96e]">
                  {a.name}
                </button>
                <button type="button" onClick={() => setPreviewItem(a)} className="text-white/30 hover:text-[#c8a96e] shrink-0">
                  <Eye size={13} />
                </button>
                {!disabled && (
                  <button type="button" onClick={() => removeAttachment(i)} className="text-white/30 hover:text-red-400 shrink-0">
                    <X size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {attachments.length > 1 && (
            <button type="button" onClick={downloadAllZip} disabled={zipping}
              className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-[#c8a96e] disabled:opacity-50">
              {zipping ? <Loader2 size={13} className="animate-spin" /> : <FolderArchive size={13} />} {t('purchasing.downloadAllZip')}
            </button>
          )}
        </>
      )}
      <AttachmentPreviewModal attachment={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
