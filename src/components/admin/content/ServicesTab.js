'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { loadSiteContent, saveSiteContent } from '@/lib/siteContent';
import { Field, TextArea, Section, SaveBtn, ImageUpload, ListEditor, Grid2, TabLoading } from './Shared';
import { useLanguage } from '@/context/LanguageContext';

const DEFAULT_SERVICES = [
  {
    slug: 'contracting',
    name_ar: 'أعمال المقاولات',
    name_en: 'Contracting Works',
    desc_ar: 'نقدم حلول مقاولات شاملة من الإنشاء حتى التسليم',
    desc_en: 'We offer complete contracting solutions from construction to handover',
    heroImage: '',
    offerings_ar: ['تنفيذ المباني السكنية والتجارية', 'البنية التحتية والطرق', 'أعمال الصيانة الشاملة'],
    offerings_en: ['Residential & commercial buildings', 'Infrastructure & roads', 'Comprehensive maintenance'],
    advantages_ar: ['جودة عالية', 'التزام بالمواعيد', 'أسعار تنافسية', 'فريق محترف'],
    advantages_en: ['High quality', 'On-time delivery', 'Competitive prices', 'Professional team'],
  },
  {
    slug: 'architectural-design',
    name_ar: 'التصميم المعماري',
    name_en: 'Architectural Design',
    desc_ar: 'تصاميم معمارية إبداعية تجمع بين الجمال والوظيفة',
    desc_en: 'Creative architectural designs that blend beauty and functionality',
    heroImage: '',
    offerings_ar: ['التصميم المعماري الداخلي والخارجي', 'النمذجة ثلاثية الأبعاد', 'الرسومات الهندسية'],
    offerings_en: ['Interior & exterior design', '3D modeling', 'Engineering drawings'],
    advantages_ar: ['إبداع فريد', 'معايير دولية', 'مرونة في التنفيذ', 'خبرة واسعة'],
    advantages_en: ['Unique creativity', 'International standards', 'Flexible execution', 'Broad expertise'],
  },
  {
    slug: 'project-management',
    name_ar: 'إدارة المشاريع',
    name_en: 'Project Management',
    desc_ar: 'إدارة احترافية تضمن تنفيذ مشروعك في الوقت والتكلفة المحددة',
    desc_en: 'Professional management ensuring on-time, on-budget project delivery',
    heroImage: '',
    offerings_ar: ['التخطيط والجدولة', 'متابعة التنفيذ', 'إدارة الموردين', 'التقارير الدورية'],
    offerings_en: ['Planning & scheduling', 'Execution monitoring', 'Supplier management', 'Periodic reports'],
    advantages_ar: ['شفافية كاملة', 'تقارير مستمرة', 'توفير في التكاليف', 'ضمان الجودة'],
    advantages_en: ['Full transparency', 'Continuous reporting', 'Cost savings', 'Quality assurance'],
  },
  {
    slug: 'interior-design',
    name_ar: 'التصميم الداخلي',
    name_en: 'Interior Design',
    desc_ar: 'فضاءات داخلية راقية تعكس ذوقك وتلائم احتياجاتك',
    desc_en: 'Elegant interior spaces that reflect your taste and fit your needs',
    heroImage: '',
    offerings_ar: ['تصميم الفلل والشقق', 'المساحات التجارية', 'اختيار الأثاث والديكور'],
    offerings_en: ['Villa & apartment design', 'Commercial spaces', 'Furniture & decor selection'],
    advantages_ar: ['أسلوب فريد', 'تشطيبات فاخرة', 'متابعة حتى التسليم', 'ضمان الرضا'],
    advantages_en: ['Unique style', 'Luxury finishes', 'Monitored till handover', 'Satisfaction guarantee'],
  },
];

function ServiceCard({ svc, onChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const set = (k, v) => onChange({ ...svc, [k]: v });
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        <div className="flex items-center gap-3">
          <Wrench size={13} className="text-[#c8a96e]" />
          <span className="text-sm font-bold text-white">{svc.name_ar}</span>
          <span className="text-xs text-white/25">{svc.name_en}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.015)' }}>
          <div className="pt-4">
            <ImageUpload label={t('admin.contentTabs.servicesTab.heroImageLabel')} value={svc.heroImage} onChange={v => set('heroImage', v)} />
          </div>
          <Grid2>
            <Field label={t('admin.contentTabs.servicesTab.nameArLabel')} value={svc.name_ar} onChange={v => set('name_ar', v)} />
            <Field label={t('admin.contentTabs.servicesTab.nameEnLabel')} value={svc.name_en} onChange={v => set('name_en', v)} />
          </Grid2>
          <Grid2>
            <TextArea label={t('admin.contentTabs.servicesTab.descArLabel')} value={svc.desc_ar} onChange={v => set('desc_ar', v)} rows={2} />
            <TextArea label={t('admin.contentTabs.servicesTab.descEnLabel')} value={svc.desc_en} onChange={v => set('desc_en', v)} rows={2} />
          </Grid2>
          <Grid2>
            <ListEditor label={t('admin.contentTabs.servicesTab.offeringsArLabel')} items={svc.offerings_ar} onChange={v => set('offerings_ar', v)} />
            <ListEditor label={t('admin.contentTabs.servicesTab.offeringsEnLabel')} items={svc.offerings_en} onChange={v => set('offerings_en', v)} />
          </Grid2>
          <Grid2>
            <ListEditor label={t('admin.contentTabs.servicesTab.advantagesArLabel')} items={svc.advantages_ar} onChange={v => set('advantages_ar', v)} />
            <ListEditor label={t('admin.contentTabs.servicesTab.advantagesEnLabel')} items={svc.advantages_en} onChange={v => set('advantages_en', v)} />
          </Grid2>
        </div>
      )}
    </div>
  );
}

export default function ServicesTab() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    loadSiteContent('services').then(d => {
      if (d.items?.length) setServices(d.items);
      setLoading(false);
    });
  }, []);

  const updateSvc = (slug, svc) => setServices(p => p.map(s => s.slug === slug ? svc : s));

  const save = async () => {
    setSaving(true);
    try {
      await saveSiteContent('services', { items: services });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-2">
        {services.map(svc => (
          <ServiceCard key={svc.slug} svc={svc} onChange={updated => updateSvc(svc.slug, updated)} />
        ))}
      </div>
      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
