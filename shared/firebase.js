// Single place where the Firebase app and Firestore are initialised.
// Both the admin panel and the customer page import from here.
// Authentication and Storage are only needed by the admin panel: see admin/firebase-admin.js.

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

if (useEmulator) {
  // Use the page's own hostname so a phone on the same network reaches the emulators on the dev machine.
  connectFirestoreEmulator(db, window.location.hostname, 8080);
}

export {
  app,
  useEmulator,
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
};
