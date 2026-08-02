'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import { Loader2, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 50;

function OrdersContent() {
  const { t, isRTL } = useLanguage();
  const [orders, setOrders] = useState(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'purchaseOrders'), orderBy('issuedAt', 'desc'), limit(pageSize));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setHasMore(snap.docs.length === pageSize);
    });
    return unsub;
  }, [pageSize]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><FileText size={20} className="text-[#c8a96e]" />{t('purchasing.ordersTitle')}</h1>
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        {orders === null ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#c8a96e] animate-spin" /></div>
        ) : orders.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-16">{t('admin.noResults')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {[t('purchasing.colPONumber'), t('purchasing.colProject'), t('purchasing.colSupplier'), t('purchasing.colValue'), t('admin.submittedCol'), t('admin.actionsCol')].map(h => (
                    <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium" dir="ltr">{o.poNumber}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">{o.projectName}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">{o.supplierName}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs" dir="ltr">{Number(o.totalValue || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-white/40 text-xs" dir="ltr">{o.issuedAt?.seconds ? new Date(o.issuedAt.seconds * 1000).toLocaleDateString('en-GB') : '—'}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/purchasing/orders/${o.id}`} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 inline-flex"><Eye size={15} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-5">
          <button onClick={() => setPageSize(p => p + PAGE_SIZE)}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-white/50 hover:text-white transition-colors">
            {t('admin.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><OrdersContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
