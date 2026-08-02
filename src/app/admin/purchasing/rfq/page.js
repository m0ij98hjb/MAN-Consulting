'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import PurchaseStatusBadge from '@/components/purchasing/PurchaseStatusBadge';
import { Loader2, ArrowLeft, ArrowRight, BarChart2, Eye, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

function RFQListContent() {
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'purchaseRequests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {
      // Fallback if index missing
      onSnapshot(collection(db, 'purchaseRequests'), s => {
        setRequests(s.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    });
    return unsub;
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 size={22} className="text-[#c8a96e]" />
            {t('purchasing.rfqComparisonsListTitle')}
          </h1>
          <p className="text-xs text-white/40 mt-1">{t('purchasing.rfqComparisonsListSubtitle')}</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
        {requests === null ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-[#c8a96e] animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileSpreadsheet size={36} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">{t('admin.noResults')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.01]">
                  <th className="text-start text-xs text-white/40 font-medium px-5 py-3.5 whitespace-nowrap">{t('purchasing.colRequestNumberTitle')}</th>
                  <th className="text-start text-xs text-white/40 font-medium px-5 py-3.5 whitespace-nowrap">{t('purchasing.colRequester')}</th>
                  <th className="text-start text-xs text-white/40 font-medium px-5 py-3.5 whitespace-nowrap">{t('purchasing.colItemCount')}</th>
                  <th className="text-start text-xs text-white/40 font-medium px-5 py-3.5 whitespace-nowrap">{t('admin.statusCol')}</th>
                  <th className="text-start text-xs text-white/40 font-medium px-5 py-3.5 whitespace-nowrap">{t('admin.actionsCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{req.title || req.requestNumber || t('purchasing.purchaseRequestFallback')}</div>
                      <div className="text-[11px] text-white/40 font-mono mt-0.5">{req.requestNumber || req.id}</div>
                    </td>
                    <td className="px-5 py-3.5 text-white/70 text-xs">
                      {req.requesterName || req.createdByName || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-white/70 text-xs">
                      {req.items?.length || 0} {t('purchasing.itemsUnitLabel')}
                    </td>
                    <td className="px-5 py-3.5">
                      <PurchaseStatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/purchasing/rfq/${req.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black hover:opacity-90 transition-all shadow-md"
                        style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}
                      >
                        <Eye size={13} />
                        {t('purchasing.quotationComparisonTitle')}
                        {isRTL ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                      </Link>
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

export default function PurchasingRFQListPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><RFQListContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
