import {
  doc, updateDoc, runTransaction, collection, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function applyStatusChange(requestId, newStatus, extra = {}) {
  return updateDoc(doc(db, 'purchaseRequests', requestId), {
    status: newStatus,
    updatedAt: serverTimestamp(),
    ...extra,
  });
}

async function nextSequence(field) {
  const counterRef = doc(db, 'purchasingMeta', 'counters');
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? (snap.data()[field] || 0) : 0;
    const next = current + 1;
    tx.set(counterRef, { [field]: next }, { merge: true });
    return next;
  });
}

export async function nextRequestNumber() {
  const seq = await nextSequence('requestSeq');
  return `PR-${String(seq).padStart(6, '0')}`;
}

export async function nextPONumber() {
  const seq = await nextSequence('poSeq');
  return `PO-${String(seq).padStart(6, '0')}`;
}

export async function addHistoryEntry(requestId, entry) {
  return addDoc(collection(db, 'purchaseRequests', requestId, 'history'), {
    ...entry,
    timestamp: serverTimestamp(),
  });
}

export async function addApprovalRecord(requestId, record) {
  return addDoc(collection(db, 'purchaseRequests', requestId, 'approvals'), {
    ...record,
    decidedAt: serverTimestamp(),
  });
}

export async function notify({ targetRole, targetUid, type, requestId, requestNumber, title, message }) {
  return addDoc(collection(db, 'purchaseNotifications'), {
    targetRole: targetRole || null,
    targetUid: targetUid || null,
    type, requestId, requestNumber, title, message,
    read: false,
    createdAt: serverTimestamp(),
  });
}
