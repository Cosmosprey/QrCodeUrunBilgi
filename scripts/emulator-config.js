// Makes sure the pages are configured for the Firebase emulators and never for a real project.
// Used by the browser tests and the screenshot script: both empty or fill the database they talk to.

import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";

const CONFIG = new URL("../shared/firebase-config.js", import.meta.url);

// The same values as shared/firebase-config.example.js, set up for the emulators.
const EMULATOR_CONFIG = `// Created by a script (scripts/emulator-config.js) and removed again afterwards.
export const firebaseConfig = {
    apiKey: "fake",
    authDomain: "demo-qr-product-info.firebaseapp.com",
    projectId: "demo-qr-product-info",
    storageBucket: "demo-qr-product-info.appspot.com",
    messagingSenderId: "0",
    appId: "0"
};
export const useEmulator = true;
`;

/**
 * Creates shared/firebase-config.js for the emulators when there is none, and refuses to go on when there is one
 * that points at a real project. Returns a function that removes the file again if it was created here.
 */
export function prepareEmulatorConfig() {
    let createdConfig = false;

    if (existsSync(CONFIG)) {
        const text = readFileSync(CONFIG, "utf8");
        const isEmulatorConfig = /useEmulator\s*=\s*true/.test(text) && text.includes("demo-qr-product-info");
        if (!isEmulatorConfig) {
            throw new Error(
                "shared/firebase-config.js is not set up for the emulators (projectId demo-qr-product-info, " +
                    "useEmulator = true). This script would not use the emulators, so it stops here."
            );
        }
    } else {
        writeFileSync(CONFIG, EMULATOR_CONFIG);
        createdConfig = true;
    }

    return () => {
        if (createdConfig) rmSync(CONFIG, { force: true });
    };
}
