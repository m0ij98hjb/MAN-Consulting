'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook that resolves the current user's admin permissions from the `adminUsers`
 * Firestore collection. Super admins always have full access.
 *
 * Returns:
 *   - loading: bool
 *   - permissions: string[]  (e.g. ['purchasing_module', 'suppliers_module'])
 *   - canAccess: (perm: string) => bool
 *   - active: bool
 *   - profile: the raw Firestore doc or null
 */
export function useAdminPermissions() {
  const { user, isSuperAdmin } = useAuth();
  const [profile, setProfile] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    if (isSuperAdmin) { setProfile({ permissions: ['all'], active: true }); return; }

    const unsub = onSnapshot(doc(db, 'adminUsers', user.uid), snap => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [user, isSuperAdmin]);

  const loading = user === undefined || profile === undefined;
  const active = isSuperAdmin ? true : (profile?.active !== false && !!profile);
  const permissions = isSuperAdmin ? ['all'] : (profile?.permissions ?? []);

  const canAccess = (perm) => {
    if (isSuperAdmin) return true;
    if (!active) return false;
    return permissions.includes(perm) || permissions.includes('all');
  };

  return {
    loading,
    profile,
    permissions,
    active,
    canAccess,
    hasAnyAccess: isSuperAdmin || (active && permissions.length > 0),
  };
}
