'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import {
  ArrowLeft, ArrowRight, XCircle, CheckCircle, Loader2,
  User, Phone, Mail, MapPin, Calendar,
  Briefcase, FileText, Clock, Download, Building2,
  CalendarCheck, Sparkles, Send, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

/* ─── Smart Agent scoring (mirrors jobs/page.js) ─── */
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

/* ─── Status config ─── */
const STATUS_CONFIG = {
  pending:             { color: '#3b82f6', labelKey: 'admin.statusPending' },
  accepted:            { color: '#22c55e', labelKey: 'admin.statusAccepted' },
  interview_scheduled: { color: '#f59e0b', labelKey: 'admin.statusInterviewScheduled' },
  rejected:            { color: '#ef4444', labelKey: 'admin.statusRejected' },
};

export default function JobDetailPage() {
  const { id }       = useParams();
  const router       = useRouter();
  const { t, isRTL, lang } = useLanguage();
  const { confirm } = useConfirm();

  const [app, setApp]         = useState(null);
  const [actioning, setActioning] = useState('');

  /* Interview form state */
  const [showInterviewForm, setShowInterviewForm]       = useState(false);
  const [interviewDate, setInterviewDate]               = useState('');
  const [interviewTime, setInterviewTime]               = useState('');
  const [interviewType, setInterviewType]               = useState('in_person');
  const [interviewLocation, setInterviewLocation]       = useState('');
  const [additionalMessage, setAdditionalMessage]       = useState('');
  const [sending, setSending]                           = useState(false);
  const [sendStatus, setSendStatus]                     = useState('');
  const [sendError, setSendError]                       = useState('');

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'jobApplications', id), snap => {
      if (snap.exists()) {
        setApp({ id: snap.id, ...snap.data() });
      }
    });
    return unsub;
  }, [id]);

  const acceptApp = async () => {
    setActioning('accept');
    await updateDoc(doc(db, 'jobApplications', id), { status: 'accepted', reviewedAt: new Date() });
    setActioning('');
  };

  const rejectApp = async () => {
    if (!(await confirm(t('admin.rejectJobConfirm'), { variant: 'warning' }))) return;
    setActioning('reject');
    await updateDoc(doc(db, 'jobApplications', id), { status: 'rejected', reviewedAt: new Date() });
    setActioning('');
  };

  const handleSendInterview = async () => {
    if (!interviewDate || !interviewTime) return;
    setSending(true); setSendStatus(''); setSendError('');
    try {
      const res = await fetch('/api/send-interview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: app.fullName,
          applicantEmail: app.email,
          position: app.position,
          interviewDate,
          interviewTime,
          interviewType,
          interviewLocation,
          additionalMessage,
          lang,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || data.code || 'Unknown error');
      await updateDoc(doc(db, 'jobApplications', id), {
        status: 'interview_scheduled',
        reviewedAt: new Date(),
        interviewDetails: { interviewDate, interviewTime, interviewType, interviewLocation, additionalMessage, sentAt: new Date() },
      });
      setSendStatus('success');
    } catch (err) {
      setSendStatus('error');
      setSendError(err.message || 'Unknown error');
    } finally {
      setSending(false);
    }
  };

  const closeSuccessDialog = () => {
    setSendStatus('');
    setShowInterviewForm(false);
    setInterviewDate(''); setInterviewTime('');
    setInterviewType('in_person'); setInterviewLocation('');
    setAdditionalMessage('');
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (!app) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="text-[#c8a96e] animate-spin" />
        </div>
      </AdminPageLayout>
    );
  }

  const submittedDate = app.createdAt?.seconds
    ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  const sc = scoreApp(app);

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href="/admin/jobs" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <BackIcon size={16} /> {t('admin.back')}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{app.fullName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                style={{
                  color: STATUS_CONFIG[app.status]?.color ?? '#3b82f6',
                  background: `${STATUS_CONFIG[app.status]?.color ?? '#3b82f6'}1a`,
                  border: `1px solid ${STATUS_CONFIG[app.status]?.color ?? '#3b82f6'}30`,
                }}
              >
                {t(STATUS_CONFIG[app.status]?.labelKey ?? 'admin.statusPending')}
              </span>
              <span className="text-xs text-white/30" dir="ltr">{submittedDate}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {app.status !== 'accepted' && app.status !== 'interview_scheduled' && app.status !== 'rejected' && (
              <button
                onClick={acceptApp}
                disabled={actioning === 'accept'}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 text-green-400 border-green-500/20 hover:bg-green-500/10"
              >
                {actioning === 'accept' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {t('admin.jobAcceptBtn')}
              </button>
            )}
            {app.status !== 'rejected' && (
              <button
                onClick={rejectApp}
                disabled={actioning === 'reject'}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 text-red-400 border-red-500/20 hover:bg-red-500/10"
              >
                {actioning === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {t('admin.reject')}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant info */}
            <Card title={t('admin.jobApplicantInfo')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow icon={User}      label={t('admin.applicantName')}   value={app.fullName} />
                <InfoRow icon={Mail}      label={t('admin.emailLabel')}      value={app.email}    ltr />
                <InfoRow icon={Phone}     label={t('admin.phoneCol')}        value={app.phone}    ltr />
                <InfoRow icon={MapPin}    label={t('admin.cityColLabel')}    value={app.city || '—'} />
                {app.nationality && <InfoRow icon={User}  label={t('admin.jobNationality')}   value={app.nationality} />}
                {app.country     && <InfoRow icon={MapPin} label={t('admin.jobCountry')} value={app.country} />}
                {app.jobType     && <InfoRow icon={Briefcase} label={t('admin.jobTypeLabel')} value={app.jobType === 'formal' ? t('admin.jobTypeFormal') : t('admin.jobTypeTrades')} />}
                {app.department  && <InfoRow icon={Building2} label={t('admin.jobDeptLabel')}      value={app.department} />}
                <InfoRow icon={Clock}     label={t('admin.experienceYears')} value={app.experience || '—'} />
                <InfoRow icon={Briefcase} label={t('admin.positionApplied')} value={app.position} />
                <InfoRow icon={Calendar}  label={t('admin.submittedCol')}    value={submittedDate} ltr />
              </div>
            </Card>

            {/* Cover letter */}
            {app.coverLetter && (
              <Card title={t('admin.jobCoverLetter')}>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
              </Card>
            )}

            {/* CV download */}
            {app.cvUrl && (
              <Card title={t('admin.jobCvFile')}>
                <a
                  href={app.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#c8a96e]/10 border border-[#c8a96e]/25 text-[#c8a96e] text-sm font-bold hover:bg-[#c8a96e]/18 transition-all"
                >
                  <Download size={15} />
                  {t('admin.downloadCV')}
                </a>
              </Card>
            )}
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            {/* Current status */}
            <Card title={t('admin.currentStatus')}>
              <div className="space-y-2.5">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${app.status === key ? 'bg-white/5' : 'opacity-30'}`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-sm flex-1" style={{ color: app.status === key ? cfg.color : undefined }}>
                      {t(cfg.labelKey)}
                    </span>
                    {app.status === key && (
                      <span className="text-xs text-white/30 shrink-0">{t('admin.currentStatus')}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Schedule interview — only when accepted */}
              {app.status === 'accepted' && (
                <div className="mt-4">
                  <button
                    onClick={() => { setShowInterviewForm(v => !v); setSendStatus(''); setSendError(''); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#c8a96e]/10 hover:bg-[#c8a96e]/20 border border-[#c8a96e]/20 text-[#c8a96e] text-sm font-semibold transition-colors"
                  >
                    <CalendarCheck size={14} />
                    {t('admin.jobScheduleBtn')}
                  </button>

                  {showInterviewForm && (
                    <div className="mt-3 space-y-3 border-t border-white/[0.07] pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs text-[#c8a96e] block">{t('admin.interviewDate')} *</label>
                          <input
                            type="date" required value={interviewDate}
                            onChange={e => setInterviewDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#c8a96e]/50 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-[#c8a96e] block">{t('admin.interviewTime')} *</label>
                          <input
                            type="time" required value={interviewTime}
                            onChange={e => setInterviewTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#c8a96e]/50 outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-[#c8a96e] block">{t('admin.interviewType')}</label>
                        <div className="relative">
                          <select
                            value={interviewType}
                            onChange={e => setInterviewType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#c8a96e]/50 outline-none transition-colors appearance-none cursor-pointer"
                          >
                            <option value="in_person" className="bg-[#111]">{t('admin.inPerson')}</option>
                            <option value="video"     className="bg-[#111]">{t('admin.videoCall')}</option>
                            <option value="phone"     className="bg-[#111]">{t('admin.phoneCall')}</option>
                          </select>
                          <ChevronDown size={13} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-xs text-[#c8a96e] block">{t('admin.interviewLocation')}</label>
                          <input
                            type="text" value={interviewLocation}
                            onChange={e => setInterviewLocation(e.target.value)}
                            placeholder={interviewType === 'in_person' ? t('admin.jobLocationPlaceholder_inPerson') : interviewType === 'video' ? t('admin.jobLocationPlaceholder_video') : t('admin.jobLocationPlaceholder_phone')}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none transition-colors"
                          />
                        </div>

                      <div className="space-y-1.5">
                          <label className="text-xs text-[#c8a96e] block">{t('admin.additionalMessage')}</label>
                          <textarea
                            rows={3} value={additionalMessage}
                            onChange={e => setAdditionalMessage(e.target.value)}
                            placeholder={t('admin.jobAdditionalPlaceholder')}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none transition-colors resize-none"
                          />
                        </div>

                      {sendStatus === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                          <p className="text-red-400 text-xs font-semibold text-center mb-1">{t('admin.emailSentError')}</p>
                          {sendError && <p className="text-red-300/70 text-xs text-center break-all">{sendError}</p>}
                        </div>
                      )}

                      <button
                        onClick={handleSendInterview}
                        disabled={sending || !interviewDate || !interviewTime}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#c8a96e] to-[#B8923A] text-black text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      >
                        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        {t('admin.sendAcceptance')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* AI score */}
            <Card title={t('admin.aiScoreTitle')}>
              <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={13} className="text-purple-400" />
                  <span className="text-purple-300 text-xs font-bold">{t('admin.aiScoreTitle')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-purple-300 font-black text-lg">{sc.expScore}</p>
                    <p className="text-white/30 text-[10px]">{t('admin.expScoreLabel')}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 font-black text-lg">{sc.cityScore}</p>
                    <p className="text-white/30 text-[10px]">{t('admin.locScoreLabel')}</p>
                  </div>
                  <div>
                    <p className="text-[#c8a96e] font-black text-lg">{sc.total}</p>
                    <p className="text-white/30 text-[10px]">{t('admin.totalScoreLabel')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* Success Dialog */}
      {sendStatus === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeSuccessDialog} />

          <div
            className="relative z-10 w-full max-w-sm"
            dir="rtl"
          >
            {/* Glow */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-[#c8a96e]/40 to-transparent blur-xl pointer-events-none" />

            <div className="relative rounded-3xl border border-[#c8a96e]/20 bg-[#0e0d0a] overflow-hidden shadow-2xl">

              {/* Top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#c8a96e] to-transparent" />

              <div className="p-8 flex flex-col items-center text-center gap-6">

                {/* Icon */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl scale-150" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle size={36} className="text-green-400" />
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <p className="text-white font-black text-xl tracking-tight">{t('admin.jobSuccessTitle')}</p>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {t('admin.jobSuccessSub')}<br />
                      <span className="text-[#c8a96e] font-semibold">{app.fullName}</span>
                    </p>
                  </div>

                  {/* Details strip */}
                  <div className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl divide-y divide-white/[0.06]">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-white/35 text-xs">{t('admin.jobSuccessDateLabel')}</span>
                      <span className="text-white text-xs font-bold" dir="ltr">{interviewDate}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-white/35 text-xs">{t('admin.jobSuccessTimeLabel')}</span>
                      <span className="text-white text-xs font-bold" dir="ltr">{interviewTime}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-white/35 text-xs">{t('admin.jobSuccessTypeLabel')}</span>
                      <span className="text-white text-xs font-bold">
                        {{ in_person: t('admin.jobTypeInPerson'), video: t('admin.jobTypeVideo'), phone: t('admin.jobTypePhone') }[interviewType]}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={closeSuccessDialog}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c8a96e] to-[#B8923A] text-black font-black text-sm tracking-wide hover:opacity-90 transition-opacity"
                  >
                    {t('admin.jobDoneBtn')}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-[#c8a96e] uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, ltr }) {
  return (
    <div>
      <span className="text-xs text-white/30 flex items-center gap-1.5 mb-1">
        <Icon size={11} /> {label}
      </span>
      <span className={`text-sm text-white/80 ${ltr ? 'font-mono' : ''}`} dir={ltr ? 'ltr' : undefined}>
        {value || '—'}
      </span>
    </div>
  );
}
