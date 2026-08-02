// Firestore repository for the `costReports` collection — an append-only log
// of every calculation run through the internal cost calculator, so managers
// can look back at what was estimated for a project without redoing the math.
import {
  collection, addDoc, doc, getDoc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'costReports';

export async function createCostReport(data) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCostReportById(id) {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function subscribeCostReports(callback) {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('subscribeCostReports failed:', err);
  });
}
