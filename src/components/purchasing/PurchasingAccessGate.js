'use client';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * Front-end gate for every /admin/purchasing/* page. This is a UX
 * convenience only — the real enforcement is the Firestore Security
 * Rules (purchRole()/purchInRoles() checks), which reject any read/write
 * a role isn't entitled to regardless of what this component renders.
 */
export default function PurchasingAccessGate({ children, allow }) {
  const { t, isRTL } = useLanguage();
  const { loading, canAccessAdminModule, isRole } = usePurchasingRole();

  const allowed = allow ? isRole(...allow) || isRole('super_admin') : canAccessAdminModule;

  if (loading) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-[#c8a96e]" /></div>
      </AdminPageLayout>
    );
  }

  if (!allowed) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center max-w-md">
            <ShieldAlert size={32} className="text-amber-400 mx-auto mb-3" />
            <p className="text-white font-bold mb-1.5">{t('purchasing.noPermissionTitle')}</p>
            <p className="text-white/40 text-sm">{t('purchasing.noPermissionDesc')}</p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return children;
}
