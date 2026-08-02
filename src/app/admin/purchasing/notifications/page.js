'use client';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchaseNotifications } from '@/hooks/usePurchaseNotifications';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import { Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';

function fmtDate(ts) {
  if (!ts?.seconds) return '';
  return new Date(ts.seconds * 1000).toLocaleString('en-GB');
}

function NotificationsContent() {
  const { t, isRTL } = useLanguage();
  const { notifications, unreadCount, markRead } = usePurchaseNotifications();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Bell size={20} className="text-[#c8a96e]" />{t('purchasing.notificationsTitle')}</h1>
        {unreadCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-white/40"><CheckCheck size={13} />{unreadCount} {t('purchasing.unreadLabel')}</span>
        )}
      </div>
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        {notifications.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-16">{t('purchasing.noNotificationsYet')}</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {notifications.map(n => (
              <Link key={n.id} href={`/admin/purchasing/requests/${n.requestId}`} onClick={() => markRead(n.id)}
                className={`flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white/85 truncate">{n.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{n.message}</p>
                </div>
                <span className="text-[11px] text-white/25 shrink-0" dir="ltr">{fmtDate(n.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PurchasingNotificationsPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><NotificationsContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
