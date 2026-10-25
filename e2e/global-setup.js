// Runs once before the browser tests (after the emulators have started):
// 1. makes sure the pages are configured for the emulators, never for a real Firebase project, and
// 2. creates the development admin user (admin / admin123).

import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";

const CONFIG = new URL("../shared/firebase-config.js", import.meta.url);

// The same values as shared/firebase-config.example.js, set up for the emulators.
const EMULATOR_CONFIG = `// Created by the browser tests (e2e/global-setup.js) and removed again afterwards.
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

export default async function globalSetup() {
    let createdConfig = false;

    if (existsSync(CONFIG)) {
        // The tests empty the database they talk to, so a real project must never be reachable from here.
        const text = readFileSync(CONFIG, "utf8");
        const isEmulatorConfig = /useEmulator\s*=\s*true/.test(text) && text.includes("demo-qr-product-info");
        if (!isEmulatorConfig) {
            throw new Error(
                "shared/firebase-config.js is not set up for the emulators (projectId demo-qr-product-info, " +
                    "useEmulator = true). The browser tests would not use the emulators, so they stop here."
            );
        }
    } else {
        writeFileSync(CONFIG, EMULATOR_CONFIG);
        createdConfig = true;
    }

    await import("../scripts/seed-emulator.js");

    // Playwright calls the returned function after the last test.
    return () => {
        if (createdConfig) rmSync(CONFIG, { force: true });
    };
}
