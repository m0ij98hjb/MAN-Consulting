'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import { ROLE_LABEL_KEYS } from '@/lib/purchasingConfig';
import { Loader2, UserCog } from 'lucide-react';

function UsersContent() {
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'purchasingUsers'), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCog size={20} className="text-[#c8a96e]" />
          {t('purchasing.usersTitle')}
        </h1>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
        {users === null ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-[#c8a96e] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-16">{t('admin.noResults')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.01]">
                  {[
                    t('purchasing.requesterName'),
                    t('admin.emailLabel'),
                    t('purchasing.roleLabel'),
                    t('purchasing.department'),
                    t('admin.statusCol'),
                  ].map(h => (
                    <th key={h} className="text-start text-xs text-white/40 font-medium px-5 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{u.name}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs font-mono" dir="ltr">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#c8a96e] font-medium">
                        {t(ROLE_LABEL_KEYS[u.role]) || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">{u.department || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.active !== false ? 'text-green-400 bg-green-500/12 border border-green-500/20' : 'text-red-400 bg-red-500/12 border border-red-500/20'}`}>
                        {u.active !== false ? t('purchasing.activeLabel') : t('purchasing.inactiveLabel')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PurchasingUsersPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><UsersContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
