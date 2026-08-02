'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { usePurchasingRole } from './usePurchasingRole';

/**
 * Independent from the site's existing NotificationsContext (suppliers/jobs/contacts) —
 * this purchasing module keeps its own notification collection and feed.
 */
export function usePurchaseNotifications() {
  const { user } = useAuth();
  const { role } = usePurchasingRole();
  const [byUid, setByUid] = useState([]);
  const [byRole, setByRole] = useState([]);

  useEffect(() => {
    if (!user) return; // no subscription needed; falls back to [] below
    const q = query(collection(db, 'purchaseNotifications'), where('targetUid', '==', user.uid));
    const unsub = onSnapshot(q, snap => setByUid(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!role) return; // no subscription needed; falls back to [] below
    const q = query(collection(db, 'purchaseNotifications'), where('targetRole', '==', role));
    const unsub = onSnapshot(q, snap => setByRole(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [role]);

  const notifications = [...(user ? byUid : []), ...(role ? byRole : [])]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback(async (id) => {
    await updateDoc(doc(db, 'purchaseNotifications', id), { read: true });
  }, []);

  return { notifications, unreadCount, markRead };
}
