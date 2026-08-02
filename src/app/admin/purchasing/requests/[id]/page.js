'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { doc, onSnapshot, addDoc, setDoc, collection, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchaseStatusBadge from '@/components/purchasing/PurchaseStatusBadge';
import ApprovalTimeline from '@/components/purchasing/ApprovalTimeline';
import ItemsTable, { computeItemTotals } from '@/components/purchasing/ItemsTable';
import AttachmentsUploader from '@/components/purchasing/AttachmentsUploader';

const SignaturePad = dynamic(() => import('@/components/purchasing/SignaturePad'), { ssr: false });
import BudgetWidget from '@/components/purchasing/BudgetWidget';
import PurchasingReportHeader from '@/components/purchasing/PurchasingReportHeader';
import { useProjectBudget } from '@/hooks/useProjectBudget';
import { stockKeyFor } from '@/lib/purchasingWarehouse';
import { exportWord, exportPDF } from '@/lib/purchasingExport';
import { ROLES, STATUS, PRIORITY_LABEL_KEYS, APPROVAL_STAGES } from '@/lib/purchasingConfig';
import { applyStatusChange, addApprovalRecord, addHistoryEntry, notify } from '@/lib/purchasingApi';
import {
  Loader2, CheckCircle2, XCircle, RotateCcw, Paperclip, Info, AlertTriangle,
  ShoppingCart, Truck, PackageCheck, Archive as ArchiveIcon, ArrowLeft, ArrowRight,
  Printer, FileText,
} from 'lucide-react';
import Link from 'next/link';

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB'); } catch { return d; }
}

/* ─────────────────────────── Approval stage action panel ─────────────────────────── */
function ApprovalActionPanel({ request, stageConfig, currentUser, actorName, actorJobTitle }) {
  const { t, isRTL } = useLanguage();
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [budgetAck, setBudgetAck] = useState(false);
  const isEngineerStage = stageConfig.stage === 'site_engineer';
  const [items, setItems] = useState(() => request.items || []);

  const isFinalStage = stageConfig.stage === 'procurement_manager';
  const { summary: budgetSummary } = useProjectBudget(isFinalStage ? request.projectName : null);
  const budgetExceeded = isFinalStage && !!budgetSummary?.exceeded;

  const decide = async (decision) => {
    setError('');
    if (!signature) { setError(t('purchasing.signatureRequired')); return; }
    if (decision !== 'approve' && !comment.trim()) { setError(t('purchasing.reasonRequired')); return; }
    if (decision === 'approve' && budgetExceeded && !budgetAck) { setError(t('purchasing.budgetAckRequired')); return; }
    setBusy(decision);
    try {
      const previousStatus = request.status;
      const newStatus = decision === 'approve' ? stageConfig.next
        : decision === 'reject' ? STATUS.REJECTED
        : STATUS.RETURNED;

      const extra = {};
      if (decision === 'reject') extra.rejectionReason = comment;
      if (decision === 'return') extra.returnReason = comment;
      if (decision === 'approve') {
        extra.decidedByUid = currentUser.uid; extra.decidedByName = actorName; extra.approvalDecisionAt = serverTimestamp();
        if (budgetExceeded) { extra.budgetExceeded = true; extra.budgetExceptionAcknowledgedBy = actorName; }
        if (isEngineerStage) {
          const { totalQuantity, totalEstimatedCost } = computeItemTotals(items);
          extra.items = items; extra.totalQuantity = totalQuantity; extra.totalEstimatedCost = totalEstimatedCost;
        }
      }

      await applyStatusChange(request.id, newStatus, extra);
      await addApprovalRecord(request.id, {
        stage: stageConfig.stage, decision,
        approverUid: currentUser.uid, approverName: actorName, jobTitle: actorJobTitle || '',
        signature, comment,
      });
      await addHistoryEntry(request.id, {
        userId: currentUser.uid, userName: actorName, role: stageConfig.role,
        action: decision === 'approve' ? 'approved_stage' : decision,
        previousStatus, newStatus, notes: comment,
      });
      if (decision === 'approve' && budgetExceeded) {
        await addHistoryEntry(request.id, {
          userId: currentUser.uid, userName: actorName, role: stageConfig.role,
          action: 'budget_exception', previousStatus, newStatus, notes: t('purchasing.budgetExceptionLogNote'),
        });
      }

      if (decision === 'approve') {
        if (newStatus === STATUS.APPROVED) {
          await notify({ targetRole: ROLES.PROCUREMENT_MANAGER, type: 'approved', requestId: request.id, requestNumber: request.requestNumber, title: t('purchasing.notifApprovedTitle'), message: request.projectName });
        } else {
          const nextStage = APPROVAL_STAGES.find(s => s.status === newStatus);
          if (nextStage) {
            await notify({ targetRole: nextStage.role, type: 'stage_pending', requestId: request.id, requestNumber: request.requestNumber, title: t('purchasing.notifPendingApprovalTitle'), message: request.projectName });
          }
        }
      } else {
        await notify({ targetUid: request.requesterUid, type: decision === 'reject' ? 'rejected' : 'returned', requestId: request.id, requestNumber: request.requestNumber, title: decision === 'reject' ? t('purchasing.notifRejectedTitle') : t('purchasing.notifReturnedTitle'), message: comment });
      }
    } catch (e) {
      setError(e.message || t('purchasing.actionFailed'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-[#c8a96e]/25 rounded-2xl p-5 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Info size={14} className="text-[#c8a96e]" />{t('purchasing.approvalActionTitle')}</h3>
      {error && <div className="rounded-lg px-3 py-2 text-xs bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}
      {budgetExceeded && (
        <div className="rounded-lg px-3 py-2.5 text-xs bg-amber-500/10 border border-amber-500/25 text-amber-300 space-y-2">
          <p className="flex items-center gap-1.5 font-bold"><AlertTriangle size={13} /> {t('purchasing.budgetExceededWarning')}</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={budgetAck} onChange={e => setBudgetAck(e.target.checked)} />
            {t('purchasing.budgetAckCheckbox')}
          </label>
        </div>
      )}
      {isEngineerStage && (
        <div>
          <label className="text-xs text-white/40 block mb-1.5">{t('purchasing.editQuantitiesLabel')}</label>
          <ItemsTable items={items} onChange={setItems} />
        </div>
      )}
      <div>
        <label className="text-xs text-white/40 block mb-1.5">{t('purchasing.commentLabel')}</label>
        <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none resize-none" />
      </div>
      <div>
        <label className="text-xs text-white/40 block mb-1.5">{t('purchasing.signatureLabel')}</label>
        <SignaturePad onChange={setSignature} defaultName={actorName} />
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" disabled={!!busy || (budgetExceeded && !budgetAck)} onClick={() => decide('approve')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-all disabled:opacity-50">
          {busy === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} {isEngineerStage ? t('purchasing.actionApproveAndSend') : t('purchasing.actionApprove')}
        </button>
        <button type="button" disabled={!!busy} onClick={() => decide('reject')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all disabled:opacity-50">
          {busy === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} {t('purchasing.actionReject')}
        </button>
        <button type="button" disabled={!!busy} onClick={() => decide('return')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all disabled:opacity-50">
          {busy === 'return' ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} {t('purchasing.actionReturn')}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Procurement pipeline panel ─────────────────────────── */
function ProcurementPanel({ request, currentUser, actorName }) {
  const { t, isRTL } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const markDelivered = async () => {
    setError('');
    setBusy(true);
    try {
      await applyStatusChange(request.id, STATUS.DELIVERED_PENDING);
      await addHistoryEntry(request.id, { userId: currentUser.uid, userName: actorName, role: ROLES.PROCUREMENT_MANAGER, action: 'status_changed', previousStatus: request.status, newStatus: STATUS.DELIVERED_PENDING, notes: '' });
      await notify({ targetRole: ROLES.PROCUREMENT_MANAGER, type: 'delivered_pending', requestId: request.id, requestNumber: request.requestNumber, title: t('purchasing.notifDeliveredPendingTitle'), message: request.projectName });
    } catch (e) {
      setError(e.message || t('purchasing.actionFailed'));
    } finally { setBusy(false); }
  };

  if (request.status === STATUS.APPROVED) {
    return (
      <ActionBox icon={ShoppingCart} title={t('purchasing.procurementStageTitle')} desc={t('purchasing.startRFQDesc')} isRTL={isRTL}>
        <Link href={`/admin/purchasing/rfq/${request.id}`} className="purch-btn-gold">{t('purchasing.createRFQ')}</Link>
      </ActionBox>
    );
  }
  if (request.status === STATUS.RFQ_REQUESTED || request.status === STATUS.QUOTATIONS_RECEIVED) {
    return (
      <ActionBox icon={ShoppingCart} title={t('purchasing.procurementStageTitle')} desc={t('purchasing.manageRFQDesc')} isRTL={isRTL}>
        <Link href={`/admin/purchasing/rfq/${request.id}`} className="purch-btn-gold">{t('purchasing.manageRFQ')}</Link>
      </ActionBox>
    );
  }
  if (request.status === STATUS.PO_ISSUED) {
    return (
      <ActionBox icon={Truck} title={t('purchasing.procurementStageTitle')} desc={t('purchasing.markDeliveredDesc')} isRTL={isRTL}>
        {error && <div className="rounded-lg px-3 py-2 text-xs bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}
        <div className="flex gap-2">
          {request.purchaseOrderId && (
            <Link href={`/admin/purchasing/orders/${request.purchaseOrderId}`} className="purch-btn-outline">{t('purchasing.viewPO')}</Link>
          )}
          <button type="button" disabled={busy} onClick={markDelivered} className="purch-btn-gold">
            {busy ? <Loader2 size={14} className="animate-spin" /> : t('purchasing.actionMarkDelivered')}
          </button>
        </div>
      </ActionBox>
    );
  }
  return null;
}

function ActionBox({ icon: Icon, title, desc, children, isRTL }) {
  return (
    <div className="bg-white/[0.03] border border-[#c8a96e]/25 rounded-2xl p-5 space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Icon size={14} className="text-[#c8a96e]" />{title}</h3>
      <p className="text-xs text-white/40">{desc}</p>
      {children}
    </div>
  );
}

/* ─────────────────────────── Warehouse receiving panel ─────────────────────────── */
function ReceivingPanel({ request, currentUser, actorName }) {
  const { t, isRTL } = useLanguage();
  const [rows, setRows] = useState(() => (request.items || []).map(it => ({ itemId: it.id, orderedQty: it.quantity, receivedQty: it.quantity, shortageQty: 0, notes: '' })));
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const updateRow = (idx, field, val) => setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: val } : row));

  const confirmReceipt = async () => {
    setError('');
    setBusy(true);
    try {
      await addDoc(collection(db, 'warehouseReceipts'), {
        requestId: request.id, poId: request.purchaseOrderId || null,
        receivedByUid: currentUser.uid, receivedByName: actorName,
        receivedAt: serverTimestamp(), items: rows, photos, confirmed: true, allocatedToProject: true,
      });
      await Promise.all(rows.map((row, idx) => {
        const itemName = request.items[idx]?.itemName;
        const qty = Number(row.receivedQty) || 0;
        if (!itemName || qty <= 0) return Promise.resolve();
        return setDoc(doc(db, 'warehouseStock', stockKeyFor(itemName)), {
          itemName, unit: request.items[idx]?.unit || '', quantityOnHand: increment(qty), updatedAt: serverTimestamp(),
        }, { merge: true });
      }));
      await applyStatusChange(request.id, STATUS.RECEIVED);
      await addHistoryEntry(request.id, { userId: currentUser.uid, userName: actorName, role: ROLES.PROCUREMENT_MANAGER, action: 'received', previousStatus: request.status, newStatus: STATUS.RECEIVED, notes: '' });
      await notify({ targetUid: request.requesterUid, type: 'received', requestId: request.id, requestNumber: request.requestNumber, title: t('purchasing.notifReceivedTitle'), message: request.projectName });
    } catch (e) {
      setError(e.message || t('purchasing.actionFailed'));
    } finally { setBusy(false); }
  };

  return (
    <ActionBox icon={PackageCheck} title={t('purchasing.warehouseReceivingTitle')} desc={t('purchasing.warehouseReceivingDesc')} isRTL={isRTL}>
      {error && <div className="rounded-lg px-3 py-2 text-xs bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={row.itemId} className="grid grid-cols-3 gap-2 items-center bg-white/[0.02] rounded-lg p-2">
            <span className="text-xs text-white/60 truncate">{request.items[idx]?.itemName}</span>
            <input type="number" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" placeholder={t('purchasing.receivedQty')}
              value={row.receivedQty} onChange={e => updateRow(idx, 'receivedQty', e.target.value)} />
            <input type="number" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" placeholder={t('purchasing.shortageQty')}
              value={row.shortageQty} onChange={e => updateRow(idx, 'shortageQty', e.target.value)} />
          </div>
        ))}
      </div>
      <AttachmentsUploader pathPrefix={`warehouseReceipts/${request.id}`} attachments={photos} onChange={setPhotos} />
      <button type="button" disabled={busy} onClick={confirmReceipt} className="purch-btn-gold w-full justify-center">
        {busy ? <Loader2 size={14} className="animate-spin" /> : t('purchasing.confirmReceipt')}
      </button>
    </ActionBox>
  );
}

function CompletionPanel({ request, currentUser, actorName, role, canComplete, canArchive }) {
  const { t, isRTL } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const advance = async (newStatus, action) => {
    setError('');
    setBusy(true);
    try {
      const extra = newStatus === STATUS.COMPLETED ? { completedAt: serverTimestamp() } : {};
      await applyStatusChange(request.id, newStatus, extra);
      await addHistoryEntry(request.id, { userId: currentUser.uid, userName: actorName, role, action, previousStatus: request.status, newStatus, notes: '' });
      if (newStatus === STATUS.COMPLETED) {
        await notify({ targetUid: request.requesterUid, type: 'completed', requestId: request.id, requestNumber: request.requestNumber, title: t('purchasing.notifCompletedTitle'), message: request.projectName });
      }
    } catch (e) {
      setError(e.message || t('purchasing.actionFailed'));
    } finally { setBusy(false); }
  };

  if (canComplete && request.status === STATUS.RECEIVED) {
    return (
      <ActionBox icon={PackageCheck} title={t('purchasing.closeRequestTitle')} desc={t('purchasing.closeRequestDesc')} isRTL={isRTL}>
        {error && <div className="rounded-lg px-3 py-2 text-xs bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}
        <button disabled={busy} onClick={() => advance(STATUS.COMPLETED, 'completed')} className="purch-btn-gold">
          {busy ? <Loader2 size={14} className="animate-spin" /> : t('purchasing.actionComplete')}
        </button>
      </ActionBox>
    );
  }
  if (canArchive && request.status === STATUS.COMPLETED) {
    return (
      <ActionBox icon={ArchiveIcon} title={t('purchasing.archiveTitle')} desc={t('purchasing.archiveDesc')} isRTL={isRTL}>
        {error && <div className="rounded-lg px-3 py-2 text-xs bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}
        <button disabled={busy} onClick={() => advance(STATUS.ARCHIVED, 'archived')} className="purch-btn-outline">
          {busy ? <Loader2 size={14} className="animate-spin" /> : t('purchasing.actionArchive')}
        </button>
      </ActionBox>
    );
  }
  return null;
}

/* ─────────────────────────── Page ─────────────────────────── */
function RequestDetailContent({ id }) {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { role, profile, isRole } = usePurchasingRole();
  const [request, setRequest] = useState(undefined);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'purchaseRequests', id), snap => setRequest(snap.exists() ? { id: snap.id, ...snap.data() } : null));
    return unsub;
  }, [id]);

  const actorName = profile?.name || user?.displayName || user?.email || '—';

  const stageConfig = useMemo(() => {
    if (!request) return null;
    return APPROVAL_STAGES.find(s => s.status === request.status) || null;
  }, [request]);

  if (request === undefined) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-[#c8a96e]" /></div>;
  if (request === null) return <div className="flex items-center justify-center min-h-[60vh] text-white/40">{t('admin.noResults')}</div>;

  const canActApproval = stageConfig && isRole(stageConfig.role, ROLES.SUPER_ADMIN);
  const canActProcurement = isRole(ROLES.PROCUREMENT_MANAGER, ROLES.SUPER_ADMIN);
  const canActWarehouse = isRole(ROLES.PROCUREMENT_MANAGER, ROLES.SUPER_ADMIN) && request.status === STATUS.DELIVERED_PENDING;
  // Matches firestore.rules exactly: procurement_manager (or super_admin) owns the entire
  // post-approval pipeline now that store_keeper/procurement_officer no longer exist.
  const canCompleteReceived = isRole(ROLES.PROCUREMENT_MANAGER, ROLES.SUPER_ADMIN) && request.status === STATUS.RECEIVED;
  const canArchiveCompleted = isRole(ROLES.PROCUREMENT_MANAGER, ROLES.SUPER_ADMIN) && request.status === STATUS.COMPLETED;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`.purch-btn-gold{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:12px;font-size:12px;font-weight:800;background:linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e);color:#000;transition:opacity .2s} .purch-btn-gold:disabled{opacity:.5} .purch-btn-outline{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:12px;font-size:12px;font-weight:700;border:1px solid rgba(200,169,110,0.35);color:#c8a96e}`}</style>
      <style media="print">{`
        body * { visibility: hidden; }
        #purchasing-request-print-area, #purchasing-request-print-area * { visibility: visible; }
        #purchasing-request-print-area { position: absolute; inset: 0; width: 100%; }
        .no-print { display: none !important; }
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white" dir="ltr">{request.requestNumber}</h1>
          <p className="text-sm text-white/40 mt-1">{request.projectName} · {request.siteName}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <PurchaseStatusBadge status={request.status} />
          <button onClick={() => exportWord(`request-${request.requestNumber}`, document.getElementById('purchasing-request-print-area')?.innerHTML || '')}
            className="purch-btn-outline text-xs"><FileText size={13} /> Word</button>
          <button onClick={exportPDF} className="purch-btn-outline text-xs"><Printer size={13} /> PDF</button>
        </div>
      </div>

      <div id="purchasing-request-print-area" className="space-y-6">
      <PurchasingReportHeader title={request.requestNumber} subtitle={`${request.projectName} · ${request.siteName}`} />
      {/* Header info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
        <Info2 label={t('purchasing.requesterName')} value={request.requesterName} />
        <Info2 label={t('purchasing.requesterPhone')} value={request.requesterPhone} dir="ltr" />
        <Info2 label={t('purchasing.requesterEmail')} value={request.requesterEmail} dir="ltr" />
        <Info2 label={t('purchasing.jobTitle')} value={request.jobTitle} />
        <Info2 label={t('purchasing.department')} value={request.department} />
        <Info2 label={t('purchasing.priority')} value={t(PRIORITY_LABEL_KEYS[request.priority])} />
        <Info2 label={t('purchasing.projectCode')} value={request.projectCode || '—'} />
        <Info2 label={t('admin.submittedCol')} value={fmtDate(request.requestDate)} dir="ltr" />
        <Info2 label={t('purchasing.kpiTotalValue')} value={Number(request.totalEstimatedCost || 0).toLocaleString()} dir="ltr" />
      </div>

      <BudgetWidget projectName={request.projectName} />

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
        <p className="text-xs text-[#c8a96e] font-bold uppercase tracking-widest mb-1.5">{t('purchasing.requestReason')}</p>
        <p className="text-sm text-white/70">{request.reason}</p>
        {request.generalNotes && <>
          <p className="text-xs text-[#c8a96e] font-bold uppercase tracking-widest mt-3 mb-1.5">{t('purchasing.generalNotes')}</p>
          <p className="text-sm text-white/60">{request.generalNotes}</p>
        </>}
      </div>

      {/* Items */}
      <div>
        <p className="text-xs text-[#c8a96e] font-bold uppercase tracking-widest mb-2">{t('purchasing.itemsTableTitle')}</p>
        <ItemsTable items={request.items || []} onChange={() => {}} readOnly />
      </div>

      {/* Attachments */}
      {request.attachments?.length > 0 && (
        <div>
          <p className="text-xs text-[#c8a96e] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"><Paperclip size={12} />{t('purchasing.attachments')}</p>
          <AttachmentsUploader pathPrefix="" attachments={request.attachments} onChange={() => {}} disabled />
        </div>
      )}

      {/* Actions (excluded from print/export output — no-print) */}
      <div className="no-print space-y-6">
        {canActApproval && <ApprovalActionPanel request={request} stageConfig={stageConfig} currentUser={user} actorName={actorName} actorJobTitle={profile?.jobTitle} />}
        {canActProcurement && <ProcurementPanel request={request} currentUser={user} actorName={actorName} />}
        {canActWarehouse && <ReceivingPanel request={request} currentUser={user} actorName={actorName} />}
        {(canCompleteReceived || canArchiveCompleted) && (
          <CompletionPanel request={request} currentUser={user} actorName={actorName} role={role} canComplete={canCompleteReceived} canArchive={canArchiveCompleted} />
        )}
      </div>

      {/* History — includes full approval chain with signatures (Executive Reports requirement) */}
      <div>
        <p className="text-xs text-[#c8a96e] font-bold uppercase tracking-widest mb-3">{t('purchasing.activityLog')}</p>
        <ApprovalTimeline requestId={request.id} />
      </div>
      </div>
    </div>
  );
}

function Info2({ label, value, dir }) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-white/80" dir={dir}>{value || '—'}</p>
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><RequestDetailContent id={id} /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
