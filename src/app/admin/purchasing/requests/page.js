'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import PurchaseStatusBadge from '@/components/purchasing/PurchaseStatusBadge';
import { DASHBOARD_TABS, STATUS_LABEL_KEYS, PRIORITY_LABEL_KEYS } from '@/lib/purchasingConfig';
import { Search, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';

const DATE_PRESETS = ['all', 'today', 'week', 'month', 'year'];
const PAGE_SIZE = 50;

function withinPreset(date, preset) {
  if (preset === 'all' || !date) return true;
  const now = new Date();
  const d = new Date(date);
  if (preset === 'today') return d.toDateString() === now.toDateString();
  if (preset === 'week') { const diff = (now - d) / 86400000; return diff <= 7; }
  if (preset === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (preset === 'year') return d.getFullYear() === now.getFullYear();
  return true;
}

function RequestsContent() {
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'purchaseRequests'), orderBy('createdAt', 'desc'), limit(pageSize));
    const unsub = onSnapshot(q, snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setHasMore(snap.docs.length === pageSize);
    });
    return unsub;
  }, [pageSize]);

  const filtered = useMemo(() => {
    if (!requests) return [];
    const q = search.trim().toLowerCase();
    return requests.filter(r => {
      const matchTab = tab === 'all' || r.status === tab;
      const matchDate = withinPreset(r.requestDate, datePreset);
      const matchSearch = !q ||
        r.requestNumber?.toLowerCase().includes(q) ||
        r.projectName?.toLowerCase().includes(q) ||
        r.siteName?.toLowerCase().includes(q) ||
        r.requesterName?.toLowerCase().includes(q) ||
        r.priority?.toLowerCase().includes(q) ||
        r.items?.some(it => it.suggestedSupplier?.toLowerCase().includes(q));
      return matchTab && matchDate && matchSearch;
    });
  }, [requests, tab, search, datePreset]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <h1 className="text-2xl font-bold text-white mb-6">{t('purchasing.requestsTitle')}</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('purchasing.searchRequestsPlaceholder')}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ps-9 pe-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8a96e]/40" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DATE_PRESETS.map(p => (
            <button key={p} onClick={() => setDatePreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${datePreset === p ? 'bg-[#c8a96e] border-[#c8a96e] text-black' : 'border-white/10 text-white/50 hover:text-white'}`}>
              {t(`purchasing.datePreset_${p}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${tab === 'all' ? 'bg-[#c8a96e] border-[#c8a96e] text-black' : 'border-white/10 text-white/50 hover:text-white'}`}>
          {t('admin.allStatuses')}
        </button>
        {DASHBOARD_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${tab === s ? 'bg-[#c8a96e] border-[#c8a96e] text-black' : 'border-white/10 text-white/50 hover:text-white'}`}>
            {t(STATUS_LABEL_KEYS[s])}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        {requests === null ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#c8a96e] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-16">{t('admin.noResults')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {[
                    t('purchasing.colRequestNumber'), t('purchasing.colProject'), t('purchasing.colRequester'),
                    t('purchasing.colPriority'), t('purchasing.colValue'), t('admin.submittedCol'),
                    t('admin.statusCol'), t('admin.actionsCol'),
                  ].map(h => <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3.5 whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium" dir="ltr">{r.requestNumber}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">{r.projectName}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">{r.requesterName}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">{t(PRIORITY_LABEL_KEYS[r.priority])}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs" dir="ltr">{Number(r.totalEstimatedCost || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-white/40 text-xs" dir="ltr">
                      {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-5 py-3.5"><PurchaseStatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/purchasing/requests/${r.id}`} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors inline-flex">
                        <Eye size={15} />
                      </Link>
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

export default function RequestsListPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><RequestsContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
