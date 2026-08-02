'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import ItemsTable from '@/components/purchasing/ItemsTable';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function OrderDetailContent({ id }) {
  const { t, isRTL } = useLanguage();
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'purchaseOrders', id), s => setOrder(s.exists() ? { id: s.id, ...s.data() } : null));
    return unsub;
  }, [id]);

  if (order === undefined) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-[#c8a96e]" /></div>;
  if (order === null) return <div className="text-center text-white/40 py-20">{t('admin.noResults')}</div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white" dir="ltr">{order.poNumber}</h1>
          <p className="text-sm text-white/40 mt-1">{order.projectName}</p>
        </div>
        <Link href={`/admin/purchasing/requests/${order.requestId}`} className="text-xs text-[#c8a96e] hover:underline flex items-center gap-1">
          {isRTL ? <ArrowRight size={12} /> : <ArrowLeft size={12} />} {t('purchasing.backToRequest')}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
        <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{t('purchasing.colSupplier')}</p><p className="text-sm text-white/80">{order.supplierName}</p></div>
        <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{t('purchasing.colValue')}</p><p className="text-sm text-white/80" dir="ltr">{Number(order.totalValue || 0).toLocaleString()}</p></div>
        <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{t('admin.submittedCol')}</p><p className="text-sm text-white/80" dir="ltr">{order.issuedAt?.seconds ? new Date(order.issuedAt.seconds * 1000).toLocaleDateString('en-GB') : '—'}</p></div>
        <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{t('purchasing.colRequestNumber')}</p><p className="text-sm text-white/80" dir="ltr">{order.requestNumber}</p></div>
        <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{t('purchasing.issuedBy')}</p><p className="text-sm text-white/80">{order.issuedByName}</p></div>
      </div>

      <div>
        <p className="text-xs text-[#c8a96e] font-bold uppercase tracking-widest mb-2">{t('purchasing.itemsTableTitle')}</p>
        <ItemsTable items={order.items || []} onChange={() => {}} readOnly />
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><OrderDetailContent id={id} /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
