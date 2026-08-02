'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import Link from 'next/link';
import {
  Search, Trash2, XCircle, Loader2,
  FileText, Eye, Sparkles,
  Star, CalendarCheck,
} from 'lucide-react';

/* ─── Status config ─── */
const STATUS_CONFIG = {
  pending:             { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  labelKey: 'admin.statusPending' },
  interview_scheduled: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', labelKey: 'admin.statusInterviewScheduled' },
  rejected:            { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  labelKey: 'admin.statusRejected' },
};
const STATUS_FILTERS = ['all', 'pending', 'interview_scheduled', 'rejected'];

function StatusChip({ status, t }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
      {t(cfg.labelKey)}
    </span>
  );
}

/* ─── Smart Agent scoring ─── */
const CLOSE_CITIES  = ['جدة','jeddah','مكة','mecca','الطائف','taif','رابغ','rabigh','ينبع','yanbu','القنفذة'];
const MEDIUM_CITIES = ['الرياض','riyadh','المدينة','medina','الدمام','dammam','الخبر','khobar','أبها','abha'];

const EXP_SCORES = {
  'أقل من سنة':       5,  'Less than 1 year': 5,
  '1 – 3 سنوات':     15,  '1 – 3 years':      15,
  '3 – 5 سنوات':     35,  '3 – 5 years':      35,
  '5 – 10 سنوات':    55,  '5 – 10 years':     55,
  'أكثر من 10 سنوات':75,  'More than 10 years':75,
};

function scoreApp(app) {
  const expScore  = EXP_SCORES[app.experience] ?? 0;
  const cityLower = (app.city || '').toLowerCase();
  const cityScore = CLOSE_CITIES.some(c  => cityLower.includes(c.toLowerCase())) ? 50
                  : MEDIUM_CITIES.some(c => cityLower.includes(c.toLowerCase())) ? 25
                  : cityLower.length > 1 ? 5 : 0;
  return { expScore, cityScore, total: expScore + cityScore };
}

/* ─── Main page ─── */
export default function JobsPage() {
  const { t, isRTL } = useLanguage();
  const { confirm } = useConfirm();
  const [apps, setApps]         = useState([]);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState(null);
  const [agentOn, setAgentOn]   = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobApplications'), snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setApps(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const { visible, bestIds } = useMemo(() => {
    let list = apps.filter(a => {
      const matchStatus = filter === 'all' || a.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        a.fullName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.position?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.phone?.includes(q);
      return matchStatus && matchSearch;
    });

    if (!agentOn) return { visible: list, bestIds: new Set() };

    const scored   = list.map(a => ({ id: a.id, total: scoreApp(a).total }));
    const maxTotal = scored.reduce((m, s) => Math.max(m, s.total), 0);
    const bestIds  = new Set(
      maxTotal > 0 ? scored.filter(s => s.total === maxTotal).map(s => s.id) : []
    );
    const sorted = [...list].sort((a, b) => scoreApp(b).total - scoreApp(a).total);
    return { visible: sorted, bestIds };
  }, [apps, filter, search, agentOn]);

  const rejectApp = async (id) => {
    if (!(await confirm(t('admin.rejectJobConfirm'), { variant: 'warning' }))) return;
    setActionId(id + 'reject');
    await updateDoc(doc(db, 'jobApplications', id), { status: 'rejected', reviewedAt: new Date() });
    setActionId(null);
  };

  const deleteApp = async (id) => {
    if (!(await confirm(t('admin.deleteJobConfirm'), { variant: 'danger' }))) return;
    await deleteDoc(doc(db, 'jobApplications', id));
  };

  /* stats */
  const totalPending  = apps.filter(a => a.status === 'pending').length;
  const totalAccepted = apps.filter(a => a.status === 'interview_scheduled').length;
  const bestMatches   = bestIds.size;

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-white">{t('admin.jobsTitle')}</h1>
          <Link href="/admin/jobs/approved"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a96e]/10 border border-[#c8a96e]/25 text-[#c8a96e] text-xs font-bold hover:bg-[#c8a96e]/18 transition-all">
            <CalendarCheck size={14} />
            {t('admin.acceptedCount')} ({totalAccepted})
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 text-center">
            <p className="text-2xl font-black" style={{ color: '#3b82f6' }}>{totalPending}</p>
            <p className="text-white/35 text-[11px] mt-1">{t('admin.newApps')}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 text-center">
            <p className="text-2xl font-black" style={{ color: '#f59e0b' }}>{totalAccepted}</p>
            <p className="text-white/35 text-[11px] mt-1">{t('admin.acceptedCount')}</p>
          </div>
          <Link href="/admin/jobs/best"
            className="bg-white/[0.02] border border-[#c8a96e]/25 rounded-xl p-4 text-center hover:bg-[#c8a96e]/8 hover:border-[#c8a96e]/45 transition-all group">
            <p className="text-2xl font-black" style={{ color: '#c8a96e' }}>{bestMatches || apps.length}</p>
            <p className="text-white/35 text-[11px] mt-1 flex items-center justify-center gap-1 group-hover:text-[#c8a96e]/70 transition-colors">
              <Star size={11} className="text-[#c8a96e]" /> {t('admin.bestMatchLabel')}
            </p>
          </Link>
        </div>

        {/* Filters + Agent toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.searchJobsPlaceholder')}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8a96e]/40`} />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-[#c8a96e]/15 text-[#c8a96e] border border-[#c8a96e]/30' : 'text-white/40 border border-white/8 hover:text-white/70'}`}>
                {s === 'all' ? t('admin.allStatuses') : t(STATUS_CONFIG[s]?.labelKey || s)}
              </button>
            ))}
            {/* Smart Agent toggle */}
            <button onClick={() => setAgentOn(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${agentOn ? 'bg-purple-500/15 text-purple-300 border-purple-500/35' : 'text-white/40 border-white/8 hover:text-purple-300/70'}`}>
              <Sparkles size={12} />
              {agentOn ? t('admin.agentOnLabel') : t('admin.agentOffLabel')}
            </button>
          </div>
        </div>

        {/* Agent info banner */}
        {agentOn && (
          <div className="flex items-start gap-3 bg-purple-500/8 border border-purple-500/20 rounded-xl px-4 py-3 mb-4">
            <Sparkles size={14} className="text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-purple-300 text-xs font-bold mb-0.5">{t('admin.agentEnabled')}</p>
              <p className="text-white/40 text-xs leading-relaxed">{t('admin.agentJobsBannerDesc')}</p>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={28} className="text-[#c8a96e] animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24 text-white/25 text-sm">{t('admin.noJobs')}</div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {[t('admin.applicantName'), t('admin.positionApplied'), t('admin.experienceYears'), t('admin.cityColLabel'), t('admin.submittedCol'), t('admin.statusCol'), t('admin.actionsCol')].map(h => (
                      <th key={h} className="px-4 py-3 text-white/35 font-semibold text-xs text-start">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {visible.map(app => (
                    <tr key={app.id} className={`hover:bg-white/[0.02] transition-colors ${agentOn && bestIds.has(app.id) ? 'bg-purple-500/[0.03]' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {agentOn && bestIds.has(app.id) && (
                            <span className="text-[10px] font-black text-purple-300 bg-purple-500/15 border border-purple-500/25 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shrink-0">
                              <Star size={8} className="fill-purple-300" /> {t('admin.bestBadge')}
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-white">{app.fullName}</p>
                            <p className="text-white/35 text-xs mt-0.5">{app.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-white/75 text-xs max-w-[140px] truncate">{app.position}</td>
                      <td className="px-4 py-3.5 text-white/50 text-xs">{app.experience || '—'}</td>
                      <td className="px-4 py-3.5 text-white/50 text-xs">{app.city || '—'}</td>
                      <td className="px-4 py-3.5 text-white/35 text-xs" dir="ltr">
                        {app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-4 py-3.5"><StatusChip status={app.status} t={t} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {/* View — links to detail page */}
                          <Link href={`/admin/jobs/${app.id}`}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all" title={t('admin.viewDetails')}>
                            <Eye size={14} />
                          </Link>
                          {/* CV */}
                          {app.cvUrl && (
                            <a href={app.cvUrl} target="_blank" rel="noreferrer"
                              className="p-1.5 rounded-lg text-white/30 hover:text-[#c8a96e] hover:bg-[#c8a96e]/8 transition-all" title={t('admin.viewCV')}>
                              <FileText size={14} />
                            </a>
                          )}
                          {/* Reject */}
                          {app.status !== 'rejected' && (
                            <button onClick={() => rejectApp(app.id)}
                              className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/8 transition-all" title={t('admin.reject')}>
                              {actionId === app.id + 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                            </button>
                          )}
                          {/* Delete */}
                          <button onClick={() => deleteApp(app.id)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/8 transition-all" title={t('admin.delete')}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
