// Product image files in Firebase Storage.

import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from "./firebase-admin.js";
import { safeHttpUrl } from "../shared/dom.js";
import { storagePathFor, randomFileId } from "./upload.js";

/** Uploads an image under a random name and returns its download URL. */
export async function uploadProductImage(file) {
    const fileRef = ref(storage, storagePathFor(file, randomFileId()));

    await uploadBytes(fileRef, file, { contentType: file.type });

    return getDownloadURL(fileRef);
}

/** Removes an image from Storage. A failure only leaves an unused file behind, so it never blocks the user. */
export async function deleteProductImage(url) {
    if (!safeHttpUrl(url)) return;
    try {
        await deleteObject(ref(storage, url));
    } catch (err) {
        console.warn("Could not delete the image (not important):", err);
    }
}
