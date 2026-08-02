'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { STATUS_CONFIG, ACTIVITY_KEYS } from '@/lib/suppliersConfig';
import { useLanguage } from '@/context/LanguageContext';
import StatusBadge from '@/components/admin/StatusBadge';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, Loader2, Save,
  Building2, User, Phone, Mail, Globe, MapPin, Calendar,
  Briefcase, FileText, Tag, Truck, MessageSquare, ExternalLink, Send,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useNotifications } from '@/context/NotificationsContext';

export default function SupplierDetailPage() {
  const { id }                    = useParams();
  const { t, isRTL, lang }        = useLanguage();
  const notif                      = useNotifications();
  const getAct = (name) => name && (t('activities.' + ACTIVITY_KEYS[name]) || name);
  const [supplier, setSupplier]   = useState(null);
  const [notes, setNotes]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [actioning, setActioning] = useState('');
  const [saved, setSaved]         = useState(false);

  /* Visit request form state */
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [visitDate, setVisitDate]         = useState('');
  const [visitTime, setVisitTime]         = useState('');
  const [visitNote, setVisitNote]         = useState('');
  const [visitSending, setVisitSending]   = useState(false);
  const [visitStatus, setVisitStatus]     = useState('');

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'suppliers', id), snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setSupplier(data);
        setNotes(data.adminNotes ?? '');
      }
    });
    return unsub;
  }, [id]);

  const updateStatus = async (status) => {
    setActioning(status);
    await updateDoc(doc(db, 'suppliers', id), { status, reviewedAt: new Date() });
    setActioning('');
  };

  const saveNotes = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'suppliers', id), { adminNotes: notes });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSendVisit = async () => {
    if (!visitDate || !visitTime) return;
    setVisitSending(true);
    setVisitStatus('');
    try {
      const res = await fetch('/api/send-supplier-visit-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: supplier.companyName,
          contactName: supplier.contactName,
          supplierEmail: supplier.email,
          visitDate,
          visitTime,
          additionalMessage: visitNote,
          lang,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || data.code || 'Unknown error');
      setVisitStatus('success');
    } catch (err) {
      setVisitStatus('error');
    } finally {
      setVisitSending(false);
    }
  };

  const closeVisitDialog = () => {
    setVisitStatus('');
    setVisitFormOpen(false);
    setVisitDate(''); setVisitTime(''); setVisitNote('');
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (!supplier) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="text-[#c8a96e] animate-spin" />
        </div>
      </AdminPageLayout>
    );
  }

  const createdDate = supplier.createdAt?.seconds
    ? new Date(supplier.createdAt.seconds * 1000).toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href="/admin/suppliers" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <BackIcon size={16} /> {t('admin.back')}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{supplier.companyName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={supplier.status} />
              <span className="text-xs text-white/30" dir="ltr">{createdDate}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {supplier.status !== 'under_review' && (
              <ActionBtn onClick={() => updateStatus('under_review')} loading={actioning === 'under_review'} icon={Clock} label={t('admin.underReviewAction')} color="yellow" />
            )}
            {supplier.status !== 'approved' && (
              <ActionBtn onClick={() => updateStatus('approved')} loading={actioning === 'approved'} icon={CheckCircle} label={t('admin.approve')} color="green" />
            )}
            {supplier.status !== 'rejected' && (
              <ActionBtn onClick={() => updateStatus('rejected')} loading={actioning === 'rejected'} icon={XCircle} label={t('admin.reject')} color="red" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <Card title={t('admin.companyInfo')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow icon={Building2} label={t('suppliers.companyName')} value={supplier.companyName} />
                <InfoRow icon={User}      label={t('suppliers.contactPerson')} value={supplier.contactName} />
                <InfoRow icon={Phone}     label={t('suppliers.phone')}  value={supplier.phone} ltr />
                <InfoRow icon={Mail}      label={t('suppliers.email')}  value={supplier.email} ltr />
                <InfoRow icon={MapPin}    label={t('suppliers.city')}   value={supplier.city} />
                <InfoRow icon={MapPin}    label={t('suppliers.country')} value={supplier.country} />
                <InfoRow icon={Globe}     label={t('suppliers.website')} value={supplier.website || '—'} ltr />
                <InfoRow icon={Calendar}  label={t('admin.submittedCol')} value={createdDate} ltr />
              </div>
            </Card>

            <Card title={t('admin.businessActivity')}>
              {supplier.activity ? (
                <span className="inline-flex items-center gap-2 bg-[#c8a96e]/10 text-[#c8a96e] text-sm font-semibold px-4 py-2 rounded-xl border border-[#c8a96e]/20">
                  <Briefcase size={14} />
                  {getAct(supplier.activity)}
                </span>
              ) : (
                <p className="text-white/30 text-sm">{t('admin.notSpecified')}</p>
              )}
            </Card>

            <Card title={t('admin.offerDetails')}>
              <div className="space-y-5">
                <DetailRow icon={FileText} label={t('suppliers.descriptionLabel')} value={supplier.description} multiline />
                <DetailRow icon={Tag}      label={t('suppliers.brands')}           value={supplier.brands} />
                <DetailRow icon={MapPin}   label={t('suppliers.coverageArea')}     value={supplier.coverageArea} />
                <DetailRow icon={Truck}    label={t('suppliers.deliveryTime')}      value={supplier.deliveryTime} />
                <DetailRow icon={MessageSquare} label={t('suppliers.notes')}      value={supplier.notes} multiline />
                {supplier.documentUrl && (
                  <div>
                    <span className="text-xs text-white/30 flex items-center gap-1.5 mb-1.5">
                      <FileText size={11} /> {t('suppliers.docUpload')}
                    </span>
                    <a
                      href={supplier.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#c8a96e] hover:text-[#e8c98a] underline underline-offset-2 transition-colors"
                    >
                      <ExternalLink size={13} />
                      {t('admin.viewDetails')}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            <Card title={t('admin.currentStatus')}>
              <div className="space-y-2.5">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const statusLabelMap = {
                    new: t('admin.statusNew'), under_review: t('admin.statusUnderReview'),
                    approved: t('admin.statusApproved'), rejected: t('admin.statusRejected'),
                  };
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                        ${supplier.status === key ? 'bg-white/5' : 'opacity-30'}`}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                      <span className="text-sm flex-1" style={{ color: supplier.status === key ? cfg.color : undefined }}>
                        {statusLabelMap[key] || cfg.label}
                      </span>
                      {supplier.status === key && (
                        <span className="text-xs text-white/30 shrink-0">{t('admin.currentStatus')}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Visit request — only for approved suppliers */}
              {supplier.status === 'approved' && (
                <div className="mt-4">
                  <button
                    onClick={() => { setVisitFormOpen(v => !v); setVisitStatus(''); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#c8a96e]/10 hover:bg-[#c8a96e]/20 border border-[#c8a96e]/20 text-[#c8a96e] text-sm font-semibold transition-colors"
                  >
                    <MapPin size={14} />
                    {t('admin.visitRequestBtn')}
                  </button>

                  {visitFormOpen && (
                    <div className="mt-3 space-y-3 border-t border-white/[0.07] pt-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#c8a96e] block">{t('admin.visitDateLabel')}</label>
                        <input
                          type="date" required value={visitDate}
                          onChange={e => setVisitDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#c8a96e]/50 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#c8a96e] block">{t('admin.visitTimeLabel')}</label>
                        <input
                          type="time" required value={visitTime}
                          onChange={e => setVisitTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#c8a96e]/50 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#c8a96e] block">{t('admin.visitNotesLabel')}</label>
                        <textarea
                          rows={3} value={visitNote}
                          onChange={e => setVisitNote(e.target.value)}
                          placeholder={t('admin.visitNotesPlaceholder')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#c8a96e]/50 outline-none transition-colors resize-none"
                        />
                      </div>

                      {visitStatus === 'error' && (
                        <p className="text-red-400 text-xs font-semibold text-center">{t('admin.visitSendError')}</p>
                      )}

                      <button
                        onClick={handleSendVisit}
                        disabled={visitSending || !visitDate || !visitTime}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#c8a96e] to-[#B8923A] text-black text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      >
                        {visitSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        {t('admin.visitSendBtn')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card title={t('admin.adminNotesTitle')}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={7}
                dir={isRTL ? 'rtl' : 'ltr'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8a96e]/40 resize-none transition-colors"
              />
              <button
                onClick={saveNotes}
                disabled={saving}
                className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50
                  ${saved
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-[#c8a96e]/10 hover:bg-[#c8a96e]/20 border-[#c8a96e]/20 text-[#c8a96e]'
                  }`}
              >
                {saving
                  ? <><Loader2 size={15} className="animate-spin" /> {t('admin.saving')}</>
                  : saved
                  ? <><CheckCircle size={15} /> {t('admin.savedLabel')}</>
                  : <><Save size={15} /> {t('admin.saveNotes')}</>
                }
              </button>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {visitStatus === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeVisitDialog} />

          <div className="relative z-10 w-full max-w-sm" dir="rtl">
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
                  <p className="text-white font-black text-xl tracking-tight">{t('admin.visitSuccessTitle')}</p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {t('admin.visitSuccessSub')}<br />
                    <span className="text-[#c8a96e] font-semibold">{supplier.companyName}</span>
                  </p>
                </div>

                {/* Details strip */}
                <div className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl divide-y divide-white/[0.06]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-white/35 text-xs">{t('admin.visitDateLabel')}</span>
                    <span className="text-white text-xs font-bold" dir="ltr">{visitDate}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-white/35 text-xs">{t('admin.timeLabel')}</span>
                    <span className="text-white text-xs font-bold" dir="ltr">{visitTime}</span>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={closeVisitDialog}
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

function DetailRow({ icon: Icon, label, value, multiline }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-white/30 flex items-center gap-1.5 mb-1.5">
        <Icon size={11} /> {label}
      </span>
      {multiline
        ? <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{value}</p>
        : <p className="text-sm text-white/80">{value}</p>
      }
    </div>
  );
}

function ActionBtn({ onClick, loading, icon: Icon, label, color }) {
  const cls = {
    green:  'text-green-400 border-green-500/20 hover:bg-green-500/10',
    red:    'text-red-400   border-red-500/20   hover:bg-red-500/10',
    yellow: 'text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10',
  }[color];
  return (
    <button onClick={onClick} disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${cls}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );
}
