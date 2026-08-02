'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBottomNav from '@/components/admin/AdminBottomNav';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminPageLayout({ children }) {
  const { isRTL } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--background)] print:bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminNavbar />
      <div className="flex pt-[72px] min-h-screen print:pt-0 print:block">
        <AdminSidebar />
        <div className="flex-1 min-w-0 overflow-hidden print:overflow-visible">
          {children}
        </div>
      </div>
      <AdminBottomNav />
    </div>
  );
}
