'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BELL_KEY = 'mnc_admin_bell_opened_at';

const getBellTime = () => {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(BELL_KEY) || 0);
};

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [suppliers, setSuppliers] = useState([]);
  const [jobs, setJobs]           = useState([]);
  const [contacts, setContacts]   = useState([]);
  const [bellOpenedAt, setBellOpenedAt] = useState(0);

  useEffect(() => {
    queueMicrotask(() => setBellOpenedAt(getBellTime()));
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'suppliers'), snap => {
      setSuppliers(
        snap.docs
          .map(d => ({ id: d.id, type: 'supplier', ...d.data() }))
          .filter(d => d.status === 'new')
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobApplications'), snap => {
      setJobs(
        snap.docs
          .map(d => ({ id: d.id, type: 'job', ...d.data() }))
          .filter(d => d.status === 'pending')
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'contacts'), snap => {
      setContacts(
        snap.docs
          .map(d => ({ id: d.id, type: 'contact', ...d.data() }))
          .filter(d => (d.status || 'new') === 'new')
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      );
    });
    return unsub;
  }, []);

  // Mark all as seen by saving current timestamp — badge goes to 0
  const markBellOpened = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(BELL_KEY, String(now));
    setBellOpenedAt(now);
  }, []);

  const allNotifications = [...suppliers, ...jobs, ...contacts]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

  // Unread = created AFTER last bell open
  const unreadCount = allNotifications.filter(n => {
    const createdMs = (n.createdAt?.seconds ?? 0) * 1000;
    return createdMs > bellOpenedAt;
  }).length;

  return (
    <NotificationsContext.Provider value={{
      allNotifications,
      unreadCount,
      markBellOpened,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
