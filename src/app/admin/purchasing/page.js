'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import PurchaseStatusBadge from '@/components/purchasing/PurchaseStatusBadge';
import PurchasingReminders from '@/components/purchasing/PurchasingReminders';
import { STATUS } from '@/lib/purchasingConfig';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
  Loader2, FileText, Clock, XCircle, CheckCircle, ShoppingCart, PackageCheck,
  DollarSign, ArrowLeft, ArrowRight, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

const GOLD = '#c8a96e', BLUE = '#3b82f6', GREEN = '#10b981', AMBER = '#f59e0b', RED = '#ef4444';

const PENDING_STATUSES = [STATUS.PENDING_ENGINEER_APPROVAL, STATUS.PENDING_PROC_APPROVAL];
const UNDER_PURCHASE_STATUSES = [
  STATUS.RFQ_REQUESTED, STATUS.QUOTATIONS_RECEIVED, STATUS.PO_ISSUED, STATUS.DELIVERED_PENDING, STATUS.RECEIVED,
];

function StatCard({ label, value, icon: Icon, color, bg, href }) {
  const inner = (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.13] transition-all h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function toMonthKey(ts) {
  if (!ts?.seconds) return null;
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function DashboardContent() {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'purchaseRequests'), snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const data = useMemo(() => {
    if (!requests) return null;
    const total = requests.length;
    const pending = requests.filter(r => PENDING_STATUSES.includes(r.status)).length;
    const approved = requests.filter(r => r.status === STATUS.APPROVED).length;
    const rejected = requests.filter(r => r.status === STATUS.REJECTED).length;
    const underPurchase = requests.filter(r => UNDER_PURCHASE_STATUSES.includes(r.status)).length;
    const completed = requests.filter(r => r.status === STATUS.COMPLETED || r.status === STATUS.ARCHIVED).length;
    const totalValue = requests.reduce((s, r) => s + (Number(r.totalEstimatedCost) || 0), 0);

    const projMap = {};
    requests.forEach(r => { if (r.projectName) projMap[r.projectName] = (projMap[r.projectName] ?? 0) + 1; });
    const topProjects = Object.entries(projMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

    const months = [...new Set(requests.map(r => toMonthKey(r.createdAt)).filter(Boolean))]
      .sort((a, b) => new Date(a) - new Date(b));
    const monthly = months.map(month => ({ month, count: requests.filter(r => toMonthKey(r.createdAt) === month).length }));

    const latest = [...requests].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)).slice(0, 10);

    return { total, pending, approved, rejected, underPurchase, completed, totalValue, topProjects, monthly, latest };
  }, [requests]);

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-[#c8a96e]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">{t('purchasing.dashboardTitle')}</h1>
      </div>

      <PurchasingReminders requests={requests} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard label={t('purchasing.kpiTotal')}         value={data.total}        icon={FileText}     color={GOLD}  bg={`${GOLD}18`}  href="/admin/purchasing/requests" />
        <StatCard label={t('purchasing.kpiPending')}       value={data.pending}      icon={Clock}        color={BLUE}  bg={`${BLUE}18`}  href="/admin/purchasing/requests" />
        <StatCard label={t('purchasing.kpiApproved')}      value={data.approved}     icon={CheckCircle}  color={GREEN} bg={`${GREEN}18`} href="/admin/purchasing/requests" />
        <StatCard label={t('purchasing.kpiRejected')}      value={data.rejected}     icon={XCircle}      color={RED}   bg={`${RED}18`}   href="/admin/purchasing/requests" />
        <StatCard label={t('purchasing.kpiUnderPurchase')} value={data.underPurchase} icon={ShoppingCart} color={AMBER} bg={`${AMBER}18`} href="/admin/purchasing/requests" />
        <StatCard label={t('purchasing.kpiCompleted')}     value={data.completed}    icon={PackageCheck} color={GREEN} bg={`${GREEN}18`} href="/admin/purchasing/requests" />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 mb-8 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GOLD}18` }}>
          <DollarSign size={20} style={{ color: GOLD }} />
        </div>
        <div>
          <p className="text-xs text-white/40">{t('purchasing.kpiTotalValue')}</p>
          <p className="text-2xl font-black text-white" dir="ltr">{data.totalValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-[#c8a96e]" />{t('purchasing.monthlyTrend')}</h3>
          {data.monthly.length === 0 ? <p className="text-white/20 text-sm text-center py-14">—</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPurch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2.5} fill="url(#gradPurch)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">{t('purchasing.topProjects')}</h3>
          {data.topProjects.length === 0 ? <p className="text-white/20 text-sm text-center py-14">—</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topProjects} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {data.topProjects.map((_, i) => <Cell key={i} fill={GOLD} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">{t('purchasing.latestRequests')}</h2>
          <Link href="/admin/purchasing/requests" className="flex items-center gap-1 text-xs text-[#c8a96e] hover:underline">
            {t('admin.viewAll')} <ArrowIcon size={11} />
          </Link>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {data.latest.length === 0 ? <p className="text-center text-white/25 text-sm py-8">{t('purchasing.noRequestsYet')}</p> : data.latest.map(r => (
            <Link key={r.id} href={`/admin/purchasing/requests/${r.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors group">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate group-hover:text-[#c8a96e] transition-colors" dir="ltr">{r.requestNumber}</p>
                <p className="text-xs text-white/30 mt-0.5 truncate">{r.projectName} · {r.requesterName}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ms-3">
                <PurchaseStatusBadge status={r.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PurchasingDashboardPage() {
  return (
    <PurchasingAccessGate allow={['procurement_manager']}>
      <AdminPageLayout>
        <DashboardContent />
      </AdminPageLayout>
    </PurchasingAccessGate>
  );
}
