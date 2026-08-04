'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Loader2, Briefcase, TrendingUp, Calendar,
  XCircle,
} from 'lucide-react';

/* ─── palette ─── */
const GOLD   = '#F2B233';
const BLUE   = '#3b82f6';
const AMBER  = '#f59e0b';
const RED    = '#ef4444';

const CHART_COLORS = [GOLD, BLUE, AMBER, RED, '#a78bfa', '#14b8a6', '#ec4899', '#f97316', '#06b6d4'];

const JOB_STATUS_COLORS = { pending: BLUE, interview_scheduled: AMBER, rejected: RED };
const JOB_STATUS_TKEYS  = { pending: 'admin.statusPending', interview_scheduled: 'admin.statusInterviewScheduled', rejected: 'admin.statusRejected' };
const EXP_ORDER = ['أقل من سنة','1 – 3 سنوات','3 – 5 سنوات','5 – 10 سنوات','أكثر من 10 سنوات'];

function toMonthKey(ts) {
  if (!ts?.seconds) return null;
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
function toMonthSort(key) {
  return key ? new Date(key).getTime() : 0;
}

/* ─── Tooltip ─── */
function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3.5 py-2.5 text-xs shadow-2xl"
      style={{ background: '#0b1320', border: '1px solid rgba(255,255,255,0.1)' }}>
      {label && <p className="text-white/40 mb-1.5 text-[11px]">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-bold flex items-center gap-1.5" style={{ color: p.color || p.fill || GOLD }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color || p.fill }} />
          {p.name && <span className="text-white/50 font-normal">{p.name}: </span>}
          {p.value}
        </p>
      ))}
    </div>
  );
}

/* ─── Card wrappers ─── */
function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
function Empty({ msg = '—' }) {
  return <div className="flex items-center justify-center h-[200px] text-white/15 text-sm">{msg}</div>;
}

/* ─── Stat card ─── */
function KPI({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-white/40">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-1">{sub}</p>}
      <div className="absolute bottom-0 inset-x-0 h-[2px] rounded-b-2xl" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
    </div>
  );
}

/* ─── Horizontal ranked bars ─── */
function RankBar({ items, colorFn }) {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60 truncate max-w-[60%]">{item.name}</span>
            <span className="text-xs font-bold" style={{ color: colorFn(i) }}>{item.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.count / max) * 100}%`, background: colorFn(i) }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut chart with center label ─── */
function DonutChart({ data, total, totalLabel = 'Total' }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={68} outerRadius={95}
            paddingAngle={3} dataKey="value" stroke="none">
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip content={<Tip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-white">{total}</span>
        <span className="text-[10px] text-white/30 mt-0.5">{totalLabel}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function ReportsPage() {
  const { t, isRTL } = useLanguage();

  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobApplications'), snap => setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  /* marker changes when translations update (translations updates async after lang) */
  const _tmarker = t('admin.statusNew');

  /* ── derived data ── */
  const data = useMemo(() => {
    if (!jobs) return null;

    /* Job status donut */
    const jobStatusData = Object.entries(JOB_STATUS_TKEYS).map(([k, tk]) => ({
      name: t(tk), value: jobs.filter(j => j.status === k).length, color: JOB_STATUS_COLORS[k],
    })).filter(d => d.value > 0);

    /* Jobs monthly */
    const allMonths = [...new Set(jobs.map(j => toMonthKey(j.createdAt)).filter(Boolean))]
      .sort((a, b) => toMonthSort(a) - toMonthSort(b));
    const monthlyJobs = allMonths.map(month => ({
      month, count: jobs.filter(j => toMonthKey(j.createdAt) === month).length,
    }));

    /* Job positions */
    const posMap = {};
    jobs.forEach(j => { if (j.position) posMap[j.position] = (posMap[j.position] ?? 0) + 1; });
    const positionData = Object.entries(posMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    /* Job experience */
    const expData = EXP_ORDER.map((label) => ({
      name: label, count: jobs.filter(j => j.experience === label).length,
    })).filter(d => d.count > 0);

    /* Job city */
    const jobCityMap = {};
    jobs.forEach(j => { if (j.city) jobCityMap[j.city] = (jobCityMap[j.city] ?? 0) + 1; });
    const jobCityData = Object.entries(jobCityMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return { jobStatusData, monthlyJobs, positionData, expData, jobCityData };
  }, [jobs, _tmarker]);

  if (!data) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="text-[#F2B233] animate-spin" />
        </div>
      </AdminPageLayout>
    );
  }

  const J = jobs;
  const interviewJ = J.filter(j => j.status === 'interview_scheduled').length;

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Header ── */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white">{t('admin.reportsTitle')}</h1>
          <p className="text-sm text-white/35 mt-1">
            {J.length} {t('admin.totalJobsKPI')}
          </p>
        </div>

        <div className="space-y-5">
          {/* Jobs KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label={t('admin.totalJobsKPI')}         value={J.length}                                    icon={Briefcase}   color={BLUE}   bg={`${BLUE}18`}   />
            <KPI label={t('admin.new')}                  value={J.filter(j=>j.status==='pending').length}    icon={TrendingUp}  color={GOLD}   bg={`${GOLD}18`}   />
            <KPI label={t('admin.scheduledInterviews')}  value={interviewJ}                                  icon={Calendar}    color={AMBER}  bg={`${AMBER}18`}  />
            <KPI label={t('admin.rejected')}             value={J.filter(j=>j.status==='rejected').length}   icon={XCircle}     color={RED}    bg={`${RED}18`}    />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Monthly jobs */}
            <ChartCard title={t('admin.monthlyJobTitle')} subtitle={t('admin.jobsPerMonthSub')}>
              {data.monthlyJobs.length === 0 ? <Empty /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.monthlyJobs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradJ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={BLUE} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={BLUE} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<Tip />} />
                    <Area type="monotone" dataKey="count" stroke={BLUE} strokeWidth={2.5} fill="url(#gradJ)" dot={false} activeDot={{ r: 5, fill: BLUE }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Job status donut */}
            <ChartCard title={t('admin.statusDistTitle')}>
              {data.jobStatusData.length === 0 ? <Empty msg={t('admin.reportNoData')} /> : (
                <>
                  <DonutChart data={data.jobStatusData} total={J.length} totalLabel={t('admin.totalScoreLabel')} />
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                    {data.jobStatusData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-[11px] text-white/50">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* Experience levels bar */}
          {data.expData.length > 0 && (
            <ChartCard title={t('admin.expDistTitle')} subtitle={t('admin.expByApplicantSub')}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.expData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.expData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Positions + Cities rank bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title={t('admin.topPositionsTitle')} subtitle={t('admin.positionsByApplicantSub')}>
              {data.positionData.length === 0 ? <Empty msg={t('admin.reportNoData')} /> : (
                <RankBar items={data.positionData} colorFn={i => CHART_COLORS[i % CHART_COLORS.length]} />
              )}
            </ChartCard>

            <ChartCard title={t('admin.applicantsCitiesTitle')} subtitle={t('admin.citiesByApplicantSub')}>
              {data.jobCityData.length === 0 ? <Empty msg={t('admin.reportNoData')} /> : (
                <RankBar items={data.jobCityData} colorFn={i => CHART_COLORS[(i + 3) % CHART_COLORS.length]} />
              )}
            </ChartCard>
          </div>
        </div>

      </div>
    </AdminPageLayout>
  );
}
