// The store-wide site address (what QR codes point to). One Firestore document, settings/site, so every
// device that opens the admin panel uses the same address. Only the admin may read or write it (see firestore.rules).

import { db, doc, getDoc, setDoc } from "../shared/firebase.js";

const SETTING = () => doc(db, "settings", "site");

/** The saved site address, or null when none is saved or it cannot be read. */
export async function loadSiteUrl() {
    try {
        const snap = await getDoc(SETTING());
        const url = snap.exists() ? snap.data().siteUrl : null;
        return typeof url === "string" && url ? url : null;
    } catch (err) {
        console.warn("Site adresi okunamadı:", err);
        return null;
    }
}

export async function saveSiteUrl(siteUrl) {
    await setDoc(SETTING(), { siteUrl });
}
