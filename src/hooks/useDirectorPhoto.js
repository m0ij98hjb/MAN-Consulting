'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FALLBACK = '/asstes/directort.png';

export function useDirectorPhoto() {
  const [photoURL, setPhotoURL] = useState(FALLBACK);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'director'), (snap) => {
      setPhotoURL(snap.exists() && snap.data()?.photoURL ? snap.data().photoURL : FALLBACK);
    });
    return unsub;
  }, []);
  return photoURL;
}
