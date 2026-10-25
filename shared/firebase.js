// Single place where the Firebase app and Firestore are initialised.
// Both the admin panel and the customer page import from here.
// Authentication and Storage are only needed by the admin panel: see admin/firebase-admin.js.

import { configProblem } from "./config-check.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
    getFirestore,
    connectFirestoreEmulator,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
    setDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

/** Without a usable configuration nothing works: say so on the page (a blank page tells nobody anything), then stop. */
function stopWithSetupProblem(message, cause) {
    console.error(message, cause ?? "");
    const box = document.createElement("div");
    box.className = "alert alert-danger m-3";
    box.setAttribute("role", "alert");
    box.textContent = message;
    document.body.prepend(box);
    throw new Error(message, { cause });
}

// The config file is git-ignored and created by the person who sets the project up.
// It is loaded dynamically so a missing or unusable file produces a clear message instead of a blank page.
let config;
try {
    config = await import("./firebase-config.js");
} catch (err) {
    stopWithSetupProblem(
        "shared/firebase-config.js not found. Copy shared/firebase-config.example.js to shared/firebase-config.js and fill it in (see README).",
        err
    );
}
const problem = configProblem(config);
if (problem) stopWithSetupProblem(problem);

const { firebaseConfig, useEmulator = false } = config;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (useEmulator) {
    // Use the page's own hostname so a phone on the same network reaches the emulators on the dev machine.
    connectFirestoreEmulator(db, window.location.hostname, 8080);
}

export { app, useEmulator, db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc, runTransaction };
