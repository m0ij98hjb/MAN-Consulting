'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ROLES, 
  getDashboardForRole, 
  getNavigationForRole, 
  canRoleAccessRoute,
  getRoleLabel 
} from '@/lib/roleBasedAccess';

/**
 * Hook for managing role-based access control
 * Reads user role from adminUsers collection and provides access control helpers
 */
export function useRoleAccess() {
  const { user, isSuperAdmin } = useAuth();
  const { lang } = useLanguage();
  const [profile, setProfile] = useState(undefined); // undefined = loading
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRole(null);
      return;
    }

    const unsub = onSnapshot(doc(db, 'adminUsers', user.uid), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({ id: snap.id, ...data });
        setRole(data.role || null);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    return unsub;
  }, [user]);

  const loading = user === undefined || (!!user && profile === undefined);
  
  // Determine effective role
  const effectiveRole = isSuperAdmin ? ROLES.SUPER_ADMIN : role;
  
  // Check if user is active
  const isActive = profile?.active !== false;

  return {
    loading,
    profile,
    role: effectiveRole,
    isActive,
    hasAccess: isActive && !!effectiveRole,
    
    // Helper functions
    getDashboard: () => getDashboardForRole(effectiveRole),
    getNavigation: (overrideLang) => getNavigationForRole(effectiveRole, overrideLang || lang),
    canAccessRoute: (pathname) => {
      if (!isActive || !effectiveRole) return false;
      return canRoleAccessRoute(effectiveRole, pathname);
    },
    getRoleLabel: (overrideLang) => getRoleLabel(effectiveRole, overrideLang || lang),
    isRole: (rolesToCheck) => {
      if (!effectiveRole) return false;
      if (Array.isArray(rolesToCheck)) {
        return rolesToCheck.includes(effectiveRole);
      }
      return effectiveRole === rolesToCheck;
    },
  };
}
