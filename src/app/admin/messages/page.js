'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  collection, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Trash2, Loader2, Eye, MessageSquare,
  ChevronDown, Clock, XCircle,
} from 'lucide-react';

/* ── Status system ── */
const STATUS_CONFIG = {
  new:          { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  under_review: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  replied:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  closed:       { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};
const STATUS_LABEL_KEYS = {
  new:          'admin.messages.statusNew',
  under_review: 'admin.messages.statusUnderReview',
  replied:      'admin.messages.statusReplied',
  closed:       'admin.messages.statusClosed',
};
const STATUS_KEYS = ['all', 'new', 'under_review', 'replied', 'closed'];

const SUBJECT_LABEL_KEYS = {
  construction: 'admin.messages.subjectConstruction',
  architecture: 'admin.messages.subjectArchitecture',
  management:   'admin.messages.subjectManagement',
  other:        'activities.other',
};

function StatusChip({ status }) {
  const { t } = useLanguage();
  const cfg      = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const labelKey = STATUS_LABEL_KEYS[status];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
      {labelKey ? t(labelKey) : status}
    </span>
  );
}

/* ── Main page ── */
export default function MessagesPage() {
  const { lang, isRTL, t } = useLanguage();
  const { confirm } = useConfirm();
  const router = useRouter();

  const [messages, setMessages]     = useState([]);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState(null);

  /* Real-time listener */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'contacts'), snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setMessages(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* Current time for the date filters — refreshed periodically via a timer
     callback rather than calling Date.now() directly during render. */
  const [now, setNow] = useState(0);
  useEffect(() => {
    const update = () => setNow(Date.now());
    queueMicrotask(update);
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, []);

  /* Filtered list */
  const visible = useMemo(() => {
    const dayMs  = 86400000;
    const weekMs = 7 * dayMs;
    const monMs  = 30 * dayMs;

    return messages.filter(m => {
      if (filter !== 'all' && (m.status || 'new') !== filter) return false;
      if (dateFilter !== 'all') {
        const ms = (m.createdAt?.seconds ?? 0) * 1000;
        if (dateFilter === 'today' && now - ms > dayMs)  return false;
        if (dateFilter === 'week'  && now - ms > weekMs) return false;
        if (dateFilter === 'month' && now - ms > monMs)  return false;
      }
      const q = search.toLowerCase();
      if (q) {
        const name  = (m.fullName || m.name || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        const phone = (m.phone || '');
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q)) return false;
      }
      return true;
    });
  }, [messages, filter, search, dateFilter, now]);

  /* Stats */
  const counts = useMemo(() => {
    const c = { total: messages.length, new: 0, under_review: 0, replied: 0, closed: 0 };
    messages.forEach(m => {
      const s = m.status || 'new';
      if (c[s] !== undefined) c[s]++;
    });
    return c;
  }, [messages]);

  /* Actions */
  const updateStatus = async (id, status) => {
    setActionId(id + status);
    await updateDoc(doc(db, 'contacts', id), { status, updatedAt: serverTimestamp() });
    setActionId(null);
  };

  const deleteMsg = async (id) => {
    if (!(await confirm(t('admin.messages.deleteConfirm'), { variant: 'danger' }))) return;
    await deleteDoc(doc(db, 'contacts', id));
  };

  const fmt = ts => ts?.seconds ? new Date(ts.seconds * 1000).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB') : '—';
  const subjectLabel = s => (SUBJECT_LABEL_KEYS[s] ? t(SUBJECT_LABEL_KEYS[s]) : (s || '—'));

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#F2B233]/10 border border-[#F2B233]/20 flex items-center justify-center">
            <MessageSquare size={16} className="text-[#F2B233]" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('admin.messagesMenu')}</h1>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: t('admin.messages.totalMessages'),   value: counts.total,   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
            { label: t('admin.messages.newMessages'),     value: counts.new,     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
            { label: t('admin.messages.statusReplied'),   value: counts.replied, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
            { label: t('admin.messages.statusClosed'),    value: counts.closed,  color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 text-center">
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-white/35 text-[11px] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.messages.searchPlaceholder')}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#F2B233]/40`}
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap items-center">
            {STATUS_KEYS.map(s => {
              const labelKey = s === 'all' ? 'admin.allStatuses' : STATUS_LABEL_KEYS[s];
              const label = labelKey ? t(labelKey) : s;
              return (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filter === s
                      ? 'bg-[#F2B233]/15 text-[#F2B233] border border-[#F2B233]/30'
                      : 'text-white/40 border border-white/8 hover:text-white/70'
                  }`}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Date filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className={`bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRTL ? 'pr-3 pl-9' : 'pl-3 pr-9'} text-white text-xs focus:outline-none focus:border-[#F2B233]/40 appearance-none cursor-pointer`}
            >
              <option value="all"   className="bg-black">{t('admin.messages.allTime')}</option>
              <option value="today" className="bg-black">{t('admin.messages.today')}</option>
              <option value="week"  className="bg-black">{t('admin.messages.thisWeek')}</option>
              <option value="month" className="bg-black">{t('admin.messages.thisMonth')}</option>
            </select>
            <ChevronDown size={12} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={28} className="text-[#F2B233] animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24 text-white/25 text-sm">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
            {t('admin.messages.noMessagesFound')}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {[
                      t('admin.messages.nameEmailCol'),
                      t('admin.phoneCol'),
                      t('admin.messages.subjectCol'),
                      t('admin.dateLabel'),
                      t('admin.statusCol'),
                      t('admin.actionsCol'),
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-white/35 font-semibold text-xs text-start">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {visible.map(msg => (
                    <tr key={msg.id} onClick={() => router.push(`/admin/messages/${msg.id}`)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                      {/* Name + Email */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-white">{msg.fullName || msg.name || '—'}</p>
                        <p className="text-white/35 text-xs mt-0.5">{msg.email || '—'}</p>
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-3.5 text-white/50 text-xs">{msg.phone || '—'}</td>
                      {/* Subject */}
                      <td className="px-4 py-3.5 text-white/75 text-xs max-w-[130px] truncate">
                        {subjectLabel(msg.subject)}
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3.5 text-white/35 text-xs" dir="ltr">{fmt(msg.createdAt)}</td>
                      {/* Status */}
                      <td className="px-4 py-3.5"><StatusChip status={msg.status || 'new'} /></td>
                      {/* Actions */}
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/messages/${msg.id}`}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all"
                            title={t('admin.viewDetails')}>
                            <Eye size={14} />
                          </Link>
                          {(msg.status || 'new') !== 'under_review' && (msg.status || 'new') !== 'replied' && (msg.status || 'new') !== 'closed' && (
                            <button onClick={() => updateStatus(msg.id, 'under_review')}
                              className="p-1.5 rounded-lg text-white/30 hover:text-amber-400 hover:bg-amber-500/8 transition-all"
                              title={t('admin.underReviewAction')}>
                              {actionId === msg.id + 'under_review'
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Clock size={14} />}
                            </button>
                          )}
                          {(msg.status || 'new') !== 'closed' && (
                            <button onClick={() => updateStatus(msg.id, 'closed')}
                              className="p-1.5 rounded-lg text-white/30 hover:text-gray-400 hover:bg-gray-500/8 transition-all"
                              title={t('admin.messages.closeAction')}>
                              {actionId === msg.id + 'closed'
                                ? <Loader2 size={14} className="animate-spin" />
                                : <XCircle size={14} />}
                            </button>
                          )}
                          <button onClick={() => deleteMsg(msg.id)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/8 transition-all"
                            title={t('admin.delete')}>
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
