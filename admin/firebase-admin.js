// Firebase services that only the admin panel needs: Authentication and Storage.

import { app, useEmulator } from "../shared/firebase.js";

import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

const auth = getAuth(app);
const storage = getStorage(app);

if (useEmulator) {
  const host = window.location.hostname;
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectStorageEmulator(storage, host, 9199);
}

export {
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
