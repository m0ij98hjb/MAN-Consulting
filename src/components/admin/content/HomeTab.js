'use client';
import { useState, useEffect } from 'react';
import { Image as ImgIcon, BarChart2, FileText } from 'lucide-react';
import { loadSiteContent, saveSiteContent } from '@/lib/siteContent';
import { Field, TextArea, Section, SaveBtn, ImageUpload, Grid2, TabLoading } from './Shared';
import { useLanguage } from '@/context/LanguageContext';

const DEF = {
  hero_title_ar: 'نبني المستقبل بجودة استثنائية',
  hero_title_en: 'We Build the Future with Exceptional Quality',
  hero_sub_ar: 'خبرة تمتد منذ عام 1986 في المقاولات والتصميم المعماري',
  hero_sub_en: 'Expertise since 1986 in contracting and architectural design',
  hero_image: '',
  stat_projects: 230,
  stat_satisfaction: 99,
  stat_designs: 104,
  cta_ar: 'ابدأ مشروعك معنا اليوم',
  cta_en: 'Start Your Project with Us Today',
};

export default function HomeTab() {
  const { t } = useLanguage();
  const [form, setForm]     = useState(DEF);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]  = useState(false);
  const [saved, setSaved]    = useState(false);

  useEffect(() => {
    loadSiteContent('home').then(d => {
      if (Object.keys(d).length) setForm(p => ({ ...p, ...d }));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await saveSiteContent('home', form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    finally { setSaving(false); }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-2xl">
      <Section title={t('admin.contentTabs.homeTab.heroSectionTitle')} icon={ImgIcon}>
        <ImageUpload label={t('admin.contentTabs.homeTab.heroImageLabel')} value={form.hero_image} onChange={v => set('hero_image', v)} />
        <Grid2>
          <Field label={t('admin.contentTabs.homeTab.titleArLabel')} value={form.hero_title_ar} onChange={v => set('hero_title_ar', v)} />
          <Field label={t('admin.contentTabs.homeTab.titleEnLabel')} value={form.hero_title_en} onChange={v => set('hero_title_en', v)} />
        </Grid2>
        <Grid2>
          <TextArea label={t('admin.contentTabs.homeTab.subtitleArLabel')} value={form.hero_sub_ar} onChange={v => set('hero_sub_ar', v)} rows={2} />
          <TextArea label={t('admin.contentTabs.homeTab.subtitleEnLabel')} value={form.hero_sub_en} onChange={v => set('hero_sub_en', v)} rows={2} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.homeTab.statsSectionTitle')} icon={BarChart2}>
        <Grid2>
          <Field label={t('admin.contentTabs.homeTab.projectsCountLabel')} value={form.stat_projects} onChange={v => set('stat_projects', Number(v))} type="number" />
          <Field label={t('admin.contentTabs.homeTab.satisfactionRateLabel')} value={form.stat_satisfaction} onChange={v => set('stat_satisfaction', Number(v))} type="number" />
          <Field label={t('admin.contentTabs.homeTab.designsCountLabel')} value={form.stat_designs} onChange={v => set('stat_designs', Number(v))} type="number" />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.homeTab.ctaSectionTitle')} icon={FileText}>
        <Grid2>
          <Field label={t('admin.contentTabs.homeTab.textArLabel')} value={form.cta_ar} onChange={v => set('cta_ar', v)} />
          <Field label={t('admin.contentTabs.homeTab.textEnLabel')} value={form.cta_en} onChange={v => set('cta_en', v)} />
        </Grid2>
      </Section>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
