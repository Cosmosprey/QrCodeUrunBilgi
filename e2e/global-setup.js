// Runs once before the browser tests (after the emulators have started):
// 1. makes sure the pages are configured for the emulators, never for a real Firebase project, and
// 2. creates the development admin user (admin / admin123).

import { prepareEmulatorConfig } from "../scripts/emulator-config.js";

export default async function globalSetup() {
    const removeConfig = prepareEmulatorConfig();
    await import("../scripts/seed-emulator.js");

    // Playwright calls the returned function after the last test.
    return removeConfig;
}
