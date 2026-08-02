/**
 * Camera Firestore helpers — server-safe module.
 *
 * PUBLIC vs PRIVATE fields
 * ─────────────────────────
 * Public  → safe to expose to any authenticated viewer
 * Private → credentials / IPs — only returned by /api/cameras/[serial]/stream
 *           Never embed in frontend bundles.
 *
 * TO ADD REAL CAMERA CREDENTIALS later:
 *   • Update the camera record in Firestore (admin panel) with:
 *       externalIp, domain, username, password, streamUrl
 *   • The /api/cameras/[serial]/stream endpoint returns streamUrl.
 *   • No frontend code changes are needed.
 */

import { db } from '@/lib/firebase';
import {
  collection, doc, getDocs, addDoc,
  updateDoc, deleteDoc, serverTimestamp,
  query, orderBy,
} from 'firebase/firestore';

const COL = 'cameras';

/** Fields safe to send to the browser */
export const PUBLIC_FIELDS = new Set([
  'serialNumber', 'projectName', 'projectLocation',
  'cameraName', 'cameraType', 'status', 'qrCode',
  'createdAt', 'updatedAt',
]);

/** Strip private fields before sending to client */
export function publicView(camera) {
  const out = { id: camera.id };
  for (const key of PUBLIC_FIELDS) {
    if (camera[key] !== undefined) out[key] = camera[key];
  }
  return out;
}

/** Serialise Firestore timestamps to ISO strings */
function serialise(camera) {
  const out = { ...camera };
  if (out.createdAt?.toDate) out.createdAt = out.createdAt.toDate().toISOString();
  if (out.updatedAt?.toDate) out.updatedAt = out.updatedAt.toDate().toISOString();
  return out;
}

export async function getAllCameras() {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => serialise({ id: d.id, ...d.data() }));
}

export async function getCameraBySerial(serial) {
  const all = await getAllCameras();
  return all.find(c =>
    (c.serialNumber || '').toUpperCase() === (serial || '').toUpperCase()
  ) ?? null;
}

export async function createCamera(data) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCamera(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCamera(id) {
  await deleteDoc(doc(db, COL, id));
}
