import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SECONDARY_APP_NAME = 'adminUserCreation';

function getFirebaseConfig() {
  return getApp().options;
}

/**
 * Creates a new Firebase Auth account + adminUsers profile without
 * disturbing the admin's own signed-in session. Uses a throwaway secondary
 * Firebase app instance to avoid signing out the current admin.
 *
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.phone
 * @param {string} params.jobTitle
 * @param {string} params.department
 * @param {string} params.role  Main role (e.g., 'procurement_manager', 'hr_manager')
 * @param {string[]} params.permissions  e.g. ['purchasing_module','suppliers_module']
 * @param {string|null} params.purchasingRole  role inside purchasing module (or null)
 * @param {string|null} params.createdByUid
 */
export async function createAdminUser({
  name, email, password, phone = '', jobTitle = '', department = '',
  role = null, permissions = [], purchasingRole = null, createdByUid = null,
}) {
  const secondaryApp = getApps().some(a => a.name === SECONDARY_APP_NAME)
    ? getApp(SECONDARY_APP_NAME)
    : initializeApp(getFirebaseConfig(), SECONDARY_APP_NAME);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Save to adminUsers — central user registry
    await setDoc(doc(db, 'adminUsers', cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      phone,
      jobTitle,
      department,
      role,                      // Main role for RBAC
      permissions,                // ['purchasing_module', 'suppliers_module', ...]
      purchasingRole: purchasingRole || null,
      photoURL: role === 'company_manager' ? '/asstes/directort.png' : (role === 'super_admin' ? '/asstes/super-admin.jpg' : '/asstes/ph dashborad.png'),
      active: true,
      createdAt: serverTimestamp(),
      createdBy: createdByUid,
    });

    // If user has purchasing module access, also add them to purchasingUsers
    // so the existing purchasing role system works automatically
    if (permissions.includes('purchasing_module') && purchasingRole) {
      await setDoc(doc(db, 'purchasingUsers', cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        phone,
        role: purchasingRole,  // 'site_supervisor' = can create purchase requests
        jobTitle,
        department,
        projectName: '',
        active: true,
        createdAt: serverTimestamp(),
        createdBy: createdByUid,
      });
    }

    return cred.user.uid;
  } finally {
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondaryApp).catch(() => {});
  }
}

/**
 * Updates an existing user's permissions and purchasing role in Firestore.
 * (Cannot change password/email from client without re-auth — those require Firebase Admin SDK)
 */
export async function updateAdminUserPermissions(uid, { role, permissions, purchasingRole, active, name, phone, jobTitle, department }) {
  const updates = {};
  if (role !== undefined) updates.role = role;
  if (permissions !== undefined) updates.permissions = permissions;
  if (purchasingRole !== undefined) updates.purchasingRole = purchasingRole;
  if (active !== undefined) updates.active = active;
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (jobTitle !== undefined) updates.jobTitle = jobTitle;
  if (department !== undefined) updates.department = department;

  const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore');
  await updateDoc(firestoreDoc(db, 'adminUsers', uid), updates);

  // Sync purchasing role if they have purchasing module
  if (permissions !== undefined || purchasingRole !== undefined || active !== undefined) {
    const { getDoc } = await import('firebase/firestore');
    const snap = await getDoc(firestoreDoc(db, 'adminUsers', uid));
    const data = snap.data();
    const hasPurchasing = (permissions ?? data?.permissions ?? []).includes('purchasing_module');
    const effectiveRole = purchasingRole ?? data?.purchasingRole;
    const isActive = active ?? data?.active ?? true;

    if (hasPurchasing && effectiveRole) {
      const { setDoc: firestoreSet } = await import('firebase/firestore');
      await firestoreSet(firestoreDoc(db, 'purchasingUsers', uid), {
        uid,
        name: name ?? data?.name,
        email: data?.email,
        phone: phone ?? data?.phone ?? '',
        role: effectiveRole,
        jobTitle: jobTitle ?? data?.jobTitle ?? '',
        department: department ?? data?.department ?? '',
        projectName: '',
        active: isActive,
        createdAt: data?.createdAt,
        createdBy: data?.createdBy,
      }, { merge: true });
    } else if (!hasPurchasing) {
      // Remove from purchasingUsers if purchasing module revoked
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(firestoreDoc(db, 'purchasingUsers', uid)).catch(() => {});
    }
  }
}

/**
 * Deletes a user document from adminUsers and purchasingUsers collections in Firestore.
 */
export async function deleteAdminUser(uid) {
  const { deleteDoc, doc: firestoreDoc } = await import('firebase/firestore');
  await deleteDoc(firestoreDoc(db, 'adminUsers', uid));
  await deleteDoc(firestoreDoc(db, 'purchasingUsers', uid)).catch(() => {});
}

