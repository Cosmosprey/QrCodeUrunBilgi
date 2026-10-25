// Copy this file to `firebase-config.js` (same folder) and fill in your values.
// `firebase-config.js` is git-ignored, so your project settings stay out of the repository.
//
// Firebase Console -> Project settings -> Your apps -> Web app -> SDK setup and configuration.

export const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Set to true to talk to the local Firebase Emulator Suite (`npm run emulators`)
// instead of a real Firebase project. No real project is needed in that mode:
// use projectId "demo-qr-product-info" and any non-empty text for apiKey, for example "fake" (an empty apiKey
// stops the admin panel from starting). The other values are not used by the emulators.
export const useEmulator = false;
