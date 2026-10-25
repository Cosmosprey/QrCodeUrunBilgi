// The store-wide site address (what QR codes point to). One Firestore document, settings/site, so every
// device that opens the admin panel uses the same address. Only the admin may read or write it (see firestore.rules).

import { db, doc, getDoc, setDoc } from "../shared/firebase.js";

const SETTING = () => doc(db, "settings", "site");

/** The saved site address, "" when none is saved, or null when it cannot be read (the caller may try again). */
export async function loadSiteUrl() {
    try {
        const snap = await getDoc(SETTING());
        const url = snap.exists() ? snap.data().siteUrl : "";
        return typeof url === "string" ? url : "";
    } catch (err) {
        console.warn("Could not read the site address:", err);
        return null;
    }
}

export async function saveSiteUrl(siteUrl) {
    await setDoc(SETTING(), { siteUrl });
}
