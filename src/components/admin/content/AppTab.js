'use client';
import { useState, useEffect } from 'react';
import { Smartphone, Star, Link2 } from 'lucide-react';
import { loadSiteContent, saveSiteContent } from '@/lib/siteContent';
import { Field, TextArea, Section, SaveBtn, ImageUpload, Grid2, TabLoading } from './Shared';
import { useLanguage } from '@/context/LanguageContext';

const DEF = {
  hero_title_ar: 'حمّل تطبيق MNC',
  hero_title_en: 'Download MNC App',
  hero_desc_ar: 'تابع مشاريعك، تواصل مع فريقنا الهندسي، واستعرض وثائقك في أي وقت ومن أي مكان.',
  hero_desc_en: 'Track your projects, communicate with our engineering team, and access documents anytime, anywhere.',
  phone_image1: '',
  phone_image2: '',
  appstore_url: '',
  googleplay_url: '',
  stat1_value: '١٢+',   stat1_label_ar: 'مشروع نشط',    stat1_label_en: 'Active Projects',
  stat2_value: '٥٠٠+',  stat2_label_ar: 'عميل راضٍ',    stat2_label_en: 'Happy Clients',
  stat3_value: '١٥+',   stat3_label_ar: 'سنة خبرة',     stat3_label_en: 'Years of Experience',
  feat1_title_ar: 'متابعة المشاريع', feat1_title_en: 'Project Tracking',
  feat1_desc_ar: 'تتبّع نسب الإنجاز لحظةً بلحظة مع تقارير مرئية دقيقة.',
  feat1_desc_en: 'Monitor your project progress in real-time with precise visual reports.',
  feat2_title_ar: 'التواصل المباشر', feat2_title_en: 'Direct Communication',
  feat2_desc_ar: 'تحدّث مع فريق MNC الهندسي مباشرةً في أي وقت.',
  feat2_desc_en: 'Talk directly with the MNC engineering team anytime.',
  feat3_title_ar: 'عرض المستندات',  feat3_title_en: 'Document Viewer',
  feat3_desc_ar: 'استعرض العقود والمخططات والتقارير من هاتفك فوراً.',
  feat3_desc_en: 'Access contracts, blueprints, and reports from your phone.',
  feat4_title_ar: 'إشعارات فورية',  feat4_title_en: 'Instant Notifications',
  feat4_desc_ar: 'احصل على تنبيهات آنية لكل تحديث في مشروعك.',
  feat4_desc_en: 'Get real-time alerts for every project update.',
};

export default function AppTab() {
  const { t } = useLanguage();
  const [form, setForm]       = useState(DEF);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSiteContent('app').then(d => {
      if (Object.keys(d).length) setForm(p => ({ ...p, ...d }));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await saveSiteContent('app', form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    finally { setSaving(false); }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-2xl">

      <Section title={t('admin.contentTabs.appTab.heroSectionTitle')} icon={Smartphone}>
        <Grid2>
          <Field label={t('admin.contentTabs.appTab.titleArLabel')} value={form.hero_title_ar} onChange={v => set('hero_title_ar', v)} />
          <Field label={t('admin.contentTabs.appTab.titleEnLabel')} value={form.hero_title_en} onChange={v => set('hero_title_en', v)} />
        </Grid2>
        <Grid2>
          <TextArea label={t('admin.contentTabs.appTab.descArLabel')} value={form.hero_desc_ar} onChange={v => set('hero_desc_ar', v)} rows={2} />
          <TextArea label={t('admin.contentTabs.appTab.descEnLabel')} value={form.hero_desc_en} onChange={v => set('hero_desc_en', v)} rows={2} />
        </Grid2>
        <Grid2>
          <ImageUpload label={t('admin.contentTabs.appTab.phoneImage1Label')} value={form.phone_image1} onChange={v => set('phone_image1', v)} />
          <ImageUpload label={t('admin.contentTabs.appTab.phoneImage2Label')} value={form.phone_image2} onChange={v => set('phone_image2', v)} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.appTab.storeLinksSectionTitle')} icon={Link2}>
        <Field label={t('admin.contentTabs.appTab.appStoreLinkLabel')} value={form.appstore_url} onChange={v => set('appstore_url', v)} placeholder="https://apps.apple.com/..." />
        <Field label={t('admin.contentTabs.appTab.googlePlayLinkLabel')} value={form.googleplay_url} onChange={v => set('googleplay_url', v)} placeholder="https://play.google.com/..." />
      </Section>

      <Section title={t('admin.contentTabs.appTab.statsSectionTitle')} icon={Star}>
        {[1, 2, 3].map(n => (
          <div key={n} className="grid grid-cols-3 gap-2">
            <Field label={n === 1 ? t('admin.contentTabs.appTab.valueLabel') : ''} value={form[`stat${n}_value`]} onChange={v => set(`stat${n}_value`, v)} placeholder="١٢+" />
            <Field label={n === 1 ? t('admin.contentTabs.appTab.labelArLabel') : ''} value={form[`stat${n}_label_ar`]} onChange={v => set(`stat${n}_label_ar`, v)} />
            <Field label={n === 1 ? t('admin.contentTabs.appTab.labelEnLabel') : ''} value={form[`stat${n}_label_en`]} onChange={v => set(`stat${n}_label_en`, v)} />
          </div>
        ))}
      </Section>

      <Section title={t('admin.contentTabs.appTab.featuresSectionTitle')}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">{t('admin.contentTabs.appTab.featureLabel')} {n}</p>
            <Grid2>
              <Field label={t('admin.contentTabs.appTab.titleArLabel')} value={form[`feat${n}_title_ar`]} onChange={v => set(`feat${n}_title_ar`, v)} />
              <Field label={t('admin.contentTabs.appTab.titleEnLabel')} value={form[`feat${n}_title_en`]} onChange={v => set(`feat${n}_title_en`, v)} />
              <TextArea label={t('admin.contentTabs.appTab.descArLabel')} value={form[`feat${n}_desc_ar`]} onChange={v => set(`feat${n}_desc_ar`, v)} rows={2} />
              <TextArea label={t('admin.contentTabs.appTab.descEnLabel')} value={form[`feat${n}_desc_en`]} onChange={v => set(`feat${n}_desc_en`, v)} rows={2} />
            </Grid2>
          </div>
        ))}
      </Section>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
