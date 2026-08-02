'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import { STATUS, STATUS_COLORS, STATUS_LABEL_KEYS, ITEM_CATEGORY_LABEL_KEYS } from '@/lib/purchasingConfig';
import { exportCSV, exportExcel, exportWord, exportPDF } from '@/lib/purchasingExport';
import { projectKeyFor, computeBudgetSummary, budgetBarColor } from '@/lib/purchasingBudget';
import PurchasingReportHeader from '@/components/purchasing/PurchasingReportHeader';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Loader2, FileSpreadsheet, FileText, FileDown, Printer, AlertTriangle, Zap, DollarSign, Clock,
} from 'lucide-react';

const GOLD = '#c8a96e';

function toMonthKey(ts) {
  if (!ts?.seconds) return null;
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
function daysBetween(a, b) {
  if (!a?.seconds || !b?.seconds) return null;
  return (b.seconds - a.seconds) / 86400;
}

function KPI({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-white/40">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}><Icon size={16} style={{ color }} /></div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function ReportsContent() {
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState(null);
  const [orders, setOrders] = useState(null);
  const [budgets, setBudgets] = useState(null);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'purchaseRequests'), snap => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'purchaseOrders'), snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, 'projectBudgets'), snap => setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const data = useMemo(() => {
    if (!requests || !orders) return null;
    const today = new Date();
    const openStatuses = [STATUS.COMPLETED, STATUS.ARCHIVED, STATUS.REJECTED];

    const overdue = requests.filter(r => !openStatuses.includes(r.status) &&
      r.items?.some(it => it.neededDate && new Date(it.neededDate) < today));
    const urgent = requests.filter(r => !openStatuses.includes(r.status) && (r.priority === 'urgent' || r.priority === 'very_urgent'));

    const byProjectMap = {};
    requests.forEach(r => { if (r.projectName) byProjectMap[r.projectName] = (byProjectMap[r.projectName] ?? 0) + 1; });
    const byProject = Object.entries(byProjectMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

    const byStatus = Object.keys(STATUS_LABEL_KEYS).map(s => ({
      name: t(STATUS_LABEL_KEYS[s]), value: requests.filter(r => r.status === s).length, color: STATUS_COLORS[s],
    })).filter(d => d.value > 0);

    const approvalDurations = requests.map(r => daysBetween(r.submittedAt, r.approvalDecisionAt)).filter(d => d !== null && d >= 0);
    const avgApprovalDays = approvalDurations.length ? (approvalDurations.reduce((a, b) => a + b, 0) / approvalDurations.length) : 0;

    const purchaseDurations = requests.map(r => daysBetween(r.approvalDecisionAt, r.completedAt)).filter(d => d !== null && d >= 0);
    const avgPurchaseDays = purchaseDurations.length ? (purchaseDurations.reduce((a, b) => a + b, 0) / purchaseDurations.length) : 0;

    const totalCost = requests.reduce((s, r) => s + (Number(r.totalEstimatedCost) || 0), 0);

    const supplierMap = {};
    orders.forEach(o => {
      if (!o.supplierName) return;
      if (!supplierMap[o.supplierName]) supplierMap[o.supplierName] = { name: o.supplierName, count: 0, value: 0 };
      supplierMap[o.supplierName].count += 1;
      supplierMap[o.supplierName].value += Number(o.totalValue) || 0;
    });
    const topSuppliers = Object.values(supplierMap).sort((a, b) => b.value - a.value).slice(0, 8);

    const months = [...new Set(requests.map(r => toMonthKey(r.createdAt)).filter(Boolean))].sort((a, b) => new Date(a) - new Date(b));
    const monthly = months.map(month => ({
      month, count: requests.filter(r => toMonthKey(r.createdAt) === month).length,
      spend: requests.filter(r => toMonthKey(r.createdAt) === month).reduce((s, r) => s + (Number(r.totalEstimatedCost) || 0), 0),
    }));

    const yearMap = {};
    const yearSpendMap = {};
    requests.forEach(r => {
      if (r.createdAt?.seconds) {
        const y = new Date(r.createdAt.seconds * 1000).getFullYear();
        yearMap[y] = (yearMap[y] ?? 0) + 1;
        yearSpendMap[y] = (yearSpendMap[y] ?? 0) + (Number(r.totalEstimatedCost) || 0);
      }
    });
    const yearly = Object.entries(yearMap).sort((a, b) => a[0] - b[0]).map(([year, count]) => ({ year, count, spend: yearSpendMap[year] || 0 }));

    const categoryMap = {};
    const materialMap = {};
    requests.forEach(r => (r.items || []).forEach(it => {
      if (it.category) {
        if (!categoryMap[it.category]) categoryMap[it.category] = { qty: 0, cost: 0 };
        categoryMap[it.category].qty += Number(it.quantity) || 0;
        categoryMap[it.category].cost += (Number(it.quantity) || 0) * (Number(it.estimatedPrice) || 0);
      }
      if (it.itemName) {
        materialMap[it.itemName] = (materialMap[it.itemName] || 0) + (Number(it.quantity) || 0);
      }
    }));
    const byCategory = Object.entries(categoryMap).sort((a, b) => b[1].cost - a[1].cost)
      .map(([cat, v]) => ({ name: ITEM_CATEGORY_LABEL_KEYS[cat] ? t(ITEM_CATEGORY_LABEL_KEYS[cat]) : cat, ...v }));
    const topMaterials = Object.entries(materialMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }));

    const budgetConsumption = (budgets || []).map(b => {
      const projectRequests = requests.filter(r => projectKeyFor(r.projectName) === b.id);
      const projectOrders = orders.filter(o => projectKeyFor(o.projectName) === b.id);
      return { projectName: b.projectName, ...computeBudgetSummary({ approvedBudget: b.approvedBudget, projectRequests, projectOrders }) };
    }).sort((a, b) => b.consumedPct - a.consumedPct);

    return { overdue, urgent, byProject, byStatus, avgApprovalDays, avgPurchaseDays, totalCost, topSuppliers, monthly, yearly, byCategory, topMaterials, budgetConsumption };
  }, [requests, orders, budgets, t]);

  const exportRows = () => (requests || []).map(r => ({
    RequestNumber: r.requestNumber, Project: r.projectName, Site: r.siteName, Requester: r.requesterName,
    Status: r.status, Priority: r.priority, TotalCost: r.totalEstimatedCost, Date: r.requestDate,
  }));

  if (!data) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-[#c8a96e]" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <style media="print">{`
        body * { visibility: hidden; }
        #purchasing-print-area, #purchasing-print-area * { visibility: visible; }
        #purchasing-print-area { position: absolute; inset: 0; width: 100%; }
      `}</style>

      <PurchasingSubNav />
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">{t('purchasing.reportsTitle')}</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportCSV('purchasing-report', exportRows())} className="purch-export-btn"><FileDown size={13} /> CSV</button>
          <button onClick={() => exportExcel('purchasing-report', exportRows())} className="purch-export-btn"><FileSpreadsheet size={13} /> Excel</button>
          <button onClick={() => exportWord('purchasing-report', document.getElementById('purchasing-print-area')?.innerHTML || '')} className="purch-export-btn"><FileText size={13} /> Word</button>
          <button onClick={exportPDF} className="purch-export-btn"><Printer size={13} /> PDF</button>
        </div>
      </div>
      <style>{`.purch-export-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;font-size:11px;font-weight:700;color:#c8a96e;border:1px solid rgba(200,169,110,0.3);transition:background .2s} .purch-export-btn:hover{background:rgba(200,169,110,0.1)}`}</style>

      <div id="purchasing-print-area" className="space-y-6">
        <PurchasingReportHeader title={t('purchasing.reportsTitle')} subtitle={t('purchasing.execReportSubtitle')} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label={t('purchasing.kpiOverdue')} value={data.overdue.length} icon={AlertTriangle} color="#ef4444" />
          <KPI label={t('purchasing.kpiUrgent')} value={data.urgent.length} icon={Zap} color="#f59e0b" />
          <KPI label={t('purchasing.kpiAvgApprovalDays')} value={data.avgApprovalDays.toFixed(1)} icon={Clock} color="#3b82f6" />
          <KPI label={t('purchasing.kpiAvgPurchaseDays')} value={data.avgPurchaseDays.toFixed(1)} icon={Clock} color="#8b5cf6" />
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GOLD}18` }}><DollarSign size={20} style={{ color: GOLD }} /></div>
          <div><p className="text-xs text-white/40">{t('purchasing.kpiTotalValue')}</p><p className="text-2xl font-black text-white" dir="ltr">{data.totalCost.toLocaleString()}</p></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportByStatus')}</h3>
            {data.byStatus.length === 0 ? <p className="text-white/20 text-sm text-center py-14">—</p> : (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={data.byStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                    {data.byStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportByProject')}</h3>
            {data.byProject.length === 0 ? <p className="text-white/20 text-sm text-center py-14">—</p> : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.byProject} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} fill={GOLD} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {data.budgetConsumption.length > 0 && (
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportBudgetConsumption')}</h3>
            <div className="space-y-3">
              {data.budgetConsumption.map((b, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/60">{b.projectName}</span>
                    <span className="text-white/40" dir="ltr">{b.consumedPct}% · {(b.committedCost + b.actualCost).toLocaleString()} / {b.approvedBudget.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, b.consumedPct)}%`, background: budgetBarColor(b.consumedPct) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportByCategory')}</h3>
            {data.byCategory.length === 0 ? <p className="text-white/20 text-sm text-center py-14">—</p> : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.byCategory} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="cost" radius={[0, 6, 6, 0]} fill={GOLD} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportTopMaterials')}</h3>
            {data.topMaterials.length === 0 ? <p className="text-white/20 text-sm text-center py-10">—</p> : (
              <div className="space-y-2.5">
                {data.topMaterials.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{m.name}</span>
                    <span className="text-[#c8a96e] font-bold" dir="ltr">{m.qty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportTopSuppliers')}</h3>
          {data.topSuppliers.length === 0 ? <p className="text-white/20 text-sm text-center py-10">—</p> : (
            <div className="space-y-2.5">
              {data.topSuppliers.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{s.name} <span className="text-white/30 text-xs">({s.count})</span></span>
                  <span className="text-[#c8a96e] font-bold" dir="ltr">{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportMonthly')}</h3>
            {data.monthly.length === 0 ? <p className="text-white/20 text-sm text-center py-10">—</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={GOLD} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportYearly')}</h3>
            {data.yearly.length === 0 ? <p className="text-white/20 text-sm text-center py-10">—</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.yearly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportMonthlySpend')}</h3>
            {data.monthly.length === 0 ? <p className="text-white/20 text-sm text-center py-10">—</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="spend" radius={[6, 6, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.reportYearlySpend')}</h3>
            {data.yearly.length === 0 ? <p className="text-white/20 text-sm text-center py-10">—</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.yearly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="spend" radius={[6, 6, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasingReportsPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><ReportsContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
