'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import PurchaseStatusBadge from '@/components/purchasing/PurchaseStatusBadge';
import { DASHBOARD_TABS, STATUS_LABEL_KEYS, ITEM_CATEGORIES, ITEM_CATEGORY_LABEL_KEYS } from '@/lib/purchasingConfig';
import { Search as SearchIcon, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';

const inputCls = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none';

function SearchContent() {
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState(null);
  const [orders, setOrders] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'purchaseRequests'), snap => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'purchaseOrders'), snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, []);

  const poByRequestId = useMemo(() => Object.fromEntries((orders || []).map(o => [o.requestId, o])), [orders]);

  const results = useMemo(() => {
    if (!requests) return [];
    const term = q.trim().toLowerCase();
    return requests.filter(r => {
      const po = poByRequestId[r.id];
      if (status !== 'all' && r.status !== status) return false;
      if (category !== 'all' && !(r.items || []).some(it => it.category === category)) return false;
      if (dateFrom && (!r.requestDate || new Date(r.requestDate) < new Date(dateFrom))) return false;
      if (dateTo && (!r.requestDate || new Date(r.requestDate) > new Date(dateTo))) return false;
      const cost = Number(r.totalEstimatedCost) || 0;
      if (budgetMin && cost < Number(budgetMin)) return false;
      if (budgetMax && cost > Number(budgetMax)) return false;
      if (!term) return true;
      return (
        r.requestNumber?.toLowerCase().includes(term) ||
        r.projectName?.toLowerCase().includes(term) ||
        r.requesterName?.toLowerCase().includes(term) ||
        po?.poNumber?.toLowerCase().includes(term) ||
        po?.supplierName?.toLowerCase().includes(term) ||
        r.items?.some(it => it.itemName?.toLowerCase().includes(term) || it.suggestedSupplier?.toLowerCase().includes(term))
      );
    });
  }, [requests, poByRequestId, q, status, category, dateFrom, dateTo, budgetMin, budgetMax]);

  const loading = requests === null || orders === null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><SearchIcon size={20} className="text-[#c8a96e]" />{t('purchasing.advancedSearchTitle')}</h1>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 mb-6 space-y-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('purchasing.searchGlobalPlaceholder')}
          className={`${inputCls} w-full py-2.5 text-sm`} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
            <option value="all">{t('admin.allStatuses')}</option>
            {DASHBOARD_TABS.map(s => <option key={s} value={s}>{t(STATUS_LABEL_KEYS[s])}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            <option value="all">{t('purchasing.allCategories')}</option>
            {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{t(ITEM_CATEGORY_LABEL_KEYS[c])}</option>)}
          </select>
          <input type="date" dir="ltr" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} placeholder={t('purchasing.dateFrom')} />
          <input type="date" dir="ltr" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls} placeholder={t('purchasing.dateTo')} />
          <input type="number" dir="ltr" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder={t('purchasing.budgetMin')} className={inputCls} />
          <input type="number" dir="ltr" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder={t('purchasing.budgetMax')} className={inputCls} />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#c8a96e] animate-spin" /></div>
        ) : results.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-16">{t('admin.noResults')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {[t('purchasing.colRequestNumber'), t('purchasing.colPONumber'), t('purchasing.colProject'), t('purchasing.colRequester'), t('purchasing.colSupplier'), t('purchasing.colValue'), t('admin.statusCol'), t('admin.actionsCol')].map(h => (
                    <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {results.map(r => {
                  const po = poByRequestId[r.id];
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-white font-medium" dir="ltr">{r.requestNumber}</td>
                      <td className="px-5 py-3.5 text-white/60 text-xs" dir="ltr">{po?.poNumber || '—'}</td>
                      <td className="px-5 py-3.5 text-white/60 text-xs">{r.projectName}</td>
                      <td className="px-5 py-3.5 text-white/60 text-xs">{r.requesterName}</td>
                      <td className="px-5 py-3.5 text-white/60 text-xs">{po?.supplierName || '—'}</td>
                      <td className="px-5 py-3.5 text-white/60 text-xs" dir="ltr">{Number(r.totalEstimatedCost || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5"><PurchaseStatusBadge status={r.status} /></td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/purchasing/requests/${r.id}`} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 inline-flex"><Eye size={15} /></Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PurchasingSearchPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><SearchContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
