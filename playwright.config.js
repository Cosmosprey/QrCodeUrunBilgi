// Browser tests (npm run test:e2e). They start the Firebase emulators, open the pages in Chromium and click
// through them like a user. Nothing is sent to a real Firebase project: see e2e/global-setup.js.

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "e2e",
    globalSetup: "./e2e/global-setup.js",

    // Every test starts by emptying the one emulator database, so the tests run one after another.
    workers: 1,
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["list"]] : "list",

    use: {
        baseURL: "http://127.0.0.1:5000",
        // The tests read the Turkish texts; the language tests choose another locale themselves.
        locale: "tr-TR",
        timezoneId: "Europe/Istanbul",
        trace: "retain-on-failure"
    },

    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

    webServer: {
        command: "npm run emulators",
        url: "http://127.0.0.1:5000/admin/admin.html",
        // Locally, emulators that are already running are used as they are.
        reuseExistingServer: !process.env.CI,
        // Lets the emulators shut down properly (otherwise the Firestore emulator keeps running in the background).
        gracefulShutdown: { signal: "SIGTERM", timeout: 15_000 },
        timeout: 120_000
    }
});
