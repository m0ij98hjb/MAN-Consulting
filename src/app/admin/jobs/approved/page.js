'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, Search, Loader2, CalendarCheck,
  Mail, Phone, MapPin, Clock, Briefcase, FileText, Download,
  Calendar, User,
} from 'lucide-react';

const TYPE_LABEL_KEYS = { in_person: 'admin.inPerson', video: 'admin.videoCall', phone: 'admin.phoneCall' };

export default function ApprovedJobsPage() {
  const { t, isRTL } = useLanguage();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobApplications'), snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.status === 'interview_scheduled')
        .sort((a, b) => (b.reviewedAt?.seconds ?? b.reviewedAt?.getTime?.() / 1000 ?? 0)
                      - (a.reviewedAt?.seconds ?? a.reviewedAt?.getTime?.() / 1000 ?? 0));
      setApps(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const visible = apps.filter(a => {
    const q = search.toLowerCase();
    return !q ||
      a.fullName?.toLowerCase().includes(q) ||
      a.position?.toLowerCase().includes(q) ||
      a.city?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q);
  });

  const formatDate = (val) => {
    if (!val) return '—';
    if (val?.seconds) return new Date(val.seconds * 1000).toLocaleDateString('ar-SA');
    if (val instanceof Date) return val.toLocaleDateString('ar-SA');
    return String(val);
  };

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/jobs"
            className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
            <BackIcon size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CalendarCheck size={22} className="text-[#c8a96e]" />
              {t('admin.approvedApplicantsTitle')}
            </h1>
            <p className="text-white/35 text-xs mt-0.5">{t('admin.approvedApplicantsSubtitle')}</p>
          </div>
        </div>

        {/* Search + count */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.searchApprovedPlaceholder')}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8a96e]/40`} />
          </div>
          <div className="px-3 py-2 bg-[#c8a96e]/10 border border-[#c8a96e]/20 rounded-xl text-[#c8a96e] text-xs font-bold">
            {apps.length} {t('admin.acceptedCount')}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={28} className="text-[#c8a96e] animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24">
            <CalendarCheck size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/25 text-sm">{t('admin.noApprovedApplicantsYet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(app => (
              <div key={app.id}
                onClick={() => setSelected(app)}
                className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 cursor-pointer hover:border-[#c8a96e]/25 hover:bg-white/[0.035] transition-all group">

                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#c8a96e]/12 border border-[#c8a96e]/25 flex items-center justify-center shrink-0">
                      <span className="text-[#c8a96e] font-black text-sm">{app.fullName?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{app.fullName}</p>
                      <p className="text-white/40 text-[11px] mt-0.5">{app.position}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-full px-2 py-0.5 shrink-0">
                    {t('admin.statusInterviewBadge')}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {[
                    { icon: <Mail size={11} />,   val: app.email },
                    { icon: <Phone size={11} />,  val: app.phone },
                    { icon: <MapPin size={11} />, val: app.city || '—' },
                    { icon: <Clock size={11} />,  val: app.experience || '—' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/45">
                      <span className="text-[#c8a96e]/70 shrink-0">{row.icon}</span>
                      <span className="truncate">{row.val}</span>
                    </div>
                  ))}
                </div>

                {/* Interview details */}
                {app.interviewDetails && (
                  <div className="bg-[#c8a96e]/6 border border-[#c8a96e]/15 rounded-xl p-3 space-y-1.5">
                    <p className="text-[#c8a96e] text-[10px] font-black uppercase tracking-wider mb-2">{t('admin.interviewDetailsTitle')}</p>
                    <div className="flex items-center gap-2 text-[11px] text-white/55">
                      <Calendar size={10} className="text-[#c8a96e]/60" />
                      {app.interviewDetails.interviewDate} — {app.interviewDetails.interviewTime}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/55">
                      <Briefcase size={10} className="text-[#c8a96e]/60" />
                      {TYPE_LABEL_KEYS[app.interviewDetails.interviewType] ? t(TYPE_LABEL_KEYS[app.interviewDetails.interviewType]) : app.interviewDetails.interviewType}
                    </div>
                    {app.interviewDetails.interviewLocation && (
                      <div className="flex items-center gap-2 text-[11px] text-white/55">
                        <MapPin size={10} className="text-[#c8a96e]/60" />
                        {app.interviewDetails.interviewLocation}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-white/20 text-[10px] mt-3 text-end group-hover:text-white/40 transition-colors">{t('admin.clickForFullDetails')} {isRTL ? '←' : '→'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Detail modal ─── */}
      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg bg-[#111118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-[#0d0d14]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c8a96e]/12 border border-[#c8a96e]/25 flex items-center justify-center">
                  <span className="text-[#c8a96e] font-black text-sm">{selected.fullName?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm">{selected.fullName}</h2>
                  <p className="text-white/40 text-xs">{selected.position}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all">
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Personal info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t('admin.emailLabel'),      val: selected.email },
                  { label: t('admin.phoneCol'),        val: selected.phone },
                  { label: t('admin.cityColLabel'),    val: selected.city || '—' },
                  { label: t('admin.experienceYears'), val: selected.experience || '—' },
                ].map(row => (
                  <div key={row.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] mb-1">{row.label}</p>
                    <p className="text-white text-xs font-semibold">{row.val}</p>
                  </div>
                ))}
              </div>

              {/* Interview card */}
              {selected.interviewDetails && (
                <div className="bg-[#c8a96e]/8 border border-[#c8a96e]/20 rounded-xl p-4">
                  <p className="text-[#c8a96e] text-[10px] font-black uppercase tracking-widest mb-3">{t('admin.interviewDetailsTitle')}</p>
                  <div className="space-y-2">
                    {[
                      { label: t('admin.dateLabel'), val: selected.interviewDetails.interviewDate },
                      { label: t('admin.timeLabel'), val: selected.interviewDetails.interviewTime },
                      { label: t('admin.interviewTypeLabel'), val: TYPE_LABEL_KEYS[selected.interviewDetails.interviewType] ? t(TYPE_LABEL_KEYS[selected.interviewDetails.interviewType]) : selected.interviewDetails.interviewType },
                      selected.interviewDetails.interviewLocation && { label: t('admin.interviewLocation'), val: selected.interviewDetails.interviewLocation },
                    ].filter(Boolean).map(row => (
                      <div key={row.label} className="flex items-center justify-between text-xs">
                        <span className="text-white/35">{row.label}</span>
                        <span className="text-white font-semibold">{row.val}</span>
                      </div>
                    ))}
                    {selected.interviewDetails.additionalMessage && (
                      <div className="pt-2 border-t border-white/[0.06] mt-2">
                        <p className="text-white/30 text-[10px] mb-1">{t('admin.additionalMessage')}</p>
                        <p className="text-white/65 text-xs leading-relaxed">{selected.interviewDetails.additionalMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cover letter */}
              {selected.coverLetter && (
                <div>
                  <p className="text-[#c8a96e] text-[10px] font-black uppercase tracking-widest mb-2">{t('admin.coverLetterAdmin')}</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap">{selected.coverLetter}</p>
                  </div>
                </div>
              )}

              {/* CV */}
              {selected.cvUrl && (
                <a href={selected.cvUrl} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#c8a96e]/10 border border-[#c8a96e]/25 text-[#c8a96e] text-sm font-bold hover:bg-[#c8a96e]/18 transition-all">
                  <Download size={15} />
                  {t('admin.downloadCV')}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
