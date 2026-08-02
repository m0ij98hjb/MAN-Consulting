// Firestore repository for the unified `projects` collection (doc ID = slug).
// Public-facing read functions (getPublishedProjects/subscribeFeaturedProjects/
// getRelatedProjects/getProjectBySlug) use explicit `where` clauses so the
// query itself is provably restricted to published+non-archived docs — this
// is required for Firestore security rules to allow anonymous visitors to
// list the collection at all (a bare unconstrained collection query is
// rejected outright for non-admin callers once per-document rules exist).
// Admin-facing functions (listProjects/subscribeProjects/create/update/...)
// read/write the full collection and rely on the super-admin rule branch.
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'projects';
const projectDoc = (slug) => doc(db, COL, slug);

/* ── Admin: full collection access ── */

export async function listProjects({ includeArchived = false } = {}) {
  const snap = await getDocs(collection(db, COL));
  let items = snap.docs.map((d) => ({ slug: d.id, ...d.data() }));
  if (!includeArchived) items = items.filter((p) => !p.archived);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeProjects(callback, { includeArchived = false } = {}) {
  return onSnapshot(collection(db, COL), (snap) => {
    let items = snap.docs.map((d) => ({ slug: d.id, ...d.data() }));
    if (!includeArchived) items = items.filter((p) => !p.archived);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    callback(items);
  }, (err) => {
    console.error('subscribeProjects failed:', err);
  });
}

/* ── Public: rule-provable constrained queries ── */

export async function getPublishedProjects() {
  const q = query(
    collection(db, COL),
    where('draft', '==', false),
    where('archived', '==', false),
    orderBy('order', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ slug: d.id, ...d.data() }));
}

export function subscribeFeaturedProjects(callback, { max = 12 } = {}) {
  const q = query(
    collection(db, COL),
    where('draft', '==', false),
    where('archived', '==', false),
    where('featured', '==', true),
    orderBy('order', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.slice(0, max).map((d) => ({ slug: d.id, ...d.data() })));
  }, (err) => {
    console.error('subscribeFeaturedProjects failed:', err);
  });
}

export async function getRelatedProjects(category, excludeSlug, max = 3) {
  const q = query(
    collection(db, COL),
    where('draft', '==', false),
    where('archived', '==', false),
    where('category', '==', category),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ slug: d.id, ...d.data() }))
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, max);
}

export async function getProjectBySlug(slug) {
  const snap = await getDoc(projectDoc(slug));
  return snap.exists() ? { slug: snap.id, ...snap.data() } : null;
}

// Adapts a `projects/{slug}` doc into the shape ProjectDirectory.js (and the
// homepage featured grid) already expect from the legacy src/data/projects.js
// PROJECTS array — lets those existing, working components stay unchanged.
export function toLegacyProjectShape(p) {
  return {
    id: p.slug,
    slug: p.slug,
    title: { ar: p.name_ar, en: p.name_en },
    category: p.category,
    description: { ar: p.desc_ar, en: p.desc_en },
    location: { ar: p.location_ar, en: p.location_en },
    year: p.year ?? null,
    status: p.constructionStatus,
    coverImage: p.coverImage,
    gallery: (p.gallery || []).map((g) => g.url),
  };
}

/* ── Admin: mutations ── */

export async function slugExists(slug) {
  const snap = await getDoc(projectDoc(slug));
  return snap.exists();
}

export async function createProject(data) {
  if (!data.slug) throw new Error('slug is required');
  if (await slugExists(data.slug)) throw new Error('slug_taken');
  const now = serverTimestamp();
  await setDoc(projectDoc(data.slug), {
    draft: true, archived: false, featured: false, order: 0,
    ...data,
    createdAt: now, updatedAt: now,
  });
  return data.slug;
}

export async function updateProject(slug, data) {
  await updateDoc(projectDoc(slug), { ...data, updatedAt: serverTimestamp() });
}

// Firestore doc IDs are immutable — changing a project's slug means creating
// a new doc and removing the old one. Rare, edit-time-only action; not worth
// a Cloud Function/transaction for a low-traffic site.
export async function renameProjectSlug(oldSlug, newSlug, data) {
  if (oldSlug === newSlug) return updateProject(oldSlug, data);
  if (await slugExists(newSlug)) throw new Error('slug_taken');
  const now = serverTimestamp();
  await setDoc(projectDoc(newSlug), { ...data, slug: newSlug, createdAt: now, updatedAt: now });
  try {
    await deleteDoc(projectDoc(oldSlug));
  } catch {
    throw new Error(`slug_rename_partial:${oldSlug}`);
  }
}

export async function deleteProject(slug) {
  await deleteDoc(projectDoc(slug));
}

export async function setProjectFlags(slug, flags) {
  await updateDoc(projectDoc(slug), { ...flags, updatedAt: serverTimestamp() });
}

export async function reorderProjects(orderedSlugs) {
  const batch = writeBatch(db);
  orderedSlugs.forEach((slug, index) => {
    batch.update(projectDoc(slug), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

export async function duplicateProject(slug) {
  const original = await getProjectBySlug(slug);
  if (!original) throw new Error('Project not found');
  let newSlug = `${slug}-copy`;
  let n = 2;
  while (await slugExists(newSlug)) {
    newSlug = `${slug}-copy-${n}`;
    n += 1;
  }
  const { slug: _oldSlug, createdAt, updatedAt, ...rest } = original;
  await createProject({ ...rest, slug: newSlug, draft: true, featured: false });
  return newSlug;
}
