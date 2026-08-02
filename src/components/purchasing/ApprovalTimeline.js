'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { STATUS_LABEL_KEYS, ROLE_LABEL_KEYS } from '@/lib/purchasingConfig';
import {
  Loader2, History, CheckCircle2, XCircle, RotateCcw, Send, FileSpreadsheet,
  ShoppingCart, Truck, PackageCheck, Archive as ArchiveIcon, AlertTriangle, Boxes,
} from 'lucide-react';

function fmtDate(ts) {
  if (!ts?.seconds) return '';
  return new Date(ts.seconds * 1000).toLocaleString('en-GB');
}

const ACTION_ICON = {
  approved_stage: { icon: CheckCircle2, cls: 'bg-green-500/15 border-green-500/40 text-green-400' },
  reject: { icon: XCircle, cls: 'bg-red-500/15 border-red-500/40 text-red-400' },
  return: { icon: RotateCcw, cls: 'bg-amber-500/15 border-amber-500/40 text-amber-400' },
  rfq_sent: { icon: Send, cls: 'bg-blue-500/15 border-blue-500/40 text-blue-400' },
  quotation_added: { icon: FileSpreadsheet, cls: 'bg-teal-500/15 border-teal-500/40 text-teal-400' },
  po_issued: { icon: ShoppingCart, cls: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400' },
  status_changed: { icon: Truck, cls: 'bg-orange-500/15 border-orange-500/40 text-orange-400' },
  received: { icon: PackageCheck, cls: 'bg-lime-500/15 border-lime-500/40 text-lime-400' },
  completed: { icon: CheckCircle2, cls: 'bg-[#c8a96e]/15 border-[#c8a96e]/40 text-[#c8a96e]' },
  archived: { icon: ArchiveIcon, cls: 'bg-white/10 border-white/30 text-white/50' },
  budget_exception: { icon: AlertTriangle, cls: 'bg-red-500/15 border-red-500/40 text-red-400' },
  fulfilled_from_warehouse: { icon: Boxes, cls: 'bg-purple-500/15 border-purple-500/40 text-purple-400' },
};
const DEFAULT_ICON = { icon: History, cls: 'bg-[#c8a96e]/15 border-[#c8a96e]/40 text-[#c8a96e]' };
const APPROVAL_ACTIONS = ['approved_stage', 'reject', 'return'];

export default function ApprovalTimeline({ requestId }) {
  const { t, isRTL } = useLanguage();
  const [entries, setEntries] = useState(null);
  const [approvals, setApprovals] = useState(null);

  useEffect(() => {
    if (!requestId) return;
    const q = query(collection(db, 'purchaseRequests', requestId, 'history'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, snap => setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;
    const q = query(collection(db, 'purchaseRequests', requestId, 'approvals'), orderBy('decidedAt', 'asc'));
    const unsub = onSnapshot(q, snap => setApprovals(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [requestId]);

  // Approval-type history entries and the approvals subcollection are always written
  // back-to-back in the same order (see addApprovalRecord/addHistoryEntry call sites),
  // so the Nth approval-type entry pairs with the Nth approvals doc.
  const merged = useMemo(() => {
    if (!entries) return null;
    let cursor = 0;
    return entries.map(e => {
      if (APPROVAL_ACTIONS.includes(e.action) && approvals && approvals[cursor]) {
        return { ...e, signature: approvals[cursor].signature, jobTitle: approvals[cursor].jobTitle, _approvalCursor: cursor++ };
      }
      return e;
    });
  }, [entries, approvals]);

  if (merged === null) {
    return <div className="flex items-center justify-center py-6"><Loader2 size={18} className="animate-spin text-[#c8a96e]" /></div>;
  }
  if (merged.length === 0) {
    return <p className="text-white/25 text-sm text-center py-6">{t('purchasing.noHistoryYet')}</p>;
  }

  return (
    <div className="space-y-0" dir={isRTL ? 'rtl' : 'ltr'}>
      {merged.map((e, i) => {
        const { icon: Icon, cls } = ACTION_ICON[e.action] || DEFAULT_ICON;
        return (
          <div key={e.id} className="relative ps-7 pb-5 last:pb-0">
            {i < merged.length - 1 && (
              <span className="absolute top-4 bottom-0 start-[9px] w-px bg-white/10" />
            )}
            <span className={`absolute top-0.5 start-0 w-5 h-5 rounded-full border flex items-center justify-center ${cls}`}>
              <Icon size={11} />
            </span>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-white font-semibold">{e.userName || '—'}</p>
                <span className="text-[11px] text-white/30" dir="ltr">{fmtDate(e.timestamp)}</span>
              </div>
              <p className="text-[11px] text-white/35 mt-0.5">
                {e.role && ROLE_LABEL_KEYS[e.role] ? t(ROLE_LABEL_KEYS[e.role]) : ''}
                {e.jobTitle ? ` · ${e.jobTitle}` : ''}
              </p>
              {(e.previousStatus || e.newStatus) && (
                <p className="text-xs text-white/55 mt-1.5">
                  {e.previousStatus && STATUS_LABEL_KEYS[e.previousStatus] ? t(STATUS_LABEL_KEYS[e.previousStatus]) : '—'}
                  {' → '}
                  {e.newStatus && STATUS_LABEL_KEYS[e.newStatus] ? t(STATUS_LABEL_KEYS[e.newStatus]) : '—'}
                </p>
              )}
              {e.notes && <p className="text-xs text-white/45 mt-1.5 italic">&ldquo;{e.notes}&rdquo;</p>}
              {e.signature && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">{t('purchasing.signatureLabel')}:</span>
                  {e.signature.type === 'drawn' ? (
                    <img src={e.signature.value} alt="" className="h-8 bg-white/90 rounded px-1" />
                  ) : (
                    <span className="text-xs text-white/60 italic" style={{ fontFamily: 'cursive' }}>{e.signature.value}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
