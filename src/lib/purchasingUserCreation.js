import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SECONDARY_APP_NAME = 'purchasingUserCreation';

/* firebaseConfig is not exported from lib/firebase.js — read it back off the
   default app so we don't duplicate the (env-driven) config in two places. */
function getFirebaseConfig() {
  return getApp().options;
}

/**
 * Creates a new Firebase Auth account + purchasingUsers profile without
 * disturbing the admin's own signed-in session. createUserWithEmailAndPassword
 * signs the new user in on whichever Auth instance it's called against — so we
 * spin up a throwaway secondary app, create the account there, then tear it
 * down. The admin's primary session (default app) is never touched.
 */
export async function createPurchasingUser({ name, email, password, role, phone, jobTitle, department, projectName, createdByUid }) {
  const secondaryApp = getApps().some(a => a.name === SECONDARY_APP_NAME)
    ? getApp(SECONDARY_APP_NAME)
    : initializeApp(getFirebaseConfig(), SECONDARY_APP_NAME);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await updateProfile(cred.user, { displayName: name });

    await setDoc(doc(db, 'purchasingUsers', cred.user.uid), {
      uid: cred.user.uid,
      name, email, phone: phone || '', role,
      jobTitle: jobTitle || '', department: department || '', projectName: projectName || '',
      active: true,
      createdAt: serverTimestamp(),
      createdBy: createdByUid || null,
    });

    return cred.user.uid;
  } finally {
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondaryApp).catch(() => {});
  }
}
