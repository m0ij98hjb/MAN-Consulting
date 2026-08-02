'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { STATUS_CONFIG, ACTIVITY_KEYS } from '@/lib/suppliersConfig';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';
import StatusBadge from '@/components/admin/StatusBadge';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import {
  Search, Trash2, Eye, CheckCircle, XCircle, Clock,
  Loader2, X, Mail, Phone, Building2, MapPin,
  Send, Sparkles, Star, DollarSign, PackageCheck,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_FILTER_KEYS = ['all', 'new', 'under_review', 'approved', 'rejected'];
const STATUS_T_KEYS = {
  new:          'admin.statusNew',
  under_review: 'admin.statusUnderReview',
  approved:     'admin.statusApproved',
  rejected:     'admin.statusRejected',
};

/* ─── Smart Agent scoring ─── */
const PRICE_SCORES = { low: 70, mid: 35, high: 5 };

function parseCapacity(text = '') {
  const nums = text.match(/\d[\d,.]*/g);
  if (!nums) return 0;
  const val = parseFloat(nums[0].replace(/,/g, ''));
  return isNaN(val) ? 0 : Math.min(val / 10, 80); // cap at 80 pts
}

function parseDelivery(text = '') {
  const n = parseInt(text);
  if (isNaN(n)) return 0;
  return n <= 2 ? 30 : n <= 7 ? 20 : n <= 14 ? 10 : 0;
}

function scoreSupplier(s) {
  const priceScore    = PRICE_SCORES[s.priceLevel] ?? 0;
  const capacityScore = parseCapacity(s.supplyCapacity);
  const deliveryScore = parseDelivery(s.deliveryTime);
  const total = priceScore + capacityScore + deliveryScore;
  const isBestMatch = priceScore >= 35 && capacityScore >= 30;
  return { priceScore, capacityScore, deliveryScore, total, isBestMatch };
}

export default function SuppliersListPage() {
  const { t, isRTL, lang } = useLanguage();
  const { confirm } = useConfirm();
  const getAct = (name) => name && (t('activities.' + ACTIVITY_KEYS[name]) || name);

  const [suppliers, setSuppliers] = useState([]);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [agentOn, setAgentOn]     = useState(false);

  // Accept dialog
  const [dialogSupplier, setDialogSupplier]       = useState(null);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [sending, setSending]                     = useState(false);
  const [sendStatus, setSendStatus]               = useState('');
  const [sendError, setSendError]                 = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'suppliers'), snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setSuppliers(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const { visible, bestIds } = useMemo(() => {
    let list = suppliers.filter(s => {
      const matchStatus = filter === 'all' || s.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        s.companyName?.toLowerCase().includes(q) ||
        s.contactName?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.activity?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    if (!agentOn) return { visible: list, bestIds: new Set() };

    const scored   = list.map(s => ({ id: s.id, total: scoreSupplier(s).total }));
    const maxTotal = scored.reduce((m, s) => Math.max(m, s.total), 0);
    const bestIds  = new Set(
      maxTotal > 0 ? scored.filter(s => s.total === maxTotal).map(s => s.id) : []
    );
    const sorted = [...list].sort((a, b) => scoreSupplier(b).total - scoreSupplier(a).total);
    return { visible: sorted, bestIds };
  }, [suppliers, filter, search, agentOn]);

  const updateStatus = async (id, status) => {
    setActionId(id + status);
    await updateDoc(doc(db, 'suppliers', id), { status, reviewedAt: new Date() });
    setActionId(null);
  };

  const deleteSupplier = async (id, name) => {
    if (!(await confirm(`${t('admin.delete')} "${name}"?`, { variant: 'danger' }))) return;
    await deleteDoc(doc(db, 'suppliers', id));
  };

  const openAcceptDialog = (supplier) => {
    setDialogSupplier(supplier);
    setAdditionalMessage(''); setSendStatus(''); setSendError('');
  };

  const closeDialog = () => { setDialogSupplier(null); setSendStatus(''); setSendError(''); };

  const handleSendAcceptance = async () => {
    setSending(true); setSendStatus(''); setSendError('');
    try {
      const res  = await fetch('/api/send-supplier-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName:  dialogSupplier.companyName,
          contactName:   dialogSupplier.contactName,
          supplierEmail: dialogSupplier.email,
          activity:      getAct(dialogSupplier.activity) || dialogSupplier.activity,
          additionalMessage,
          lang,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || data.code || 'Unknown error');
      await updateDoc(doc(db, 'suppliers', dialogSupplier.id), {
        status: 'approved', reviewedAt: new Date(), approvalEmailSentAt: new Date(),
      });
      setSendStatus('success');
      setTimeout(() => closeDialog(), 2000);
    } catch (err) {
      setSendStatus('error'); setSendError(err.message || 'Unknown error');
    } finally {
      setSending(false);
    }
  };

  /* stats */
  const bestMatches = bestIds.size || suppliers.length;

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{t('admin.suppliersMenu')}</h1>
          <Link href="/admin/suppliers/best"
            className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-xl text-purple-300 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-500/18 hover:border-purple-500/40 transition-all">
            <Star size={11} className="fill-purple-300" />
            {t('admin.bestSuppliersBtn')}
          </Link>
        </div>

        {/* Filters + Agent */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.searchPlaceholder')}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8a96e]/40`} />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {STATUS_FILTER_KEYS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${filter === f ? 'bg-[#c8a96e] border-[#c8a96e] text-black' : 'border-white/10 text-white/50 hover:text-white'}`}>
                {f === 'all' ? t('admin.allStatuses') : t(STATUS_T_KEYS[f])}
              </button>
            ))}
            <button onClick={() => setAgentOn(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${agentOn ? 'bg-purple-500/15 text-purple-300 border-purple-500/35' : 'text-white/40 border-white/10 hover:text-purple-300/70'}`}>
              <Sparkles size={12} />
              {agentOn ? t('admin.agentOnLabel') : t('admin.agentOffLabel')}
            </button>
          </div>
        </div>

        {/* Agent banner */}
        {agentOn && (
          <div className="flex items-start gap-3 bg-purple-500/8 border border-purple-500/20 rounded-xl px-4 py-3 mb-4">
            <Sparkles size={14} className="text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-purple-300 text-xs font-bold mb-0.5">{t('admin.agentEnabled')}</p>
              <p className="text-white/40 text-xs leading-relaxed">{t('admin.agentSuppliersBannerDesc')}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-[#c8a96e] animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-16">{t('admin.noResults')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {[
                      t('admin.companyNameCol'),
                      t('admin.activityCol'),
                      t('admin.cityCol'),
                      t('admin.phoneCol'),
                      t('admin.submittedCol'),
                      t('admin.statusCol'),
                      t('admin.actionsCol'),
                    ].map(h => (
                      <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {visible.map(s => {
                    const sc = scoreSupplier(s);
                    return (
                      <tr key={s.id} className={`hover:bg-white/[0.02] transition-colors ${agentOn && bestIds.has(s.id) ? 'bg-purple-500/[0.025]' : ''}`}>
                        {/* Company — first col = RIGHT in RTL */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {agentOn && bestIds.has(s.id) && (
                              <span className="text-[10px] font-black text-purple-300 bg-purple-500/15 border border-purple-500/25 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shrink-0">
                                <Star size={8} className="fill-purple-300" /> {t('admin.bestBadge')}
                              </span>
                            )}
                            <div>
                              <Link href={`/admin/suppliers/${s.id}`} className="text-white font-medium hover:text-[#c8a96e] transition-colors block">
                                {s.companyName}
                              </Link>
                              <p className="text-xs text-white/30 mt-0.5">{s.contactName}</p>
                              {agentOn && (s.priceLevel || s.supplyCapacity) && (
                                <div className="flex items-center gap-2 mt-1">
                                  {s.priceLevel && (
                                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${s.priceLevel === 'low' ? 'text-green-400' : s.priceLevel === 'mid' ? 'text-yellow-400' : 'text-red-400'}`}>
                                      <DollarSign size={9} />
                                      {s.priceLevel === 'low' ? t('admin.priceLow') : s.priceLevel === 'mid' ? t('admin.priceMid') : t('admin.priceHigh')}
                                    </span>
                                  )}
                                  {s.supplyCapacity && (
                                    <span className="text-[10px] text-white/35 flex items-center gap-0.5">
                                      <PackageCheck size={9} />
                                      {s.supplyCapacity}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Activity */}
                        <td className="px-5 py-3.5 text-white/60 text-xs">{getAct(s.activity) || '—'}</td>
                        {/* City */}
                        <td className="px-5 py-3.5 text-white/60">{s.city}{s.country ? `, ${s.country}` : ''}</td>
                        {/* Phone */}
                        <td className="px-5 py-3.5 text-white/60" dir="ltr">{s.phone}</td>
                        {/* Date */}
                        <td className="px-5 py-3.5 text-white/40 text-xs" dir="ltr">
                          {s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '—'}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                        {/* Actions — last col = LEFT in RTL */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/admin/suppliers/${s.id}`} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title={t('admin.viewDetails')}>
                              <Eye size={15} />
                            </Link>
                            {s.status !== 'approved' && (
                              <button onClick={() => openAcceptDialog(s)} className="p-1.5 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors" title={t('admin.approve')}>
                                {actionId === s.id + 'approved' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                              </button>
                            )}
                            {s.status !== 'rejected' && (
                              <button onClick={() => updateStatus(s.id, 'rejected')} disabled={actionId === s.id + 'rejected'} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40" title={t('admin.reject')}>
                                {actionId === s.id + 'rejected' ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                              </button>
                            )}
                            {s.status !== 'under_review' && (
                              <button onClick={() => updateStatus(s.id, 'under_review')} disabled={actionId === s.id + 'under_review'} className="p-1.5 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors disabled:opacity-40" title={t('admin.underReviewAction')}>
                                {actionId === s.id + 'under_review' ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                              </button>
                            )}
                            <button onClick={() => deleteSupplier(s.id, s.companyName)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title={t('admin.delete')}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ═══ APPROVAL DIALOG ═══ */}
      {dialogSupplier && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg bg-[#111118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]" style={{ background: 'linear-gradient(135deg,rgba(184,146,58,0.1),rgba(0,0,0,0))' }}>
              <div>
                <h2 className="text-white font-bold text-base">{t('admin.supplierAcceptDialogTitle')}</h2>
                <p className="text-white/40 text-xs mt-0.5">{dialogSupplier.companyName} — {dialogSupplier.contactName}</p>
              </div>
              <button onClick={closeDialog} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2 text-xs text-white/45"><Building2 size={12} className="text-[#c8a96e] shrink-0" />{dialogSupplier.companyName}</div>
              <div className="flex items-center gap-2 text-xs text-white/45"><Mail size={12} className="text-[#c8a96e] shrink-0" />{dialogSupplier.email || <span className="text-red-400/70">{t('admin.supplierEmailOptional')}</span>}</div>
              <div className="flex items-center gap-2 text-xs text-white/45"><Phone size={12} className="text-[#c8a96e] shrink-0" />{dialogSupplier.phone}</div>
              <div className="flex items-center gap-2 text-xs text-white/45"><MapPin size={12} className="text-[#c8a96e] shrink-0" />{dialogSupplier.city}{dialogSupplier.country ? `, ${dialogSupplier.country}` : ''}</div>
            </div>

            <div className="px-6 pt-5 pb-2">
              <div className="flex items-start gap-3 bg-[#c8a96e]/8 border border-[#c8a96e]/20 rounded-xl px-4 py-3">
                <Mail size={14} className="text-[#c8a96e] mt-0.5 shrink-0" />
                <p className="text-white/60 text-xs leading-relaxed">{t('admin.supplierAcceptNote')}</p>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#c8a96e] text-[10px] font-black uppercase tracking-widest block">
                  {t('admin.supplierExtraNoteLabel')} <span className="text-white/25 normal-case font-normal">{t('admin.supplierOptionalLabel')}</span>
                </label>
                <textarea rows={3} value={additionalMessage} onChange={e => setAdditionalMessage(e.target.value)}
                  placeholder={t('admin.supplierExtraNotePlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none transition-all resize-none" />
              </div>
              {sendStatus === 'success' && <p className="text-green-400 text-sm font-semibold text-center">{t('admin.supplierSendSuccess')}</p>}
              {sendStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm font-semibold text-center mb-1">{t('admin.supplierSendFail')}</p>
                  {sendError && <p className="text-red-300/70 text-xs text-center break-all">{sendError}</p>}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3">
              <button onClick={closeDialog} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">
                {t('admin.supplierCancelBtn')}
              </button>
              <button onClick={handleSendAcceptance} disabled={sending || !dialogSupplier.email}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#c8a96e] to-[#B8923A] text-black text-sm font-black flex items-center justify-center gap-2 hover:from-[#D5B25D] hover:to-[#c8a96e] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {t('admin.supplierSendBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
