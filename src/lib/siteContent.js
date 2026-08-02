import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const CLOUD = 'dgpcetiyv';
const PRESET = 'mnc_suppliers';

export async function uploadToCloudinary(file, resourceType = 'image') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`, {
    method: 'POST', body: fd,
  });
  const j = await r.json();
  if (!j.secure_url) throw new Error(j.error?.message || 'Upload failed');
  return j.secure_url;
}

export async function loadSiteContent(section) {
  const snap = await getDoc(doc(db, 'siteContent', section));
  return snap.exists() ? snap.data() : {};
}

export async function saveSiteContent(section, data) {
  await setDoc(doc(db, 'siteContent', section), data, { merge: true });
}
