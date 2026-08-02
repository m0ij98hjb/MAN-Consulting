'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  doc, onSnapshot, setDoc, collection, serverTimestamp, increment, addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import SupplierPerformanceBadge from '@/components/purchasing/SupplierPerformanceBadge';
import { ROLES, STATUS } from '@/lib/purchasingConfig';
import { applyStatusChange, addHistoryEntry, notify, nextPONumber } from '@/lib/purchasingApi';
import { stockKeyFor, checkAvailability, anyStockAvailable } from '@/lib/purchasingWarehouse';
import { computeAllSupplierPerformance, BADGES } from '@/lib/purchasingSupplierPerformance';
import { Loader2, Send, Star, Trophy, ArrowLeft, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const WarehouseAvailabilityModal = dynamic(() => import('@/components/purchasing/WarehouseAvailabilityModal'), { ssr: false });

function RFQContent({ requestId }) {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = usePurchasingRole();
  const actorName = profile?.name || user?.displayName || user?.email || '—';

  const [request, setRequest] = useState(undefined);
  const [rfq, setRfq] = useState(undefined);
  const [quotations, setQuotations] = useState({});
  const [suppliers, setSuppliers] = useState(null);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stockMap, setStockMap] = useState({});
  const [availabilityModal, setAvailabilityModal] = useState(null); // { supplierId, availability } | null
  const [performance, setPerformance] = useState({});

  useEffect(() => { computeAllSupplierPerformance().then(setPerformance); }, []);

  useEffect(() => {
    const u1 = onSnapshot(doc(db, 'purchaseRequests', requestId), s => setRequest(s.exists() ? { id: s.id, ...s.data() } : null));
    const u2 = onSnapshot(doc(db, 'purchaseRFQs', requestId), s => setRfq(s.exists() ? { id: s.id, ...s.data() } : null));
    const u3 = onSnapshot(collection(db, 'purchasingSuppliers'), snap => setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u4 = onSnapshot(collection(db, 'warehouseStock'), snap => {
      const map = {}; snap.docs.forEach(d => { map[d.id] = d.data(); }); setStockMap(map);
    });
    return () => { u1(); u2(); u3(); u4(); };
  }, [requestId]);

  useEffect(() => {
    if (!rfq) return;
    const unsub = onSnapshot(collection(db, 'purchaseRFQs', requestId, 'quotations'), snap => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
      setQuotations(map);
    });
    return unsub;
  }, [rfq, requestId]);

  const sendRFQ = async () => {
    setError('');
    if (selectedSupplierIds.length === 0) { setError(t('purchasing.selectAtLeastOneSupplier')); return; }
    setBusy(true);
    try {
      await setDoc(doc(db, 'purchaseRFQs', requestId), {
        requestId, requestNumber: request.requestNumber, supplierIds: selectedSupplierIds,
        items: request.items, sentAt: serverTimestamp(), dueDate: dueDate || null, status: 'sent',
      });
      await applyStatusChange(requestId, STATUS.RFQ_REQUESTED);
      await addHistoryEntry(requestId, { userId: user.uid, userName: actorName, role: ROLES.PROCUREMENT_OFFICER, action: 'rfq_sent', previousStatus: STATUS.APPROVED, newStatus: STATUS.RFQ_REQUESTED, notes: `${selectedSupplierIds.length} ${t('purchasing.suppliersMenu')}` });
    } catch (e) {
      setError(e.message);
    } finally { setBusy(false); }
  };

  const saveQuotation = async (supplierId, supplierName, data) => {
    setError('');
    try {
      await setDoc(doc(db, 'purchaseRFQs', requestId, 'quotations', supplierId), {
        supplierId, supplierName, ...data, submittedAt: serverTimestamp(),
      }, { merge: true });
      if (request.status === STATUS.RFQ_REQUESTED) {
        await applyStatusChange(requestId, STATUS.QUOTATIONS_RECEIVED);
        await addHistoryEntry(requestId, { userId: user.uid, userName: actorName, role: ROLES.PROCUREMENT_OFFICER, action: 'quotation_added', previousStatus: STATUS.RFQ_REQUESTED, newStatus: STATUS.QUOTATIONS_RECEIVED, notes: supplierName });
      }
      return true;
    } catch (e) {
      setError(e.message || t('purchasing.actionFailed'));
      return false;
    }
  };

  const selectWinner = (supplierId) => {
    const availability = checkAvailability(request.items, stockMap);
    if (anyStockAvailable(availability)) {
      setAvailabilityModal({ supplierId, availability });
    } else {
      finalizeSelectWinner(supplierId, []);
    }
  };

  const finalizeSelectWinner = async (supplierId, issuePlan) => {
    const q = quotations[supplierId];
    if (!q) return;
    setBusy(true);
    setError('');
    try {
      const issuedItems = (issuePlan || []).filter(a => a.issueQty > 0);
      if (issuedItems.length > 0) {
        await Promise.all(issuedItems.map(a => setDoc(doc(db, 'warehouseStock', stockKeyFor(a.itemName)), {
          quantityOnHand: increment(-a.issueQty), updatedAt: serverTimestamp(),
        }, { merge: true })));
        await addDoc(collection(db, 'warehouseIssues'), {
          requestId, requestNumber: request.requestNumber, items: issuedItems,
          issuedByUid: user.uid, issuedByName: actorName, issuedAt: serverTimestamp(),
        });
      }

      const issuedMap = Object.fromEntries(issuedItems.map(a => [a.itemId, a.issueQty]));
      const remainingItems = request.items
        .map(it => ({ ...it, quantity: (Number(it.quantity) || 0) - (issuedMap[it.id] || 0) }))
        .filter(it => it.quantity > 0);

      setAvailabilityModal(null);

      if (remainingItems.length === 0) {
        // Fully covered by existing warehouse stock — no purchase needed.
        await setDoc(doc(db, 'purchaseRFQs', requestId, 'quotations', supplierId), { selected: true }, { merge: true });
        await applyStatusChange(requestId, STATUS.DELIVERED_PENDING);
        await addHistoryEntry(requestId, { userId: user.uid, userName: actorName, role: ROLES.PROCUREMENT_OFFICER, action: 'fulfilled_from_warehouse', previousStatus: STATUS.QUOTATIONS_RECEIVED, newStatus: STATUS.DELIVERED_PENDING, notes: t('purchasing.fulfilledFromWarehouseNote') });
        await notify({ targetRole: ROLES.STORE_KEEPER, type: 'delivered_pending', requestId, requestNumber: request.requestNumber, title: t('purchasing.notifDeliveredPendingTitle'), message: request.projectName });
        router.push(`/admin/purchasing/requests/${requestId}`);
        return;
      }

      const poNumber = await nextPONumber();
      const poRef = doc(collection(db, 'purchaseOrders'));
      await setDoc(poRef, {
        poNumber, requestId, requestNumber: request.requestNumber, projectName: request.projectName,
        supplierId, supplierName: q.supplierName, items: remainingItems, totalValue: Number(q.price) || request.totalEstimatedCost,
        issuedByUid: user.uid, issuedByName: actorName, issuedAt: serverTimestamp(), status: 'issued', attachments: q.attachments || [],
        warehouseIssuedItems: issuedItems.length > 0 ? issuedItems : null,
      });
      await setDoc(doc(db, 'purchaseRFQs', requestId, 'quotations', supplierId), { selected: true }, { merge: true });
      await applyStatusChange(requestId, STATUS.PO_ISSUED, { purchaseOrderId: poRef.id });
      await addHistoryEntry(requestId, { userId: user.uid, userName: actorName, role: ROLES.PROCUREMENT_OFFICER, action: 'po_issued', previousStatus: STATUS.QUOTATIONS_RECEIVED, newStatus: STATUS.PO_ISSUED, notes: `${q.supplierName} — ${poNumber}` });
      await notify({ targetUid: request.requesterUid, type: 'po_issued', requestId, requestNumber: request.requestNumber, title: t('purchasing.notifPOIssuedTitle'), message: poNumber });
      router.push(`/admin/purchasing/orders/${poRef.id}`);
    } catch (e) {
      setError(e.message);
    } finally { setBusy(false); }
  };

  if (request === undefined || suppliers === null) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-[#c8a96e]" /></div>;
  if (request === null) return <div className="text-center text-white/40 py-20">{t('admin.noResults')}</div>;

  const canManage = request.status === STATUS.APPROVED || request.status === STATUS.RFQ_REQUESTED || request.status === STATUS.QUOTATIONS_RECEIVED;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{t('purchasing.rfqTitle')}</h1>
          <p className="text-sm text-white/40 mt-1" dir="ltr">{request.requestNumber} · {request.projectName}</p>
        </div>
        <Link href={`/admin/purchasing/requests/${requestId}`} className="text-xs text-[#c8a96e] hover:underline flex items-center gap-1">
          {isRTL ? <ArrowRight size={12} /> : <ArrowLeft size={12} />} {t('purchasing.backToRequest')}
        </Link>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}

      {!rfq ? (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">{t('purchasing.selectSuppliersTitle')}</h2>
          {suppliers.length === 0 ? (
            <p className="text-white/30 text-sm">{t('purchasing.noSuppliersYet')} — <Link href="/admin/purchasing/suppliers" className="text-[#c8a96e] hover:underline">{t('purchasing.addSupplierLink')}</Link></p>
          ) : (() => {
            const categories = [...new Set((request.items || []).map(it => it.category).filter(Boolean))];
            const matches = (s) => categories.some(c => (s.specialty || '').toLowerCase().includes(c.replace(/_/g, ' ')) || c.includes((s.specialty || '').toLowerCase().replace(/\s+/g, '_')));
            const recommended = suppliers.filter(matches);
            const bestPriceId = recommended.length ? [...recommended].sort((a, b) => (performance[b.id]?.priceCompetitiveness || 0) - (performance[a.id]?.priceCompetitiveness || 0))[0].id : null;
            const fastestId = recommended.length ? [...recommended].sort((a, b) => (performance[b.id]?.deliverySpeedScore || 0) - (performance[a.id]?.deliverySpeedScore || 0))[0].id : null;
            const qualityId = recommended.length ? [...recommended].sort((a, b) => (performance[b.id]?.qualityScore || 0) - (performance[a.id]?.qualityScore || 0))[0].id : null;
            const sorted = [...suppliers].sort((a, b) => {
              const am = matches(a) ? 1 : 0, bm = matches(b) ? 1 : 0;
              if (am !== bm) return bm - am;
              return (performance[b.id]?.overallScore || 0) - (performance[a.id]?.overallScore || 0);
            });
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sorted.map(s => {
                  const perf = performance[s.id];
                  const poor = perf?.badge === BADGES.WATCHLIST || perf?.badge === BADGES.BLACKLISTED;
                  return (
                    <label key={s.id} className="flex flex-col gap-1.5 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 cursor-pointer hover:border-[#c8a96e]/30">
                      <div className="flex items-center gap-2.5">
                        <input type="checkbox" checked={selectedSupplierIds.includes(s.id)}
                          onChange={e => setSelectedSupplierIds(ids => e.target.checked ? [...ids, s.id] : ids.filter(x => x !== s.id))} />
                        <span className="text-sm text-white/70">{s.name}</span>
                        <span className="text-xs text-white/30 ms-auto">{s.specialty}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap ps-6">
                        {perf && <SupplierPerformanceBadge badge={perf.badge} score={perf.overallScore} />}
                        {s.id === bestPriceId && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c8a96e]/15 text-[#c8a96e] border border-[#c8a96e]/30"><Sparkles size={9} />{t('purchasing.tagBestPrice')}</span>}
                        {s.id === fastestId && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"><Sparkles size={9} />{t('purchasing.tagFastestDelivery')}</span>}
                        {s.id === qualityId && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30"><Sparkles size={9} />{t('purchasing.tagHighestQuality')}</span>}
                        {poor && <span className="inline-flex items-center gap-1 text-[10px] text-red-400"><AlertTriangle size={10} />{t('purchasing.poorPerformanceWarning')}</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            );
          })()}
          <div>
            <label className="text-xs text-white/40 block mb-1.5">{t('purchasing.rfqDueDate')}</label>
            <input type="date" dir="ltr" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
          </div>
          <button onClick={sendRFQ} disabled={busy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {t('purchasing.sendRFQ')}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07]"><h2 className="text-sm font-bold text-white">{t('purchasing.quotationComparisonTitle')}</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {[t('purchasing.colSupplier'), t('purchasing.colPrice'), t('purchasing.colDeliveryTime'), t('purchasing.colWarranty'), t('purchasing.colQuality'), t('purchasing.colRating'), t('admin.actionsCol')].map(h => (
                      <th key={h} className="text-start text-white/30 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {rfq.supplierIds.map(sid => {
                    const supplier = suppliers.find(s => s.id === sid);
                    const q = quotations[sid];
                    return (
                      <QuotationRow key={sid} supplierId={sid} supplierName={supplier?.name || sid}
                        quotation={q} onSave={data => saveQuotation(sid, supplier?.name || sid, data)}
                        onSelectWinner={() => selectWinner(sid)} canManage={canManage} busy={busy}
                        requestId={requestId} t={t} />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {availabilityModal && (
        <WarehouseAvailabilityModal
          availability={availabilityModal.availability}
          busy={busy}
          onClose={() => setAvailabilityModal(null)}
          onConfirm={issuePlan => finalizeSelectWinner(availabilityModal.supplierId, issuePlan)}
        />
      )}
    </div>
  );
}

function QuotationRow({ supplierId, supplierName, quotation, onSave, onSelectWinner, canManage, busy, requestId, t }) {
  const [editing, setEditing] = useState(!quotation);
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState(quotation?.price || '');
  const [deliveryTime, setDeliveryTime] = useState(quotation?.deliveryTime || '');
  const [warranty, setWarranty] = useState(quotation?.warranty || '');
  const [qualityNotes, setQualityNotes] = useState(quotation?.qualityNotes || '');
  const [rating, setRating] = useState(quotation?.rating || '');

  const save = async () => {
    setSaving(true);
    const ok = await onSave({ price, deliveryTime, warranty, qualityNotes, rating, attachments: quotation?.attachments || [] });
    setSaving(false);
    if (ok) setEditing(false);
  };

  if (editing || !quotation) {
    return (
      <tr>
        <td className="px-4 py-3 text-white font-medium">{supplierName}</td>
        <td className="px-4 py-2"><input className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={price} onChange={e => setPrice(e.target.value)} dir="ltr" /></td>
        <td className="px-4 py-2"><input className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} /></td>
        <td className="px-4 py-2"><input className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={warranty} onChange={e => setWarranty(e.target.value)} /></td>
        <td className="px-4 py-2"><input className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={qualityNotes} onChange={e => setQualityNotes(e.target.value)} /></td>
        <td className="px-4 py-2"><input type="number" min="0" max="5" className="w-14 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={rating} onChange={e => setRating(e.target.value)} dir="ltr" /></td>
        <td className="px-4 py-2">
          <button onClick={save} disabled={saving} className="text-[#c8a96e] text-xs font-bold hover:underline disabled:opacity-50">{t('purchasing.saveQuotation')}</button>
        </td>
      </tr>
    );
  }

  return (
    <tr className={quotation?.selected ? 'bg-green-500/[0.06]' : ''}>
      <td className="px-4 py-3 text-white font-medium flex items-center gap-1.5">
        {quotation?.selected && <Trophy size={12} className="text-green-400" />} {supplierName}
      </td>
      <td className="px-4 py-3 text-white/70" dir="ltr">{quotation.price}</td>
      <td className="px-4 py-3 text-white/70">{quotation.deliveryTime}</td>
      <td className="px-4 py-3 text-white/70">{quotation.warranty}</td>
      <td className="px-4 py-3 text-white/70">{quotation.qualityNotes}</td>
      <td className="px-4 py-3 text-white/70 flex items-center gap-1"><Star size={11} className="text-amber-400" />{quotation.rating || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(true)} className="text-white/40 hover:text-white text-xs">{t('purchasing.editQuotation')}</button>
          {canManage && !quotation.selected && (
            <button onClick={onSelectWinner} disabled={busy} className="text-green-400 text-xs font-bold hover:underline disabled:opacity-50">{t('purchasing.selectWinner')}</button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function RFQPage() {
  const { requestId } = useParams();
  return (
    <PurchasingAccessGate allow={['procurement_officer', 'procurement_manager']}>
      <AdminPageLayout><RFQContent requestId={requestId} /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
