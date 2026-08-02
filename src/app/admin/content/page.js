'use client';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import dynamic from 'next/dynamic';

const HomeTab       = dynamic(() => import('@/components/admin/content/HomeTab'),       { ssr: false });
const ProjectsTab   = dynamic(() => import('@/components/admin/content/ProjectsTab'),   { ssr: false });
const ServicesTab   = dynamic(() => import('@/components/admin/content/ServicesTab'),   { ssr: false });
const AboutTab      = dynamic(() => import('@/components/admin/content/AboutTab'),      { ssr: false });
const ContactTab    = dynamic(() => import('@/components/admin/content/ContactTab'),    { ssr: false });
const JobsTab       = dynamic(() => import('@/components/admin/content/JobsTab'),       { ssr: false });
const AppTab        = dynamic(() => import('@/components/admin/content/AppTab'),        { ssr: false });
const CalculatorTab = dynamic(() => import('@/components/admin/content/CalculatorTab'),{ ssr: false });
const SettingsTab   = dynamic(() => import('@/components/admin/content/SettingsTab'),  { ssr: false });

const TABS = [
  { id: 'home',       labelKey: 'admin.contentTabs.contentPage.tabHome',       emoji: '🏠', component: HomeTab },
  { id: 'projects',   labelKey: 'admin.contentTabs.contentPage.tabProjects',   emoji: '🏗️', component: ProjectsTab },
  { id: 'services',   labelKey: 'admin.contentTabs.contentPage.tabServices',   emoji: '🔧', component: ServicesTab },
  { id: 'about',      labelKey: 'admin.contentTabs.contentPage.tabAbout',      emoji: '👤', component: AboutTab },
  { id: 'contact',    labelKey: 'admin.contentTabs.contentPage.tabContact',    emoji: '📞', component: ContactTab },
  { id: 'jobs',       labelKey: 'admin.contentTabs.contentPage.tabJobs',       emoji: '💼', component: JobsTab },
  { id: 'app',        labelKey: 'admin.contentTabs.contentPage.tabApp',        emoji: '📱', component: AppTab },
  { id: 'calculator', labelKey: 'admin.contentTabs.contentPage.tabCalculator', emoji: '🧮', component: CalculatorTab },
  { id: 'settings',   labelKey: 'admin.contentTabs.contentPage.tabSettings',   emoji: '⚙️', component: SettingsTab },
];

export default function ContentPage() {
  const { t } = useLanguage();
  const [active, setActive] = useState('home');
  const ActiveTab = TABS.find(tab => tab.id === active)?.component ?? HomeTab;
  const { isSuperAdmin, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined && !isSuperAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [user, isSuperAdmin, router]);

  if (!isSuperAdmin) return null;

  return (
    <AdminPageLayout>
      <div className="p-5 lg:p-7 max-w-5xl mx-auto" dir="rtl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-white">{t('admin.contentTabs.contentPage.pageTitle')}</h1>
          <p className="text-xs text-white/30 mt-0.5">{t('admin.contentTabs.contentPage.pageSubtitle')}</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                active === tab.id
                  ? 'bg-[#c8a96e]/12 text-[#c8a96e]'
                  : 'text-white/35 hover:text-white/70 hover:bg-white/5'
              }`}
              style={active === tab.id ? { border: '1px solid rgba(201,163,77,0.30)' } : { border: '1px solid transparent' }}
            >
              <span>{tab.emoji}</span>
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <ActiveTab />
      </div>
    </AdminPageLayout>
  );
}
