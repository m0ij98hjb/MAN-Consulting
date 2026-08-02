'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  collection, doc, addDoc, updateDoc, query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import Navbar from '@/components/layout/Navbar';
import ItemsTable, { blankItem, computeItemTotals } from '@/components/purchasing/ItemsTable';
import AttachmentsUploader from '@/components/purchasing/AttachmentsUploader';
import PurchaseStatusBadge from '@/components/purchasing/PurchaseStatusBadge';
import ApprovalTimeline from '@/components/purchasing/ApprovalTimeline';
import { nextRequestNumber, addHistoryEntry, notify } from '@/lib/purchasingApi';
import { PRIORITY, PRIORITY_LABEL_KEYS, ROLES, STATUS } from '@/lib/purchasingConfig';
import {
  Loader2, Mail, Lock, Eye, EyeOff, FileText, ListChecks, Send, ShieldAlert,
  ChevronDown, ChevronUp, Pencil,
} from 'lucide-react';

const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#c8a96e]/60 focus:bg-black/60 outline-none transition-all duration-300';
const labelCls = 'text-[#c8a96e] text-[11px] font-black uppercase tracking-widest block mb-1.5';

function emptyForm(profile, user) {
  return {
    projectName: profile?.projectName || '',
    projectCode: '',
    siteName: '',
    requesterName: profile?.name || user?.displayName || '',
    requesterPhone: profile?.phone || '',
    requesterEmail: profile?.email || user?.email || '',
    jobTitle: profile?.jobTitle || '',
    department: profile?.department || '',
    priority: PRIORITY.NORMAL,
    reason: '',
    generalNotes: '',
    items: [blankItem()],
    attachments: [],
  };
}

/* ─────────────────────────── Inline login ─────────────────────────── */
function InlineLogin() {
  const { login, error, setError } = useAuth();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-20 px-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-black/40 border border-[#c8a96e]/20 rounded-2xl p-7 sm:p-8 space-y-5">
        <div className="text-center mb-2">
          <h1 className="text-xl font-black text-white">{t('purchasing.portalLoginTitle')}</h1>
          <p className="text-sm text-white/40 mt-1.5">{t('purchasing.portalLoginSubtitle')}</p>
        </div>
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-center bg-red-500/10 border border-red-500/25 text-red-400">
            {t('admin.loginError')}
          </div>
        )}
        <div>
          <label className={labelCls}>{t('admin.emailLabel')}</label>
          <div className="relative">
            <Mail size={14} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#c8a96e]/40" />
            <input type="email" required dir="ltr" value={email}
              onChange={e => { setEmail(e.target.value); setError?.(''); }}
              className={`${inputCls} ps-10`} />
          </div>
        </div>
        <div>
          <label className={labelCls}>{t('admin.passwordLabel')}</label>
          <div className="relative">
            <Lock size={14} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#c8a96e]/40" />
            <input type={showPass ? 'text' : 'password'} required dir="ltr" value={password}
              onChange={e => { setPassword(e.target.value); setError?.(''); }}
              className={`${inputCls} ps-10 pe-10`} />
            <button type="button" onClick={() => setShowPass(v => !v)} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-[#c8a96e]">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)', color: '#000' }}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? t('admin.loggingIn') : t('admin.loginBtn')}
        </button>
      </form>
    </section>
  );
}

/* ─────────────────────────── New / edit request form ─────────────────────────── */
function RequestForm({ profile, user, editingRequest, onDone }) {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState(() => editingRequest ? {
    projectName: editingRequest.projectName, projectCode: editingRequest.projectCode || '',
    siteName: editingRequest.siteName, requesterName: editingRequest.requesterName,
    requesterPhone: editingRequest.requesterPhone, requesterEmail: editingRequest.requesterEmail,
    jobTitle: editingRequest.jobTitle, department: editingRequest.department,
    priority: editingRequest.priority, reason: editingRequest.reason,
    generalNotes: editingRequest.generalNotes, items: editingRequest.items, attachments: editingRequest.attachments || [],
  } : emptyForm(profile, user));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const { totalQuantity, totalEstimatedCost } = useMemo(() => computeItemTotals(form.items), [form.items]);

  const validItems = form.items.filter(it => it.itemName.trim() && Number(it.quantity) > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.projectName.trim() || !form.siteName.trim() || !form.reason.trim()) {
      setError(t('purchasing.fillRequiredFields')); return;
    }
    if (validItems.length === 0) {
      setError(t('purchasing.needAtLeastOneItem')); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: validItems,
        totalQuantity, totalEstimatedCost,
        updatedAt: serverTimestamp(),
      };

      if (editingRequest) {
        payload.status = STATUS.PENDING_ENGINEER_APPROVAL;
        await updateDoc(doc(db, 'purchaseRequests', editingRequest.id), payload);
        await addHistoryEntry(editingRequest.id, {
          userId: user.uid, userName: form.requesterName, role: ROLES.SITE_SUPERVISOR,
          action: 'resubmitted', previousStatus: STATUS.RETURNED, newStatus: STATUS.PENDING_ENGINEER_APPROVAL,
          notes: '',
        });
        await notify({
          targetRole: ROLES.SITE_ENGINEER, type: 'resubmitted',
          requestId: editingRequest.id, requestNumber: editingRequest.requestNumber,
          title: t('purchasing.notifResubmittedTitle'),
          message: `${editingRequest.requestNumber} — ${form.projectName}`,
        });
      } else {
        const requestNumber = await nextRequestNumber();
        const docRef = await addDoc(collection(db, 'purchaseRequests'), {
          ...payload,
          requestNumber,
          requestDate: new Date().toISOString().slice(0, 10),
          requesterUid: user.uid,
          status: STATUS.PENDING_ENGINEER_APPROVAL,
          createdAt: serverTimestamp(),
          submittedAt: serverTimestamp(),
        });
        await addHistoryEntry(docRef.id, {
          userId: user.uid, userName: form.requesterName, role: ROLES.SITE_SUPERVISOR,
          action: 'submitted', previousStatus: null, newStatus: STATUS.PENDING_ENGINEER_APPROVAL, notes: '',
        });
        await notify({
          targetRole: ROLES.SITE_ENGINEER, type: 'new_request',
          requestId: docRef.id, requestNumber,
          title: t('purchasing.notifNewRequestTitle'),
          message: `${requestNumber} — ${form.projectName}`,
        });
      }
      onDone();
    } catch (err) {
      setError(err.message || t('purchasing.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {error && <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}

      {/* Requester info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelCls}>{t('purchasing.requesterName')}</label>
          <input className={inputCls} value={form.requesterName} onChange={e => set('requesterName', e.target.value)} required /></div>
        <div><label className={labelCls}>{t('purchasing.requesterPhone')}</label>
          <input className={inputCls} dir="ltr" value={form.requesterPhone} onChange={e => set('requesterPhone', e.target.value)} /></div>
        <div><label className={labelCls}>{t('purchasing.requesterEmail')}</label>
          <input type="email" className={inputCls} dir="ltr" value={form.requesterEmail} onChange={e => set('requesterEmail', e.target.value)} /></div>
        <div><label className={labelCls}>{t('purchasing.jobTitle')}</label>
          <input className={inputCls} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} /></div>
        <div><label className={labelCls}>{t('purchasing.department')}</label>
          <input className={inputCls} value={form.department} onChange={e => set('department', e.target.value)} /></div>
        <div>
          <label className={labelCls}>{t('purchasing.priority')}</label>
          <select className={`${inputCls} appearance-none cursor-pointer`} value={form.priority} onChange={e => set('priority', e.target.value)}>
            {Object.values(PRIORITY).map(p => <option key={p} value={p} className="bg-slate-800">{t(PRIORITY_LABEL_KEYS[p])}</option>)}
          </select>
        </div>
      </div>

      {/* Project info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelCls}>{t('purchasing.projectName')}</label>
          <input className={inputCls} value={form.projectName} onChange={e => set('projectName', e.target.value)} required /></div>
        <div><label className={labelCls}>{t('purchasing.projectCode')}</label>
          <input className={inputCls} dir="ltr" value={form.projectCode} onChange={e => set('projectCode', e.target.value)} /></div>
        <div><label className={labelCls}>{t('purchasing.siteName')}</label>
          <input className={inputCls} value={form.siteName} onChange={e => set('siteName', e.target.value)} required /></div>
      </div>

      <div><label className={labelCls}>{t('purchasing.requestReason')}</label>
        <input className={inputCls} value={form.reason} onChange={e => set('reason', e.target.value)} required /></div>

      {/* Items table */}
      <div>
        <label className={labelCls}>{t('purchasing.itemsTableTitle')}</label>
        <ItemsTable items={form.items} onChange={items => set('items', items)} />
      </div>

      {/* Attachments */}
      <div>
        <label className={labelCls}>{t('purchasing.attachments')}</label>
        <AttachmentsUploader
          pathPrefix={`purchaseRequests/${editingRequest?.id || user.uid}`}
          attachments={form.attachments}
          onChange={a => set('attachments', a)}
        />
      </div>

      <div><label className={labelCls}>{t('purchasing.generalNotes')}</label>
        <textarea rows={3} className={`${inputCls} resize-none`} value={form.generalNotes} onChange={e => set('generalNotes', e.target.value)} /></div>

      {/* Approval status (read-only, no approve buttons here) */}
      <div className="flex items-center gap-3 bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-3">
        <ShieldAlert size={16} className="text-blue-400 shrink-0" />
        <p className="text-sm text-white/60">
          {t('purchasing.approvalStatusLabel')}: <span className="font-bold text-blue-300">{t('purchasing.statusPendingEngineer')}</span>
        </p>
      </div>

      <button type="submit" disabled={submitting}
        className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)', color: '#000' }}>
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {editingRequest ? t('purchasing.resubmitRequest') : t('purchasing.submitRequest')}
      </button>
    </form>
  );
}

/* ─────────────────────────── My requests list ─────────────────────────── */
function MyRequests({ user, onEdit }) {
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'purchaseRequests'), where('requesterUid', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setRequests(docs);
    });
    return unsub;
  }, [user.uid]);

  if (requests === null) return <div className="flex justify-center py-16"><Loader2 size={26} className="animate-spin text-[#c8a96e]" /></div>;
  if (requests.length === 0) return <p className="text-center text-white/30 py-16">{t('purchasing.noRequestsYet')}</p>;

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {requests.map(r => {
        const open = openId === r.id;
        return (
          <div key={r.id} className="bg-black/30 border border-white/10 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setOpenId(open ? null : r.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors text-start">
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate" dir="ltr">{r.requestNumber}</p>
                <p className="text-xs text-white/40 truncate mt-0.5">{r.projectName} · {r.siteName}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <PurchaseStatusBadge status={r.status} />
                {open ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
              </div>
            </button>
            {open && (
              <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-4">
                {r.status === STATUS.RETURNED && (
                  <button type="button" onClick={() => onEdit(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/10">
                    <Pencil size={12} /> {t('purchasing.editAndResubmit')}
                  </button>
                )}
                <ApprovalTimeline requestId={r.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */
export default function PurchaseRequestPage() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { loading: roleLoading, profile, hasAccess } = usePurchasingRole();
  const [tab, setTab] = useState('new');
  const [editingRequest, setEditingRequest] = useState(null);

  if (user === undefined || (user && roleLoading)) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center"><Loader2 size={30} className="animate-spin text-[#c8a96e]" /></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <InlineLogin />
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <section className="min-h-[60vh] flex items-center justify-center px-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center max-w-md">
            <ShieldAlert size={36} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-white mb-2">{t('purchasing.accountNotProvisionedTitle')}</h1>
            <p className="text-sm text-white/45">{t('purchasing.accountNotProvisionedDesc')}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <section className="pt-36 lg:pt-40 pb-16 px-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[#c8a96e] font-bold tracking-widest text-xs mb-2 block">{t('purchasing.portalBadge')}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{t('purchasing.portalTitle')}</h1>
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] w-fit mx-auto mb-8">
            <button onClick={() => { setTab('new'); setEditingRequest(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'new' ? 'bg-[#c8a96e] text-black' : 'text-white/45 hover:text-white'}`}>
              <FileText size={13} /> {t('purchasing.newRequestTab')}
            </button>
            <button onClick={() => { setTab('mine'); setEditingRequest(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'mine' ? 'bg-[#c8a96e] text-black' : 'text-white/45 hover:text-white'}`}>
              <ListChecks size={13} /> {t('purchasing.myRequestsTab')}
            </button>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-6 sm:p-8">
            {tab === 'new' || editingRequest ? (
              <RequestForm
                profile={profile} user={user} editingRequest={editingRequest}
                onDone={() => { setEditingRequest(null); setTab('mine'); }}
              />
            ) : (
              <MyRequests user={user} onEdit={(r) => setEditingRequest(r)} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
