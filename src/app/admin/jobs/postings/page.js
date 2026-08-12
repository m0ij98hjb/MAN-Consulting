'use client';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import JobsTab from '@/components/admin/content/JobsTab';
import { useLanguage } from '@/context/LanguageContext';
import { NAV_LABELS_MULTILANG } from '@/lib/roleBasedAccess';

export default function JobsPostingsPage() {
  const { t, lang, isRTL } = useLanguage();
  const title = NAV_LABELS_MULTILANG['/admin/jobs/postings']?.[lang]
    || NAV_LABELS_MULTILANG['/admin/jobs/postings']?.en
    || 'Current Jobs';

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-xs text-white/30 mt-0.5">{t('admin.contentTabs.contentPage.tabJobs')}</p>
        </div>
        <JobsTab />
      </div>
    </AdminPageLayout>
  );
}
