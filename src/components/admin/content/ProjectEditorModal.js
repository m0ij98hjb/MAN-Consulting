'use client';
import { useState } from 'react';
import { X, Loader2, Info, FileText as FileTextIcon, Image as ImageIcon, ListChecks, Search, ToggleLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Field, TextArea, Grid2, Section, ListEditor } from './Shared';
import { SlugField, TagsInput, MultiImageUpload, PdfUpload, StatusToggleGroup, SingleImageUpload } from './ProjectFormFields';
import { PROJECT_CATEGORY_IDS, PROJECT_CATEGORIES } from '@/lib/projectCategories';
import { SERVICES_SLUGS, SERVICES_DATA } from '@/lib/servicesData';

function emptyDraft(existing) {
  if (existing) {
    return {
      ...existing,
      cover: existing.coverImage ? { url: existing.coverImage, publicId: existing.coverImagePublicId || '' } : null,
    };
  }
  return {
    slug: '', name_ar: '', name_en: '',
    shortDesc_ar: '', shortDesc_en: '', desc_ar: '', desc_en: '',
    category: PROJECT_CATEGORY_IDS[0] || '',
    location_ar: '', location_en: '',
    client: '', consultant: '', contractor: '',
    completionDate: '', year: null, constructionStatus: 'ongoing',
    area: '', floors: null, budget: '',
    features_ar: [], features_en: [], services: [], tags: [],
    cover: null,
    gallery: [], videos: [], pdfBrochure: null,
    seoTitle: '', seoDescription: '', keywords: [],
    featured: false, order: 0, draft: true, archived: false,
  };
}

export default function ProjectEditorModal({ project, onClose, onSave, saving, errorMsg }) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState(() => emptyDraft(project));
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isNew = !project;

  const handleSubmit = () => {
    const { cover, ...rest } = form;
    onSave({
      ...rest,
      coverImage: cover?.url || '',
      coverImagePublicId: cover?.publicId || '',
    });
  };

  const toggleService = (slug) => {
    set('services', form.services.includes(slug) ? form.services.filter((s) => s !== slug) : [...form.services, slug]);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]"
        style={{ background: '#0a0e17', border: '1px solid rgba(201,163,77,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.9)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            {isNew ? t('admin.contentTabs.projectsTab.newProjectModalTitle') : t('admin.contentTabs.projectsTab.editProjectModalTitle')}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={15} /></button>
        </div>

        <Section title={t('admin.contentTabs.projectsTab.sectionBasicInfo')} icon={Info}>
          <Grid2>
            <Field label={t('admin.contentTabs.projectsTab.nameArLabel')} value={form.name_ar} onChange={(v) => set('name_ar', v)} />
            <Field label={t('admin.contentTabs.projectsTab.nameEnLabel')} value={form.name_en} onChange={(v) => set('name_en', v)} />
          </Grid2>
          <SlugField
            label={t('admin.contentTabs.projectsTab.slugLabel')}
            value={form.slug}
            onChange={(v) => set('slug', v)}
            sourceText={form.name_en || form.name_ar}
            currentSlug={project?.slug}
          />
          <Grid2>
            <div className="space-y-1.5">
              <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{t('admin.contentTabs.projectsTab.categoryLabel')}</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none"
              >
                {PROJECT_CATEGORY_IDS.map((id) => (
                  <option key={id} value={id} className="bg-[#0a0e17]">
                    {PROJECT_CATEGORIES[id].label[lang] || PROJECT_CATEGORIES[id].label.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{t('admin.contentTabs.projectsTab.constructionStatusLabel')}</label>
              <select
                value={form.constructionStatus}
                onChange={(e) => set('constructionStatus', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none"
              >
                <option value="ongoing" className="bg-[#0a0e17]">{t('admin.contentTabs.projectsTab.statusOngoing')}</option>
                <option value="completed" className="bg-[#0a0e17]">{t('admin.contentTabs.projectsTab.statusCompleted')}</option>
              </select>
            </div>
          </Grid2>
          <Grid2>
            <Field label={t('admin.contentTabs.projectsTab.locationArLabel')} value={form.location_ar} onChange={(v) => set('location_ar', v)} />
            <Field label={t('admin.contentTabs.projectsTab.locationEnLabel')} value={form.location_en} onChange={(v) => set('location_en', v)} />
          </Grid2>
        </Section>

        <Section title={t('admin.contentTabs.projectsTab.sectionDescription')} icon={FileTextIcon}>
          <Grid2>
            <TextArea label={t('admin.contentTabs.projectsTab.shortDescArLabel')} value={form.shortDesc_ar} onChange={(v) => set('shortDesc_ar', v)} rows={2} />
            <TextArea label={t('admin.contentTabs.projectsTab.shortDescEnLabel')} value={form.shortDesc_en} onChange={(v) => set('shortDesc_en', v)} rows={2} />
          </Grid2>
          <Grid2>
            <TextArea label={t('admin.contentTabs.projectsTab.descArLabel')} value={form.desc_ar} onChange={(v) => set('desc_ar', v)} rows={4} />
            <TextArea label={t('admin.contentTabs.projectsTab.descEnLabel')} value={form.desc_en} onChange={(v) => set('desc_en', v)} rows={4} />
          </Grid2>
        </Section>

        <Section title={t('admin.contentTabs.projectsTab.sectionDetails')} icon={ListChecks}>
          <Grid2>
            <Field label={t('admin.contentTabs.projectsTab.clientLabel')} value={form.client} onChange={(v) => set('client', v)} />
            <Field label={t('admin.contentTabs.projectsTab.consultantLabel')} value={form.consultant} onChange={(v) => set('consultant', v)} />
            <Field label={t('admin.contentTabs.projectsTab.contractorLabel')} value={form.contractor} onChange={(v) => set('contractor', v)} />
            <Field label={t('admin.contentTabs.projectsTab.completionDateLabel')} value={form.completionDate} onChange={(v) => set('completionDate', v)} type="date" />
            <Field label={t('admin.contentTabs.projectsTab.areaLabel')} value={form.area} onChange={(v) => set('area', v)} placeholder={t('admin.contentTabs.projectsTab.areaPlaceholder')} />
            <Field label={t('admin.contentTabs.projectsTab.floorsLabel')} value={form.floors ?? ''} onChange={(v) => set('floors', v ? Number(v) : null)} type="number" />
            <Field label={t('admin.contentTabs.projectsTab.budgetLabel')} value={form.budget} onChange={(v) => set('budget', v)} />
            <Field label={t('admin.contentTabs.projectsTab.yearLabel')} value={form.year ?? ''} onChange={(v) => set('year', v ? Number(v) : null)} type="number" />
          </Grid2>
        </Section>

        <Section title={t('admin.contentTabs.projectsTab.sectionMedia')} icon={ImageIcon}>
          <SingleImageUpload label={t('admin.contentTabs.projectsTab.coverImageLabel')} value={form.cover} onChange={(v) => set('cover', v)} />
          <MultiImageUpload label={t('admin.contentTabs.projectsTab.galleryLabel')} value={form.gallery} onChange={(v) => set('gallery', v)} />
          <ListEditor label={t('admin.contentTabs.projectsTab.videosLabel')} items={form.videos} onChange={(v) => set('videos', v)} />
          <PdfUpload label={t('admin.contentTabs.projectsTab.brochureLabel')} value={form.pdfBrochure} onChange={(v) => set('pdfBrochure', v)} />
        </Section>

        <Section title={t('admin.contentTabs.projectsTab.sectionFeaturesServicesTags')} icon={ListChecks}>
          <Grid2>
            <ListEditor label={t('admin.contentTabs.projectsTab.featuresArLabel')} items={form.features_ar} onChange={(v) => set('features_ar', v)} />
            <ListEditor label={t('admin.contentTabs.projectsTab.featuresEnLabel')} items={form.features_en} onChange={(v) => set('features_en', v)} />
          </Grid2>
          <div className="space-y-1.5">
            <label className="block text-[11px] text-white/38 font-semibold uppercase tracking-wider">{t('admin.contentTabs.projectsTab.servicesLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {SERVICES_SLUGS.map((slug) => {
                const active = form.services.includes(slug);
                const title = SERVICES_DATA[slug]?.content?.[lang]?.title || SERVICES_DATA[slug]?.content?.en?.title || slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggleService(slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      active ? 'bg-[#c8a96e]/12 text-[#c8a96e] border border-[#c8a96e]/30' : 'text-white/35 border border-white/10 hover:text-white/60'
                    }`}
                  >
                    {title}
                  </button>
                );
              })}
            </div>
          </div>
          <TagsInput label={t('admin.contentTabs.projectsTab.tagsLabel')} value={form.tags} onChange={(v) => set('tags', v)} />
        </Section>

        <Section title={t('admin.contentTabs.projectsTab.sectionSeo')} icon={Search}>
          <Field label={t('admin.contentTabs.projectsTab.seoTitleLabel')} value={form.seoTitle} onChange={(v) => set('seoTitle', v)} />
          <TextArea label={t('admin.contentTabs.projectsTab.seoDescLabel')} value={form.seoDescription} onChange={(v) => set('seoDescription', v)} rows={2} />
          <TagsInput label={t('admin.contentTabs.projectsTab.keywordsLabel')} value={form.keywords} onChange={(v) => set('keywords', v)} />
        </Section>

        <Section title={t('admin.contentTabs.projectsTab.sectionStatus')} icon={ToggleLeft}>
          <StatusToggleGroup
            draft={form.draft}
            archived={form.archived}
            onChangeDraft={(v) => set('draft', v)}
            onChangeArchived={(v) => set('archived', v)}
          />
          <Grid2>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-[#c8a96e]" />
              {t('admin.contentTabs.projectsTab.featuredLabel')}
            </label>
            <Field label={t('admin.contentTabs.projectsTab.orderLabel')} value={form.order} onChange={(v) => set('order', Number(v) || 0)} type="number" />
          </Grid2>
        </Section>

        {errorMsg && <p className="text-red-400 text-xs text-center">{errorMsg}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name_ar || !form.name_en || !form.slug}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{ background: 'rgba(201,163,77,0.12)', border: '1px solid rgba(201,163,77,0.35)', color: '#c8a96e' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t('admin.contentTabs.projectsTab.confirmBtn')}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white transition-colors">
            {t('admin.contentTabs.projectsTab.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
