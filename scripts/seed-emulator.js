// Creates the development admin user in the running Firebase Auth emulator.
// Usage: start `npm run emulators` in one terminal, then run `npm run seed` in another.
//
// The user gets the UID that firestore.rules / storage.rules treat as admin by default.
// This only works against the emulator (a real Firebase project assigns random UIDs).

const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
const PROJECT_ID = "demo-qr-product-info";

const ADMIN_UID = "dev-admin-uid";
const USERNAME = "admin";
const EMAIL = `${USERNAME}@qr-admin.local`; // keep in sync with admin/username.js
const PASSWORD = "admin123";

const response = await fetch(`http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
    body: JSON.stringify({ localId: ADMIN_UID, email: EMAIL, password: PASSWORD, emailVerified: true })
});

const body = await response.json();

if (response.ok) {
    console.log(`Created admin user. Username: ${USERNAME}  Password: ${PASSWORD}  (UID: ${ADMIN_UID})`);
} else if (body?.error?.message === "DUPLICATE_LOCAL_ID" || body?.error?.message === "EMAIL_EXISTS") {
    console.log(`Admin user already exists. Username: ${USERNAME}  Password: ${PASSWORD}`);
} else {
    console.error("Could not create the admin user. Is `npm run emulators` running?", body);
    process.exit(1);
}
