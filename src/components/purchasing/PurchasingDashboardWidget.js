'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import PurchaseStatusBadge from './PurchaseStatusBadge';
import { STATUS } from '@/lib/purchasingConfig';
import { ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PENDING_STATUSES = [STATUS.PENDING_ENGINEER_APPROVAL, STATUS.PENDING_PROC_APPROVAL];

/**
 * Additive widget for the main /admin/dashboard page — independent of the
 * existing suppliers/jobs/messages sections above it. Only rendered for
 * users who actually have a role in the purchasing module.
 */
export default function PurchasingDashboardWidget() {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const { canAccessAdminModule } = usePurchasingRole();
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    if (!canAccessAdminModule) return;
    const unsub = onSnapshot(collection(db, 'purchaseRequests'), snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [canAccessAdminModule]);

  if (!canAccessAdminModule || requests === null) return null;

  const counts = {
    total: requests.length,
    pending: requests.filter(r => PENDING_STATUSES.includes(r.status)).length,
    underReview: requests.filter(r => [STATUS.RFQ_REQUESTED, STATUS.QUOTATIONS_RECEIVED, STATUS.PO_ISSUED].includes(r.status)).length,
    approved: requests.filter(r => r.status === STATUS.APPROVED).length,
    rejected: requests.filter(r => r.status === STATUS.REJECTED).length,
    completed: requests.filter(r => r.status === STATUS.COMPLETED || r.status === STATUS.ARCHIVED).length,
  };
  const latest = [...requests].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)).slice(0, 10);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart size={14} className="text-[#c8a96e]" />
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('purchasing.dashboardWidgetTitle')}</span>
        <Link href="/admin/purchasing" className="ms-auto text-xs text-[#c8a96e] hover:underline flex items-center gap-1">
          {t('admin.viewAll')} <ArrowIcon size={11} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          ['purchasing.kpiTotal', counts.total], ['purchasing.kpiPending', counts.pending],
          ['purchasing.kpiUnderPurchase', counts.underReview], ['purchasing.kpiApproved', counts.approved],
          ['purchasing.kpiRejected', counts.rejected], ['purchasing.kpiCompleted', counts.completed],
        ].map(([key, value]) => (
          <Link key={key} href="/admin/purchasing/requests" className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 hover:border-white/[0.13] transition-all">
            <p className="text-xs text-white/40 mb-2">{t(key)}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">{t('purchasing.latestRequests')}</h2>
          <Link href="/admin/purchasing/requests" className="flex items-center gap-1 text-xs text-[#c8a96e] hover:underline">
            {t('admin.viewAll')} <ArrowIcon size={11} />
          </Link>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {latest.length === 0 ? (
            <p className="text-center text-white/25 text-sm py-8">{t('purchasing.noRequestsYet')}</p>
          ) : latest.map(r => (
            <Link key={r.id} href={`/admin/purchasing/requests/${r.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors group">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate group-hover:text-[#c8a96e] transition-colors" dir="ltr">{r.requestNumber}</p>
                <p className="text-xs text-white/30 mt-0.5 truncate">{r.projectName} · {r.requesterName}</p>
              </div>
              <PurchaseStatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
