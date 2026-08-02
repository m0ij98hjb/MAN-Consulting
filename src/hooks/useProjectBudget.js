'use client';
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { projectKeyFor, computeBudgetSummary } from '@/lib/purchasingBudget';

/** Live budget summary (approved/committed/actual/remaining) for a given project name. */
export function useProjectBudget(projectName) {
  const [budgetDoc, setBudgetDoc] = useState(undefined);
  const [requests, setRequests] = useState(null);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!projectName) return;
    const key = projectKeyFor(projectName);
    const unsub = onSnapshot(doc(db, 'projectBudgets', key), snap => setBudgetDoc(snap.exists() ? snap.data() : null));
    return unsub;
  }, [projectName]);

  useEffect(() => {
    if (!projectName) return;
    const q = query(collection(db, 'purchaseRequests'), where('projectName', '==', projectName));
    const unsub = onSnapshot(q, snap => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [projectName]);

  useEffect(() => {
    if (!projectName) return;
    const q = query(collection(db, 'purchaseOrders'), where('projectName', '==', projectName));
    const unsub = onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [projectName]);

  const loading = budgetDoc === undefined || requests === null || orders === null;
  const summary = loading ? null : computeBudgetSummary({ approvedBudget: budgetDoc?.approvedBudget, projectRequests: requests, projectOrders: orders });

  return { loading, hasBudget: !!budgetDoc, summary };
}
