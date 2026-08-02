// Firestore repository for the `mediaLibrary` collection — the browsable
// index of every asset uploaded through the Media Library / MediaPicker.
// Neither Cloudinary nor Firebase Storage exposes a safe client-listable
// asset index, so this collection (one doc per upload) is the single source
// of truth for "what assets exist" and drives search/filter/reuse.
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  onSnapshot, arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'mediaLibrary';
const assetDoc = (id) => doc(db, COL, id);

function applyFilters(items, { folder, type, search } = {}) {
  let out = items;
  if (folder) out = out.filter((m) => m.folder === folder);
  if (type) out = out.filter((m) => m.type === type);
  if (search) {
    const q = search.toLowerCase();
    out = out.filter(
      (m) =>
        m.originalFilename?.toLowerCase().includes(q) ||
        m.tags?.some((tag) => tag.toLowerCase().includes(q)),
    );
  }
  return out.sort((a, b) => (b.uploadedAt?.seconds || 0) - (a.uploadedAt?.seconds || 0));
}

export async function listMedia(filters = {}) {
  const snap = await getDocs(collection(db, COL));
  return applyFilters(snap.docs.map((d) => ({ id: d.id, ...d.data() })), filters);
}

export function subscribeMedia(callback, filters = {}) {
  return onSnapshot(collection(db, COL), (snap) => {
    callback(applyFilters(snap.docs.map((d) => ({ id: d.id, ...d.data() })), filters));
  });
}

export async function createMediaAsset(assetData) {
  const ref = await addDoc(collection(db, COL), {
    folder: 'general',
    tags: [],
    usageRefs: [],
    ...assetData,
    uploadedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMediaAsset(id, data) {
  await updateDoc(assetDoc(id), data);
}

// Removes the asset from the library index only — the underlying Cloudinary
// asset is NOT deleted (no signed backend API exists for that in Phase 1).
export async function deleteMediaAsset(id) {
  await deleteDoc(assetDoc(id));
}

export async function addUsageRef(assetId, ref) {
  if (!assetId) return;
  await updateDoc(assetDoc(assetId), { usageRefs: arrayUnion(ref) });
}

export async function isAssetInUse(id) {
  const snap = await getDoc(assetDoc(id));
  if (!snap.exists()) return { inUse: false, refs: [] };
  const refs = snap.data().usageRefs || [];
  return { inUse: refs.length > 0, refs };
}
