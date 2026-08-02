'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useSiteContent(section) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'siteContent', section), snap => {
      setData(snap.exists() ? snap.data() : {});
      setLoading(false);
    });
    return unsub;
  }, [section]);
  return { data, loading };
}
