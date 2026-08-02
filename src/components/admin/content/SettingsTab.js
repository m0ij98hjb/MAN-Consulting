'use client';
import { useState, useEffect, useRef } from 'react';
import { Settings, Globe, Music, Loader2, X } from 'lucide-react';
import { loadSiteContent, saveSiteContent, uploadToCloudinary } from '@/lib/siteContent';
import { Field, TextArea, Section, SaveBtn, ImageUpload, Grid2, TabLoading } from './Shared';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';

const DEF = {
  companyName:    'MNC Contracting',
  description_ar: 'شركة MNC للمقاولات — رائدة في البناء والتشييد',
  description_en: 'MNC Contracting — a leader in construction',
  logo:           '',
  favicon:        '',
  social_instagram: '',
  social_twitter:   '',
  social_linkedin:  '',
  social_youtube:   '',
  social_whatsapp:  '',
  music_url:        '',
};

export default function SettingsTab() {
  const { t } = useLanguage();
  const { alert } = useConfirm();
  const [form, setForm]         = useState(DEF);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [musicUp, setMusicUp]   = useState(false);
  const musicRef                = useRef(null);

  useEffect(() => {
    loadSiteContent('settings').then(d => {
      if (Object.keys(d).length) setForm(p => ({ ...p, ...d }));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleMusicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMusicUp(true);
    try {
      const url = await uploadToCloudinary(file, 'video');
      set('music_url', url);
    } catch (err) {
      await alert(t('admin.contentTabs.settingsTab.uploadFileFailedPrefix') + err.message, { variant: 'danger' });
    } finally {
      setMusicUp(false);
      if (musicRef.current) musicRef.current.value = '';
    }
  };

  const save = async () => {
    setSaving(true);
    try { await saveSiteContent('settings', form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    finally { setSaving(false); }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-2xl">

      <Section title={t('admin.contentTabs.settingsTab.companyInfoSectionTitle')} icon={Settings}>
        <Field label={t('admin.contentTabs.settingsTab.companyNameLabel')} value={form.companyName} onChange={v => set('companyName', v)} />
        <Grid2>
          <TextArea label={t('admin.contentTabs.settingsTab.descArLabel')} value={form.description_ar} onChange={v => set('description_ar', v)} rows={2} />
          <TextArea label={t('admin.contentTabs.settingsTab.descEnLabel')} value={form.description_en} onChange={v => set('description_en', v)} rows={2} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.settingsTab.brandIdentitySectionTitle')}>
        <Grid2>
          <ImageUpload label={t('admin.contentTabs.settingsTab.logoLabel')} value={form.logo} onChange={v => set('logo', v)} />
          <ImageUpload label={t('admin.contentTabs.settingsTab.faviconLabel')} value={form.favicon} onChange={v => set('favicon', v)} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.settingsTab.socialLinksSectionTitle')} icon={Globe}>
        <Grid2>
          <Field label="Instagram" value={form.social_instagram} onChange={v => set('social_instagram', v)} placeholder="https://instagram.com/..." />
          <Field label="Twitter / X" value={form.social_twitter} onChange={v => set('social_twitter', v)} placeholder="https://twitter.com/..." />
          <Field label="LinkedIn" value={form.social_linkedin} onChange={v => set('social_linkedin', v)} placeholder="https://linkedin.com/..." />
          <Field label="YouTube" value={form.social_youtube} onChange={v => set('social_youtube', v)} placeholder="https://youtube.com/..." />
          <Field label={t('admin.contentTabs.settingsTab.whatsappNumberLabel')} value={form.social_whatsapp} onChange={v => set('social_whatsapp', v)} placeholder="966598242385" />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.settingsTab.backgroundMusicSectionTitle')} icon={Music}>
        <div className="space-y-3">
          {form.music_url && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Music size={13} className="text-[#c8a96e] flex-shrink-0" />
              <p className="text-xs text-white/50 truncate flex-1">{form.music_url.split('/').pop()}</p>
              <button onClick={() => set('music_url', '')} className="text-red-400/50 hover:text-red-400 flex-shrink-0">
                <X size={13} />
              </button>
            </div>
          )}
          <input ref={musicRef} type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />
          <button
            onClick={() => musicRef.current?.click()}
            disabled={musicUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            style={{ background: 'rgba(201,163,77,0.08)', border: '1px solid rgba(201,163,77,0.25)', color: '#c8a96e' }}
          >
            {musicUp ? <Loader2 size={13} className="animate-spin" /> : <Music size={13} />}
            {musicUp ? t('admin.contentTabs.settingsTab.uploadingLabel') : form.music_url ? t('admin.contentTabs.settingsTab.changeMusicBtn') : t('admin.contentTabs.settingsTab.uploadAudioFileBtn')}
          </button>
          <p className="text-[10px] text-white/20">{t('admin.contentTabs.settingsTab.musicHint')}</p>
        </div>
      </Section>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
