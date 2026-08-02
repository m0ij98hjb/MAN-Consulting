'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import { projectKeyFor, computeBudgetSummary, budgetBarColor } from '@/lib/purchasingBudget';
import { Loader2, Wallet, Save } from 'lucide-react';

function BudgetRow({ projectName, requests, orders, budgetDoc, actorUid, t }) {
  const [value, setValue] = useState(budgetDoc?.approvedBudget ?? '');
  const [saving, setSaving] = useState(false);

  const summary = useMemo(() => computeBudgetSummary({
    approvedBudget: budgetDoc?.approvedBudget, projectRequests: requests, projectOrders: orders,
  }), [budgetDoc, requests, orders]);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'projectBudgets', projectKeyFor(projectName)), {
        projectName, approvedBudget: Number(value) || 0, updatedAt: serverTimestamp(), updatedBy: actorUid,
      }, { merge: true });
    } finally { setSaving(false); }
  };

  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-3.5 text-white font-medium">{projectName}</td>
      <td className="px-5 py-3.5">
        <input type="number" min="0" dir="ltr" value={value} onChange={e => setValue(e.target.value)}
          className="w-32 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
      </td>
      <td className="px-5 py-3.5 text-white/60 text-xs" dir="ltr">{summary.committedCost.toLocaleString()}</td>
      <td className="px-5 py-3.5 text-white/60 text-xs" dir="ltr">{summary.actualCost.toLocaleString()}</td>
      <td className="px-5 py-3.5 text-xs font-bold" dir="ltr" style={{ color: budgetBarColor(summary.consumedPct) }}>{summary.remaining.toLocaleString()}</td>
      <td className="px-5 py-3.5">
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {t('admin.save')}
        </button>
      </td>
    </tr>
  );
}

function BudgetsContent() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState(null);
  const [orders, setOrders] = useState(null);
  const [budgets, setBudgets] = useState(null);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'purchaseRequests'), snap => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'purchaseOrders'), snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, 'projectBudgets'), snap => {
      const map = {}; snap.docs.forEach(d => { map[d.id] = d.data(); }); setBudgets(map);
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const projectNames = useMemo(() => {
    if (!requests) return [];
    return [...new Set(requests.map(r => r.projectName).filter(Boolean))].sort();
  }, [requests]);

  const loading = requests === null || orders === null || budgets === null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Wallet size={20} className="text-[#c8a96e]" />{t('purchasing.budgetsTitle')}</h1>
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#c8a96e] animate-spin" /></div>
        ) : projectNames.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-16">{t('admin.noResults')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {[t('purchasing.colProject'), t('purchasing.budgetApproved'), t('purchasing.budgetCommitted'), t('purchasing.budgetActual'), t('purchasing.budgetRemaining'), t('admin.actionsCol')].map(h => (
                    <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {projectNames.map(name => (
                  <BudgetRow key={name} projectName={name} actorUid={user?.uid}
                    requests={requests.filter(r => r.projectName === name)}
                    orders={orders.filter(o => o.projectName === name)}
                    budgetDoc={budgets[projectKeyFor(name)]} t={t} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <PurchasingAccessGate allow={['procurement_manager']}>
      <AdminPageLayout><BudgetsContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
