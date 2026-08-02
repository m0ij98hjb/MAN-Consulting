'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchaseNotifications } from '@/hooks/usePurchaseNotifications';
import { Bell } from 'lucide-react';

function fmtDate(ts) {
  if (!ts?.seconds) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-GB');
}

export default function PurchasingNotificationBell() {
  const { t, isRTL } = useLanguage();
  const { notifications, unreadCount, markRead } = usePurchaseNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute z-50 top-full mt-2 ${isRTL ? 'left-0' : 'right-0'} w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto bg-[#111118] border border-white/10 rounded-2xl shadow-2xl`}>
            <div className="px-4 py-3 border-b border-white/[0.07]"><p className="text-sm font-bold text-white">{t('purchasing.notificationsTitle')}</p></div>
            {notifications.length === 0 ? (
              <p className="text-center text-white/25 text-xs py-8">{t('purchasing.noNotificationsYet')}</p>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {notifications.slice(0, 20).map(n => (
                  <Link key={n.id} href={`/admin/purchasing/requests/${n.requestId}`} onClick={() => { markRead(n.id); setOpen(false); }}
                    className={`block px-4 py-3 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}>
                    <p className="text-xs font-bold text-white/80">{n.title}</p>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{n.message}</p>
                    <p className="text-[10px] text-white/20 mt-1" dir="ltr">{fmtDate(n.createdAt)}</p>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/admin/purchasing/notifications" onClick={() => setOpen(false)}
              className="block text-center px-4 py-2.5 text-xs font-semibold text-[#c8a96e] hover:underline border-t border-white/[0.07]">
              {t('purchasing.viewAllNotifications')}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
