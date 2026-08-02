'use client';
import { useState, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Copy, Eye, EyeOff, Archive, ArchiveRestore,
  Star, GripVertical, FolderOpen, Search, Download, Loader2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { TabLoading } from './Shared';
import ProjectEditorModal from './ProjectEditorModal';
import { useAdminProjects } from '@/hooks/useProjects';
import {
  createProject, updateProject, deleteProject, setProjectFlags,
  reorderProjects, duplicateProject, slugExists,
} from '@/lib/projectsRepo';
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_IDS, getCategoryLabel } from '@/lib/projectCategories';
import { PROJECTS as LEGACY_PROJECTS } from '@/data/projects.js';

export default function ProjectsTab() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [showArchived, setShowArchived] = useState(false);
  const { projects, loading } = useAdminProjects({ includeArchived: showArchived });

  const [editing, setEditing]     = useState(null); // project object or {} for new
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [category, setCategory]   = useState('all');
  const [search, setSearch]       = useState('');
  const dragIndex = useRef(null);

  const visible = projects.filter((p) => {
    if (!showArchived && p.archived) return false;
    if (category !== 'all' && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(p.name_ar?.toLowerCase().includes(q) || p.name_en?.toLowerCase().includes(q) || p.slug?.includes(q))) return false;
    }
    return true;
  });

  const openNew  = () => setEditing({});
  const openEdit = (p) => setEditing(p);
  const closeDlg = () => { setEditing(null); setError(''); };

  const handleSave = async (data) => {
    setSaving(true);
    setError('');
    try {
      if (editing?.slug) {
        await updateProject(editing.slug, { ...data, updatedBy: user?.email || '' });
      } else {
        await createProject({ ...data, createdBy: user?.email || '', updatedBy: user?.email || '' });
      }
      closeDlg();
    } catch (err) {
      setError(err.message === 'slug_taken' ? t('admin.contentTabs.projectsTab.slugTaken') : err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slug) => {
    if (!(await confirm(t('admin.contentTabs.projectsTab.deleteProjectConfirm'), { variant: 'danger' }))) return;
    await deleteProject(slug);
  };

  const duplicate = async (slug) => {
    await duplicateProject(slug);
  };

  const toggle = async (p, field) => {
    await setProjectFlags(p.slug, { [field]: !p[field] });
  };

  const onDragStart = (idx) => { dragIndex.current = idx; };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = async (idx) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === idx) return;
    const reordered = [...visible];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(idx, 0, moved);
    await reorderProjects(reordered.map((p) => p.slug));
  };

  const handleImport = async () => {
    if (!(await confirm(t('admin.contentTabs.projectsTab.importConfirm')))) return;
    setImporting(true);
    setImportMsg('');
    let imported = 0;
    let skipped = 0;
    for (let i = 0; i < LEGACY_PROJECTS.length; i += 1) {
      const p = LEGACY_PROJECTS[i];
      if (await slugExists(p.id)) { skipped += 1; continue; }
      await createProject({
        slug: p.id,
        name_ar: p.title.ar, name_en: p.title.en,
        shortDesc_ar: '', shortDesc_en: '',
        desc_ar: p.description.ar, desc_en: p.description.en,
        category: p.category,
        location_ar: p.location.ar, location_en: p.location.en,
        client: '', consultant: '', contractor: '',
        completionDate: '', year: p.year, constructionStatus: p.status,
        area: '', floors: null, budget: '',
        features_ar: [], features_en: [], services: [], tags: [],
        coverImage: p.coverImage, coverImagePublicId: '',
        gallery: p.gallery.map((url) => ({ url, publicId: '' })),
        videos: [], pdfBrochure: null,
        seoTitle: '', seoDescription: '', keywords: [],
        featured: false, order: i,
        draft: false, archived: false,
        createdBy: user?.email || '', updatedBy: user?.email || '',
      });
      imported += 1;
    }
    setImporting(false);
    setImportMsg(`${t('admin.contentTabs.projectsTab.importedCountLabel')} ${imported} — ${t('admin.contentTabs.projectsTab.skippedCountLabel')} ${skipped}`);
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-white/40">{visible.length} {t('admin.contentTabs.projectsTab.projectsCountLabel')}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {importing ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {t('admin.contentTabs.projectsTab.importBtn')}
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(201,163,77,0.10)', border: '1px solid rgba(201,163,77,0.30)', color: '#c8a96e' }}
          >
            <Plus size={13} /> {t('admin.contentTabs.projectsTab.newProjectBtn')}
          </button>
        </div>
      </div>

      {importMsg && <p className="text-xs text-[#c8a96e] text-center">{importMsg}</p>}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs text-white bg-black/40 border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none"
        >
          <option value="all" className="bg-[#0a0e17]">{getCategoryLabel('all', lang)}</option>
          {PROJECT_CATEGORY_IDS.map((id) => (
            <option key={id} value={id} className="bg-[#0a0e17]">{getCategoryLabel(id, lang)}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.contentTabs.projectsTab.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white bg-black/40 border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-white/40 px-2">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-[#c8a96e]" />
          {t('admin.contentTabs.projectsTab.showArchivedLabel')}
        </label>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
          <FolderOpen size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/20 text-sm">{t('admin.contentTabs.projectsTab.noProjectsYetLabel')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((p, idx) => (
            <div
              key={p.slug}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(idx)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', opacity: p.draft ? 0.6 : 1 }}
            >
              <GripVertical size={14} className="text-white/15 flex-shrink-0 cursor-move" />
              {p.coverImage && <img src={p.coverImage} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.name_ar || p.name_en || '—'}</p>
                <p className="text-xs text-white/30 truncate">
                  {getCategoryLabel(p.category, lang)} · {p.slug} {p.archived && `· ${t('admin.contentTabs.projectsTab.archived')}`}
                </p>
              </div>
              <button
                onClick={() => toggle(p, 'featured')}
                title={t('admin.contentTabs.projectsTab.featuredLabel')}
                className={`p-1.5 rounded-lg transition-all ${p.featured ? 'text-[#c8a96e]' : 'text-white/20 hover:text-white/50'}`}
              >
                <Star size={13} fill={p.featured ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => toggle(p, 'draft')}
                title={p.draft ? t('admin.contentTabs.projectsTab.draft') : t('admin.contentTabs.projectsTab.published')}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                {p.draft ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={() => toggle(p, 'archived')}
                title={p.archived ? t('admin.contentTabs.projectsTab.active') : t('admin.contentTabs.projectsTab.archived')}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                {p.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
              </button>
              <button onClick={() => duplicate(p.slug)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <Copy size={13} />
              </button>
              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <Pencil size={13} />
              </button>
              <button onClick={() => remove(p.slug)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/8 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ProjectEditorModal
          project={editing.slug ? editing : null}
          onClose={closeDlg}
          onSave={handleSave}
          saving={saving}
          errorMsg={error}
        />
      )}
    </div>
  );
}
