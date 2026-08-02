'use client';
import { useState, useEffect } from 'react';
import { User, BarChart2, Target, Plus, X } from 'lucide-react';
import { loadSiteContent, saveSiteContent } from '@/lib/siteContent';
import { Field, TextArea, Section, SaveBtn, ImageUpload, Grid2, TabLoading } from './Shared';
import { useLanguage } from '@/context/LanguageContext';

const DEF = {
  about_ar: 'شركة MNC للمقاولات، رائدة في تقديم حلول البناء والتشييد بالمملكة العربية السعودية منذ أكثر من 38 عامًا.',
  about_en: 'MNC Contracting Company, a leader in construction solutions in Saudi Arabia for over 38 years.',
  director_name: 'م. مروان أحمد ناظر',
  director_pos_ar: 'المدير العام',
  director_pos_en: 'General Manager',
  director_image: '',
  stats: [
    { value: '38+', label_ar: 'سنة خبرة',     label_en: 'Years of Experience' },
    { value: '230+', label_ar: 'مشروع منجز',   label_en: 'Completed Projects' },
    { value: '99%', label_ar: 'رضى العملاء',   label_en: 'Client Satisfaction' },
    { value: '300+', label_ar: 'عضو في الفريق', label_en: 'Team Members' },
  ],
  vision_ar: 'أن نكون الشركة الأولى في مجال المقاولات في المنطقة',
  vision_en: 'To be the leading contracting company in the region',
  mission_ar: 'تقديم حلول بناء متكاملة بأعلى معايير الجودة والاحترافية',
  mission_en: 'Providing comprehensive building solutions with the highest quality and professionalism',
  values: [
    { title_ar: 'الجودة',       title_en: 'Quality',       desc_ar: 'لا نتنازل عن الجودة في أي مرحلة', desc_en: 'We never compromise on quality' },
    { title_ar: 'الالتزام',     title_en: 'Commitment',    desc_ar: 'التزام تام بالمواعيد والعقود',     desc_en: 'Full commitment to deadlines and contracts' },
    { title_ar: 'الابتكار',     title_en: 'Innovation',    desc_ar: 'نتبنى أحدث التقنيات والأساليب',    desc_en: 'We adopt the latest technologies and methods' },
  ],
};

export default function AboutTab() {
  const { t } = useLanguage();
  const [form, setForm]       = useState(DEF);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSiteContent('about').then(d => {
      if (Object.keys(d).length) setForm(p => ({ ...p, ...d }));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setStat = (i, k, v) => {
    const s = [...form.stats]; s[i] = { ...s[i], [k]: v }; set('stats', s);
  };
  const setVal = (i, k, v) => {
    const a = [...form.values]; a[i] = { ...a[i], [k]: v }; set('values', a);
  };
  const addVal  = () => set('values', [...form.values, { title_ar: '', title_en: '', desc_ar: '', desc_en: '' }]);
  const remVal  = (i) => set('values', form.values.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try { await saveSiteContent('about', form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    finally { setSaving(false); }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-2xl">

      <Section title={t('admin.contentTabs.aboutTab.aboutSectionTitle')} icon={Target}>
        <Grid2>
          <TextArea label={t('admin.contentTabs.aboutTab.textArLabel')} value={form.about_ar} onChange={v => set('about_ar', v)} rows={3} />
          <TextArea label={t('admin.contentTabs.aboutTab.textEnLabel')} value={form.about_en} onChange={v => set('about_en', v)} rows={3} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.aboutTab.directorSectionTitle')} icon={User}>
        <ImageUpload label={t('admin.contentTabs.aboutTab.directorImageLabel')} value={form.director_image} onChange={v => set('director_image', v)} />
        <Field label={t('admin.contentTabs.aboutTab.nameLabel')} value={form.director_name} onChange={v => set('director_name', v)} />
        <Grid2>
          <Field label={t('admin.contentTabs.aboutTab.positionArLabel')} value={form.director_pos_ar} onChange={v => set('director_pos_ar', v)} />
          <Field label={t('admin.contentTabs.aboutTab.positionEnLabel')} value={form.director_pos_en} onChange={v => set('director_pos_en', v)} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.aboutTab.statsSectionTitle')} icon={BarChart2}>
        {form.stats.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <Field label={i === 0 ? t('admin.contentTabs.aboutTab.valueLabel') : ''} value={s.value} onChange={v => setStat(i, 'value', v)} placeholder="38+" />
            <Field label={i === 0 ? t('admin.contentTabs.aboutTab.labelArLabel') : ''} value={s.label_ar} onChange={v => setStat(i, 'label_ar', v)} />
            <Field label={i === 0 ? t('admin.contentTabs.aboutTab.labelEnLabel') : ''} value={s.label_en} onChange={v => setStat(i, 'label_en', v)} />
          </div>
        ))}
      </Section>

      <Section title={t('admin.contentTabs.aboutTab.visionMissionSectionTitle')}>
        <Grid2>
          <TextArea label={t('admin.contentTabs.aboutTab.visionArLabel')} value={form.vision_ar} onChange={v => set('vision_ar', v)} rows={2} />
          <TextArea label={t('admin.contentTabs.aboutTab.visionEnLabel')} value={form.vision_en} onChange={v => set('vision_en', v)} rows={2} />
          <TextArea label={t('admin.contentTabs.aboutTab.missionArLabel')} value={form.mission_ar} onChange={v => set('mission_ar', v)} rows={2} />
          <TextArea label={t('admin.contentTabs.aboutTab.missionEnLabel')} value={form.mission_en} onChange={v => set('mission_en', v)} rows={2} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.aboutTab.valuesSectionTitle')}>
        <div className="space-y-3">
          {form.values.map((v, i) => (
            <div key={i} className="rounded-xl p-3 space-y-2 relative" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => remVal(i)} className="absolute top-2 end-2 text-red-400/40 hover:text-red-400"><X size={12} /></button>
              <Grid2>
                <Field label={t('admin.contentTabs.aboutTab.titleArLabel')} value={v.title_ar} onChange={val => setVal(i, 'title_ar', val)} />
                <Field label={t('admin.contentTabs.aboutTab.titleEnLabel')} value={v.title_en} onChange={val => setVal(i, 'title_en', val)} />
                <TextArea label={t('admin.contentTabs.aboutTab.descArLabel')} value={v.desc_ar} onChange={val => setVal(i, 'desc_ar', val)} rows={2} />
                <TextArea label={t('admin.contentTabs.aboutTab.descEnLabel')} value={v.desc_en} onChange={val => setVal(i, 'desc_en', val)} rows={2} />
              </Grid2>
            </div>
          ))}
          <button onClick={addVal} className="flex items-center gap-1.5 text-xs text-[#c8a96e]/60 hover:text-[#c8a96e] transition-colors">
            <Plus size={12} /> {t('admin.contentTabs.aboutTab.addValueBtn')}
          </button>
        </div>
      </Section>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
