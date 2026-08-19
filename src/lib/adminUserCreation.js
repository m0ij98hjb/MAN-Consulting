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
 * @param {string} params.role  Main role (e.g., 'hr_manager', 'company_manager')
 * @param {string[]} params.permissions  e.g. ['jobs_module','messages_module']
 * @param {string|null} params.createdByUid
 */
export async function createAdminUser({
  name, email, password, phone = '', jobTitle = '', department = '',
  role = null, permissions = [], createdByUid = null,
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
      permissions,                // ['jobs_module', 'messages_module', ...]
      photoURL: role === 'company_manager' ? '/asstes/Company-manager-lader.jpg' : (role === 'super_admin' ? '/asstes/super-admin.jpg' : '/asstes/ph dashborad.png'),
      active: true,
      createdAt: serverTimestamp(),
      createdBy: createdByUid,
    });

    return cred.user.uid;
  } finally {
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondaryApp).catch(() => {});
  }
}

/**
 * Updates an existing user's permissions in Firestore.
 * (Cannot change password/email from client without re-auth — those require Firebase Admin SDK)
 */
export async function updateAdminUserPermissions(uid, { role, permissions, active, name, phone, jobTitle, department }) {
  const updates = {};
  if (role !== undefined) updates.role = role;
  if (permissions !== undefined) updates.permissions = permissions;
  if (active !== undefined) updates.active = active;
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (jobTitle !== undefined) updates.jobTitle = jobTitle;
  if (department !== undefined) updates.department = department;

  const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore');
  await updateDoc(firestoreDoc(db, 'adminUsers', uid), updates);
}

/**
 * Deletes a user document from the adminUsers collection in Firestore.
 */
export async function deleteAdminUser(uid) {
  const { deleteDoc, doc: firestoreDoc } = await import('firebase/firestore');
  await deleteDoc(firestoreDoc(db, 'adminUsers', uid));
}
