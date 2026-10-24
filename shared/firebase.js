// Single place where the Firebase SDK is loaded and initialised.
// Both the admin panel and the customer page import from here.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

// The config file is git-ignored and created by the person who sets the project up.
// It is loaded dynamically so a missing file produces a clear message instead of a blank page.
let config;
try {
  config = await import("./firebase-config.js");
} catch (err) {
  const message = "shared/firebase-config.js not found. Copy shared/firebase-config.example.js to shared/firebase-config.js and fill it in (see README).";
  console.error(message, err);
  throw new Error(message);
}

const { firebaseConfig, useEmulator = false } = config;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

if (useEmulator) {
  // Use the page's own hostname so a phone on the same network reaches the emulators on the dev machine.
  const host = window.location.hostname;
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
}

export {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
};

export { storage, ref, uploadBytes, getDownloadURL };
