'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';
import { COMPANY } from '@/config/company';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import {
  ArrowLeft, ArrowRight, XCircle, CheckCircle, Loader2,
  User, Mail, Phone, Building2, Tag, Calendar, Clock,
  CornerUpLeft, Send, FileText, Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

/* ─── Status config (mirrors admin/messages/page.js) ─── */
const STATUS_CONFIG = {
  new:          { color: '#3b82f6', labelKey: 'admin.messages.statusNew' },
  under_review: { color: '#f59e0b', labelKey: 'admin.messages.statusUnderReview' },
  replied:      { color: '#10b981', labelKey: 'admin.messages.statusReplied' },
  closed:       { color: '#6b7280', labelKey: 'admin.messages.statusClosed' },
};

const SUBJECT_LABEL_KEYS = {
  construction: 'admin.messages.subjectConstruction',
  architecture: 'admin.messages.subjectArchitecture',
  management:   'admin.messages.subjectManagement',
  other:        'activities.other',
};

export default function MessageDetailPage() {
  const { id }        = useParams();
  const router        = useRouter();
  const { t, isRTL, lang } = useLanguage();
  const { confirm }   = useConfirm();

  const [msg, setMsg]           = useState(null);
  const [actioning, setActioning] = useState('');

  /* Reply form state */
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replySubject, setReplySubject]   = useState('');
  const [replyText, setReplyText]         = useState('');
  const [replySending, setReplySending]   = useState(false);
  const [replyError, setReplyError]       = useState('');
  const [replyDone, setReplyDone]         = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'contacts', id), snap => {
      if (snap.exists()) setMsg({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [id]);

  const updateStatus = async (status) => {
    setActioning(status);
    await updateDoc(doc(db, 'contacts', id), { status, updatedAt: serverTimestamp() });
    setActioning('');
  };

  const deleteMsg = async () => {
    if (!(await confirm(t('admin.messages.deleteConfirm'), { variant: 'danger' }))) return;
    await deleteDoc(doc(db, 'contacts', id));
    router.push('/admin/messages');
  };

  const openReplyForm = () => {
    const subjKey = SUBJECT_LABEL_KEYS[msg.subject];
    const subj = subjKey ? t(subjKey) : (msg.subject || '');
    setReplySubject(`${t('admin.messages.replySubjectPrefix')}${subj ? ` — ${subj}` : ''}`);
    setReplyText(msg.adminReply || '');
    setReplyError('');
    setReplyDone(false);
    setShowReplyForm(true);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !msg?.email) return;
    setReplySending(true);
    setReplyError('');
    try {
      const res = await fetch('/api/send-contact-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  msg.fullName || msg.name,
          customerEmail: msg.email,
          subject:       replySubject,
          replyMessage:  replyText,
          lang,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Send failed');
      await updateDoc(doc(db, 'contacts', id), {
        status:     'replied',
        adminReply: replyText,
        updatedAt:  serverTimestamp(),
      });
      setReplyDone(true);
      setTimeout(() => { setShowReplyForm(false); setReplyDone(false); }, 2200);
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setReplySending(false);
    }
  };

  const saveDraft = async () => {
    if (!replyText.trim()) return;
    await updateDoc(doc(db, 'contacts', id), { adminReply: replyText, updatedAt: serverTimestamp() });
    setShowReplyForm(false);
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (!msg) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="text-[#F2B233] animate-spin" />
        </div>
      </AdminPageLayout>
    );
  }

  const fmtFull = ts => ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-GB')
    : '—';
  const subjectLabel = SUBJECT_LABEL_KEYS[msg.subject] ? t(SUBJECT_LABEL_KEYS[msg.subject]) : (msg.subject || '—');
  const status = msg.status || 'new';

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href="/admin/messages" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <BackIcon size={16} /> {t('admin.back')}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{msg.fullName || msg.name || '—'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                style={{
                  color: STATUS_CONFIG[status]?.color ?? '#3b82f6',
                  background: `${STATUS_CONFIG[status]?.color ?? '#3b82f6'}1a`,
                  border: `1px solid ${STATUS_CONFIG[status]?.color ?? '#3b82f6'}30`,
                }}
              >
                {t(STATUS_CONFIG[status]?.labelKey ?? 'admin.messages.statusNew')}
              </span>
              <span className="text-xs text-white/30" dir="ltr">{fmtFull(msg.createdAt)}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {msg.email && (
              <button
                onClick={openReplyForm}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors text-[#F2B233] border-[#F2B233]/25 hover:bg-[#F2B233]/10"
              >
                <CornerUpLeft size={14} />
                {t('admin.messages.replyShort')}
              </button>
            )}
            {status !== 'under_review' && status !== 'replied' && status !== 'closed' && (
              <button
                onClick={() => updateStatus('under_review')}
                disabled={actioning === 'under_review'}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
              >
                {actioning === 'under_review' ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                {t('admin.underReviewAction')}
              </button>
            )}
            {status !== 'closed' && (
              <button
                onClick={() => updateStatus('closed')}
                disabled={actioning === 'closed'}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 text-gray-400 border-gray-500/20 hover:bg-gray-500/10"
              >
                {actioning === 'closed' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {t('admin.messages.closeAction')}
              </button>
            )}
            <button
              onClick={deleteMsg}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors text-red-400 border-red-500/20 hover:bg-red-500/10"
            >
              <Trash2 size={14} />
              {t('admin.delete')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <Card title={t('admin.messages.detailsTitle')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow icon={User}      label={t('admin.fullNameLabel')}        value={msg.fullName || msg.name} />
                <InfoRow icon={Mail}      label={t('admin.emailLabel')}           value={msg.email}   ltr />
                <InfoRow icon={Phone}     label={t('admin.phoneCol')}             value={msg.phone}   ltr />
                <InfoRow icon={Building2} label={t('admin.messages.companyLabel')} value={msg.company} />
                <InfoRow icon={Tag}       label={t('admin.messages.subjectCol')}   value={subjectLabel} />
                <InfoRow icon={Calendar}  label={t('admin.dateLabel')}            value={fmtFull(msg.createdAt)} ltr />
              </div>
            </Card>

            <Card title={t('admin.messages.messageLabel')}>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{msg.message || '—'}</p>
            </Card>

            {msg.adminReply && (
              <Card title={t('admin.messages.adminReplyLabel')}>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{msg.adminReply}</p>
              </Card>
            )}
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            <Card title={t('admin.currentStatus')}>
              <div className="space-y-2.5">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${status === key ? 'bg-white/5' : 'opacity-30'}`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-sm flex-1" style={{ color: status === key ? cfg.color : undefined }}>
                      {t(cfg.labelKey)}
                    </span>
                    {status === key && (
                      <span className="text-xs text-white/30 shrink-0">{t('admin.currentStatus')}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply form */}
              {msg.email && (
                <div className="mt-4">
                  <button
                    onClick={() => (showReplyForm ? setShowReplyForm(false) : openReplyForm())}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F2B233]/10 hover:bg-[#F2B233]/20 border border-[#F2B233]/20 text-[#F2B233] text-sm font-semibold transition-colors"
                  >
                    <CornerUpLeft size={14} />
                    {t('admin.messages.sendReplyTitle')}
                  </button>

                  {showReplyForm && (
                    <div className="mt-3 space-y-3 border-t border-white/[0.07] pt-4">
                      {replyDone ? (
                        <div className="text-center py-4">
                          <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                          <p className="text-white font-bold text-sm">{t('admin.messages.replySentSuccess')}</p>
                          <p className="text-white/40 text-xs mt-1">{t('admin.messages.statusUpdatedToReplied')}</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs text-[#F2B233] block">{t('admin.messages.fromLabel')}</label>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                              <Mail size={13} className="text-white/30 shrink-0" />
                              <span className="text-white/65 text-xs truncate">{COMPANY.email}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-[#F2B233] block">{t('admin.messages.toLabel')}</label>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                              <Mail size={13} className="text-white/30 shrink-0" />
                              <span className="text-white/65 text-xs truncate">{msg.fullName || msg.name} &lt;{msg.email}&gt;</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-[#F2B233] block">{t('admin.messages.subjectCol')}</label>
                            <input
                              value={replySubject}
                              onChange={e => setReplySubject(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#F2B233]/50 outline-none transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-[#F2B233] block">{t('admin.messages.replyMessageLabel')}</label>
                            <textarea
                              rows={5}
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder={t('admin.messages.replyPlaceholder')}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#F2B233]/50 outline-none transition-colors resize-none"
                            />
                          </div>

                          {replyError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                              <p className="text-red-400 text-xs font-semibold text-center">{replyError}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={sendReply}
                              disabled={replySending || !replyText.trim()}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#F2B233] to-[#F2B233] text-black text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                            >
                              {replySending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                              {replySending ? t('admin.sendingLabel') : t('admin.messages.sendReplyTitle')}
                            </button>
                            <button
                              onClick={saveDraft}
                              disabled={replySending || !replyText.trim()}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white/55 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                            >
                              <FileText size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-[#F2B233] uppercase tracking-wider mb-4">{title}</h3>
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
