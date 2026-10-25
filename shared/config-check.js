// Checks the Firebase configuration file (shared/firebase-config.js). Pure: no DOM, no Firebase.

/**
 * Returns a message that tells the person who sets the project up what is wrong with the configuration module,
 * or null when it is usable. (The messages are in English: they are for developers, not for visitors.)
 */
export function configProblem(config) {
    const firebaseConfig = config?.firebaseConfig;
    if (!firebaseConfig || typeof firebaseConfig !== "object") {
        return "shared/firebase-config.js must export firebaseConfig (see shared/firebase-config.example.js).";
    }
    for (const key of ["apiKey", "projectId"]) {
        const value = firebaseConfig[key];
        if (typeof value !== "string" || value.trim() === "") {
            const hint = config.useEmulator
                ? 'For the emulators any text will do, for example "fake" (projectId: "demo-qr-product-info").'
                : "Copy the value from the settings of your Firebase project.";
            return `shared/firebase-config.js: "${key}" is empty. ${hint}`;
        }
    }
    return null;
}
