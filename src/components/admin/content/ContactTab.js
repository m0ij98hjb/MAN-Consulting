'use client';
import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { loadSiteContent, saveSiteContent } from '@/lib/siteContent';
import { Field, Section, SaveBtn, Grid2, TabLoading } from './Shared';
import { useLanguage } from '@/context/LanguageContext';
import { COMPANY } from '@/config/company';

const DEF = {
  phone1: '0598242385',
  phone2: '0505649859',
  email: COMPANY.email,
  address_ar: 'جدة، المملكة العربية السعودية',
  address_en: 'Jeddah, Saudi Arabia',
  hours_ar: '8 صباحاً – 10 مساءً',
  hours_en: '8 AM – 10 PM',
  days_ar: 'السبت – الخميس',
  days_en: 'Saturday – Thursday',
  whatsapp: '966598242385',
};

export default function ContactTab() {
  const { t } = useLanguage();
  const [form, setForm]       = useState(DEF);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSiteContent('contact').then(d => {
      if (Object.keys(d).length) setForm(p => ({ ...p, ...d }));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await saveSiteContent('contact', form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    finally { setSaving(false); }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-2xl">
      <Section title={t('admin.contentTabs.contactTab.phoneNumbersSectionTitle')} icon={Phone}>
        <Grid2>
          <Field label={t('admin.contentTabs.contactTab.phone1Label')} value={form.phone1} onChange={v => set('phone1', v)} placeholder="0598242385" />
          <Field label={t('admin.contentTabs.contactTab.phone2Label')} value={form.phone2} onChange={v => set('phone2', v)} placeholder="0505649859" />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.contactTab.whatsappSectionTitle')} icon={MessageCircle}>
        <Field label={t('admin.contentTabs.contactTab.whatsappLabel')} value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="966598242385" />
      </Section>

      <Section title={t('admin.contentTabs.contactTab.emailSectionTitle')} icon={Mail}>
        <Field label={t('admin.contentTabs.contactTab.emailLabel')} value={form.email} onChange={v => set('email', v)} placeholder="email@domain.com" type="email" />
      </Section>

      <Section title={t('admin.contentTabs.contactTab.addressSectionTitle')} icon={MapPin}>
        <Grid2>
          <Field label={t('admin.contentTabs.contactTab.addressArLabel')} value={form.address_ar} onChange={v => set('address_ar', v)} />
          <Field label={t('admin.contentTabs.contactTab.addressEnLabel')} value={form.address_en} onChange={v => set('address_en', v)} />
        </Grid2>
      </Section>

      <Section title={t('admin.contentTabs.contactTab.hoursSectionTitle')} icon={Clock}>
        <Grid2>
          <Field label={t('admin.contentTabs.contactTab.daysArLabel')} value={form.days_ar} onChange={v => set('days_ar', v)} placeholder="السبت – الخميس" />
          <Field label={t('admin.contentTabs.contactTab.daysEnLabel')} value={form.days_en} onChange={v => set('days_en', v)} placeholder="Saturday – Thursday" />
          <Field label={t('admin.contentTabs.contactTab.hoursArLabel')} value={form.hours_ar} onChange={v => set('hours_ar', v)} placeholder="8 صباحاً – 10 مساءً" />
          <Field label={t('admin.contentTabs.contactTab.hoursEnLabel')} value={form.hours_en} onChange={v => set('hours_en', v)} placeholder="8 AM – 10 PM" />
        </Grid2>
      </Section>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
