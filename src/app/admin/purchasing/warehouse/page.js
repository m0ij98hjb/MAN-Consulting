'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import PurchaseStatusBadge from '@/components/purchasing/PurchaseStatusBadge';
import { STATUS } from '@/lib/purchasingConfig';
import { Loader2, Truck, PackageCheck, Boxes } from 'lucide-react';
import Link from 'next/link';

function WarehouseContent() {
  const { t, isRTL } = useLanguage();
  const [pending, setPending] = useState(null);
  const [receipts, setReceipts] = useState(null);
  const [stock, setStock] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'purchaseRequests'), where('status', '==', STATUS.DELIVERED_PENDING));
    const unsub = onSnapshot(q, snap => setPending(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'warehouseReceipts'), snap => {
      setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.receivedAt?.seconds ?? 0) - (a.receivedAt?.seconds ?? 0)).slice(0, 15));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'warehouseStock'), snap => {
      setStock(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(s => Number(s.quantityOnHand) > 0)
        .sort((a, b) => (a.itemName || '').localeCompare(b.itemName || '')));
    });
    return unsub;
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Truck size={20} className="text-[#c8a96e]" />{t('purchasing.warehouseTitle')}</h1>

      <div>
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-3">{t('purchasing.pendingReceiptTitle')}</h2>
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          {pending === null ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={26} className="text-[#c8a96e] animate-spin" /></div>
          ) : pending.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-12">{t('admin.noResults')}</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {pending.map(r => (
                <Link key={r.id} href={`/admin/purchasing/requests/${r.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate group-hover:text-[#c8a96e]" dir="ltr">{r.requestNumber}</p>
                    <p className="text-xs text-white/30 mt-0.5">{r.projectName} · {r.siteName}</p>
                  </div>
                  <PurchaseStatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2"><Boxes size={14} />{t('purchasing.stockLevelsTitle')}</h2>
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          {stock === null ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={26} className="text-[#c8a96e] animate-spin" /></div>
          ) : stock.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-12">{t('purchasing.noStockAvailable')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {[t('purchasing.itemName'), t('purchasing.itemUnit'), t('purchasing.quantityOnHand')].map(h => (
                      <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {stock.map(s => (
                    <tr key={s.id}>
                      <td className="px-5 py-3 text-white font-medium">{s.itemName}</td>
                      <td className="px-5 py-3 text-white/50 text-xs">{s.unit || '—'}</td>
                      <td className="px-5 py-3 text-white/80 font-bold" dir="ltr">{s.quantityOnHand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2"><PackageCheck size={14} />{t('purchasing.recentReceiptsTitle')}</h2>
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          {receipts === null ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={26} className="text-[#c8a96e] animate-spin" /></div>
          ) : receipts.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-12">{t('admin.noResults')}</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {receipts.map(r => (
                <Link key={r.id} href={`/admin/purchasing/requests/${r.requestId}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm text-white/70 group-hover:text-[#c8a96e]">{r.receivedByName}</p>
                    <p className="text-xs text-white/30 mt-0.5">{r.items?.length || 0} {t('purchasing.itemsTableTitle')}</p>
                  </div>
                  <span className="text-xs text-white/25" dir="ltr">{r.receivedAt?.seconds ? new Date(r.receivedAt.seconds * 1000).toLocaleDateString('en-GB') : '—'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WarehousePage() {
  return (
    <PurchasingAccessGate allow={['store_keeper', 'procurement_manager']}>
      <AdminPageLayout><WarehouseContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
