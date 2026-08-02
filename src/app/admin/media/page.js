'use client';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Image as ImageIcon, Upload, Search, Trash2, RefreshCw, FileText, Film, Copy, Check } from 'lucide-react';
import { validateFile, uploadAsset } from '@/lib/cloudinary';
import { subscribeMedia, createMediaAsset, updateMediaAsset, deleteMediaAsset, isAssetInUse } from '@/lib/mediaLibraryRepo';

const TYPE_FILTERS = ['all', 'image', 'pdf', 'video'];

export default function MediaLibraryPage() {
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const { isSuperAdmin, user } = useAuth();
  const router = useRouter();

  const [assets, setAssets]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [type, setType]         = useState('all');
  const [search, setSearch]     = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [replacingId, setReplacingId] = useState(null);
  const inputRef = useRef(null);
  const replaceInputRef = useRef(null);

  useEffect(() => {
    if (user !== undefined && !isSuperAdmin) router.replace('/admin/dashboard');
  }, [user, isSuperAdmin, router]);

  useEffect(() => {
    const unsub = subscribeMedia((items) => { setAssets(items); setLoading(false); }, {
      type: type === 'all' ? undefined : type,
      search: search || undefined,
    });
    return unsub;
  }, [type, search]);

  if (!isSuperAdmin) return null;

  const handleUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setError('');
    for (const file of files) {
      const code = validateFile(file, { maxSizeMB: 20 });
      if (code) {
        setError(code === 'too_large' ? t('admin.contentTabs.mediaLibrary.fileTooLarge') : t('admin.contentTabs.mediaLibrary.invalidFileType'));
        return;
      }
    }
    setUploading(true);
    try {
      for (const file of files) {
        const asset = await uploadAsset(file, { folder: 'general' });
        const resolvedType = file.type === 'application/pdf' ? 'pdf' : file.type.startsWith('video/') ? 'video' : 'image';
        await createMediaAsset({
          url: asset.url,
          publicId: asset.publicId,
          type: resolvedType,
          folder: 'general',
          width: asset.width,
          height: asset.height,
          size: asset.bytes,
          originalFilename: asset.originalFilename,
          uploadedBy: user?.email || '',
        });
      }
    } catch (err) {
      setError(err.message || t('admin.contentTabs.mediaLibrary.uploadFailed'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (asset) => {
    const { inUse, refs } = await isAssetInUse(asset.id);
    if (inUse) {
      const list = refs.map((r) => `${r.collection}/${r.docId} (${r.field})`).join(', ');
      if (!(await confirm(`${t('admin.contentTabs.mediaLibrary.assetInUseWarning')} ${list}\n\n${t('admin.contentTabs.mediaLibrary.deleteAnywayConfirm')}`, { variant: 'warning' }))) return;
    } else if (!(await confirm(t('admin.contentTabs.mediaLibrary.deleteConfirm'), { variant: 'danger' }))) {
      return;
    }
    await deleteMediaAsset(asset.id);
  };

  const startReplace = (id) => {
    setReplacingId(id);
    replaceInputRef.current?.click();
  };

  const handleReplace = async (fileList) => {
    const file = fileList?.[0];
    if (!file || !replacingId) return;
    const code = validateFile(file, { maxSizeMB: 20 });
    if (code) {
      setError(code === 'too_large' ? t('admin.contentTabs.mediaLibrary.fileTooLarge') : t('admin.contentTabs.mediaLibrary.invalidFileType'));
      setReplacingId(null);
      return;
    }
    setUploading(true);
    try {
      const asset = await uploadAsset(file, { folder: 'general' });
      await updateMediaAsset(replacingId, {
        url: asset.url,
        publicId: asset.publicId,
        width: asset.width,
        height: asset.height,
        size: asset.bytes,
        originalFilename: asset.originalFilename,
      });
    } catch (err) {
      setError(err.message || t('admin.contentTabs.mediaLibrary.uploadFailed'));
    } finally {
      setUploading(false);
      setReplacingId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const copyUrl = (asset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(''), 1500);
  };

  return (
    <AdminPageLayout>
      <div className="p-5 lg:p-7 max-w-5xl mx-auto" dir="rtl">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#c8a96e]/10 border border-[#c8a96e]/20 flex items-center justify-center">
            <ImageIcon size={16} className="text-[#c8a96e]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{t('admin.contentTabs.mediaLibrary.pageTitle')}</h1>
            <p className="text-xs text-white/30 mt-0.5">{assets.length} {t('admin.contentTabs.mediaLibrary.assetsCountLabel')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setType(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                type === f ? 'bg-[#c8a96e]/12 text-[#c8a96e]' : 'text-white/35 hover:text-white/70 hover:bg-white/5'
              }`}
              style={type === f ? { border: '1px solid rgba(201,163,77,0.30)' } : { border: '1px solid transparent' }}
            >
              {t(`admin.contentTabs.mediaLibrary.filter_${f}`)}
            </button>
          ))}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.contentTabs.mediaLibrary.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white bg-black/40 border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className="rounded-2xl py-10 text-center cursor-pointer transition-colors mb-5"
          style={{
            border: `1px dashed ${dragOver ? 'rgba(201,163,77,0.6)' : 'rgba(255,255,255,0.15)'}`,
            background: dragOver ? 'rgba(201,163,77,0.05)' : 'transparent',
          }}
        >
          <Upload size={22} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-xs">{uploading ? t('admin.contentTabs.mediaLibrary.uploading') : t('admin.contentTabs.mediaLibrary.dragDropHint')}</p>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}

        {/* Grid */}
        {loading ? (
          <p className="text-center text-white/20 text-sm py-10">…</p>
        ) : assets.length === 0 ? (
          <p className="text-center text-white/20 text-sm py-10">{t('admin.contentTabs.mediaLibrary.noAssets')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10">
                {asset.type === 'image' ? (
                  <img src={asset.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-white/5">
                    {asset.type === 'video' ? <Film size={22} className="text-white/30" /> : <FileText size={22} className="text-white/30" />}
                    <span className="text-[9px] text-white/30 px-1 truncate w-full text-center">{asset.originalFilename}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  <button onClick={() => copyUrl(asset)} title={t('admin.contentTabs.mediaLibrary.copyUrl')} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                    {copiedId === asset.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <button onClick={() => startReplace(asset.id)} title={t('admin.contentTabs.mediaLibrary.replace')} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                    <RefreshCw size={13} />
                  </button>
                  <button onClick={() => handleDelete(asset)} title={t('admin.contentTabs.mediaLibrary.delete')} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <input ref={replaceInputRef} type="file" className="hidden" onChange={(e) => handleReplace(e.target.files)} />
      </div>
    </AdminPageLayout>
  );
}
