'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import {
  Users, CheckCircle, XCircle, TrendingUp,
  Briefcase, ArrowLeft, ArrowRight, CalendarCheck,
  MessageSquare,
} from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import Link from 'next/link';

const JOB_STATUS_COLORS = {
  pending:             '#3b82f6',
  interview_scheduled: '#f59e0b',
  rejected:            '#ef4444',
};

function StatCard({ label, value, icon: Icon, color, bg, href }) {
  const inner = (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.13] transition-all">
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

export default function DashboardPage() {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [jobCounts, setJobCounts]             = useState({ total: 0, pending: 0, interview_scheduled: 0, rejected: 0 });
  const [msgCounts, setMsgCounts]             = useState({ total: 0, new: 0, replied: 0, closed: 0 });
  const [recentJobs, setRecentJobs]           = useState([]);
  const [recentMessages, setRecentMessages]   = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobApplications'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const c = { total: docs.length, pending: 0, interview_scheduled: 0, rejected: 0 };
      docs.forEach(d => { if (c[d.status] !== undefined) c[d.status]++; });
      setJobCounts(c);
      setRecentJobs(
        [...docs].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)).slice(0, 6)
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'contacts'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const c = { total: docs.length, new: 0, replied: 0, closed: 0 };
      docs.forEach(d => {
        const s = d.status || 'new';
        if (c[s] !== undefined) c[s]++;
      });
      setMsgCounts(c);
      setRecentMessages(
        [...docs].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)).slice(0, 5)
      );
    });
    return unsub;
  }, []);

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* ── Jobs Stats ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} className="text-[#F2B233]" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('admin.jobsStats')}</span>
            <Link href="/admin/jobs" className="ms-auto text-xs text-[#F2B233] hover:underline flex items-center gap-1">
              {t('admin.viewAll')} <ArrowIcon size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label={t('admin.totalApps')}           value={jobCounts.total}               icon={Users}         color="#a78bfa" bg="rgba(167,139,250,0.12)" href="/admin/jobs" />
            <StatCard label={t('admin.newApps')}             value={jobCounts.pending}             icon={TrendingUp}    color="#3b82f6" bg="rgba(59,130,246,0.12)"  href="/admin/jobs" />
            <StatCard label={t('admin.scheduledInterviews')} value={jobCounts.interview_scheduled} icon={CalendarCheck} color="#f59e0b" bg="rgba(245,158,11,0.12)"  href="/admin/jobs/approved" />
            <StatCard label={t('admin.rejectedLabel')}       value={jobCounts.rejected}            icon={XCircle}       color="#ef4444" bg="rgba(239,68,68,0.12)"   href="/admin/jobs" />
          </div>
        </div>

        {/* ── Messages Stats ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-green-400" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('admin.messagesMenu')}</span>
            <Link href="/admin/messages" className="ms-auto text-xs text-[#F2B233] hover:underline flex items-center gap-1">
              {t('admin.viewAll')} <ArrowIcon size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t('admin.messages.totalMessages')} value={msgCounts.total}   icon={MessageSquare} color="#a78bfa" bg="rgba(167,139,250,0.12)" href="/admin/messages" />
            <StatCard label={t('admin.messages.newMessages')}    value={msgCounts.new}     icon={TrendingUp}    color="#3b82f6" bg="rgba(59,130,246,0.12)"  href="/admin/messages" />
            <StatCard label={t('admin.messages.statusReplied')}  value={msgCounts.replied} icon={CheckCircle}   color="#10b981" bg="rgba(16,185,129,0.12)"  href="/admin/messages" />
            <StatCard label={t('admin.messages.statusClosed')}   value={msgCounts.closed}  icon={XCircle}       color="#6b7280" bg="rgba(107,114,128,0.12)" href="/admin/messages" />
          </div>
        </div>

        {/* ── Recent records — two columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Jobs */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F2B233]/12 border border-[#F2B233]/20 flex items-center justify-center">
                  <Briefcase size={13} className="text-[#F2B233]" />
                </div>
                <h2 className="text-sm font-semibold text-white">{t('admin.latestJobs')}</h2>
              </div>
              <Link href="/admin/jobs" className="flex items-center gap-1 text-xs text-[#F2B233] hover:underline">
                {t('admin.viewAll')} <ArrowIcon size={11} />
              </Link>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {recentJobs.length === 0 ? (
                <p className="text-center text-white/25 text-sm py-8">{t('admin.noJobs')}</p>
              ) : recentJobs.map(j => {
                const jobColor = JOB_STATUS_COLORS[j.status] || JOB_STATUS_COLORS.pending;
                const jobLabel = j.status === 'interview_scheduled' ? t('admin.statusInterviewBadge')
                               : j.status === 'rejected'            ? t('admin.statusRejectedBadge')
                               :                                      t('admin.statusPendingBadge');
                return (
                  <Link
                    key={j.id}
                    href="/admin/jobs"
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium truncate group-hover:text-[#F2B233] transition-colors">{j.fullName}</p>
                      <p className="text-xs text-white/30 mt-0.5 truncate">{j.position || '—'}{j.city ? ` · ${j.city}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ms-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ color: jobColor, background: `${jobColor}18`, border: `1px solid ${jobColor}30` }}>
                        {jobLabel}
                      </span>
                      <span className="text-[10px] text-white/20 hidden sm:block" dir="ltr">
                        {j.createdAt?.seconds ? new Date(j.createdAt.seconds * 1000).toLocaleDateString('en-GB') : ''}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-500/12 border border-green-500/20 flex items-center justify-center">
                  <MessageSquare size={13} className="text-green-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">{t('admin.latestMessages')}</h2>
              </div>
              <Link href="/admin/messages" className="flex items-center gap-1 text-xs text-[#F2B233] hover:underline">
                {t('admin.viewAll')} <ArrowIcon size={11} />
              </Link>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {recentMessages.length === 0 ? (
                <p className="text-center text-white/25 text-sm py-8">{t('admin.messages.noMessagesFound')}</p>
              ) : recentMessages.map(m => {
                const status = m.status || 'new';
                const msgColor = status === 'replied' ? '#10b981'
                               : status === 'closed'  ? '#6b7280'
                               : status === 'under_review' ? '#f59e0b'
                               : '#3b82f6';
                const msgLabel = status === 'replied'      ? t('admin.messages.statusReplied')
                               : status === 'closed'       ? t('admin.messages.statusClosed')
                               : status === 'under_review' ? t('admin.messages.statusUnderReview')
                               : t('admin.messages.statusNew');
                return (
                  <Link
                    key={m.id}
                    href="/admin/messages"
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium truncate group-hover:text-[#F2B233] transition-colors">
                        {m.fullName || m.name || '—'}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5 truncate">{m.email || m.phone || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ms-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ color: msgColor, background: `${msgColor}18`, border: `1px solid ${msgColor}30` }}>
                        {msgLabel}
                      </span>
                      <span className="text-[10px] text-white/20 hidden sm:block" dir="ltr">
                        {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleDateString('en-GB') : ''}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </AdminPageLayout>
  );
}
