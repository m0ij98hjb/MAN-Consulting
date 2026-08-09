import { getStorage } from 'firebase/storage';
import app from './firebase';

// Split out of lib/firebase.js: firebase/storage is only used by admin media
// upload features, but getStorage() is a side-effecting call the bundler
// can't tree-shake — inlined in the shared firebase.js it was shipping the
// whole Storage SDK to every public page. Importing it from here instead
// keeps it inside admin-only route chunks.
export const storage = getStorage(app);
