// Rules for product image uploads. Keep in sync with storage.rules, which enforces the same
// limits on the server (this file only gives the admin a friendly error before uploading).
//
// What is uploaded is at most MAX_IMAGE_BYTES. Photos are shrunk in the browser first (image-convert.js),
// so what the admin may *pick* is larger (MAX_INPUT_BYTES); animated GIFs are not shrunk and keep the
// upload limit.

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;

// SVG is intentionally not allowed: it can carry scripts.
export const ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
};

/** Returns the translation key of an error message for an unacceptable image file, or null when it is fine. */
export function validateImageFile(file) {
    if (!file) return null;
    if (!Object.hasOwn(ALLOWED_IMAGE_TYPES, file.type)) {
        return "error.image.type";
    }
    if (file.type === "image/gif" && file.size > MAX_IMAGE_BYTES) {
        return "error.image.gifTooLarge";
    }
    if (file.size > MAX_INPUT_BYTES) {
        return "error.image.tooLarge";
    }
    return null;
}

/** Storage path for an upload. The user's file name is never used. */
/**
 * A random id (32 hexadecimal characters) for the name of an uploaded file. It uses getRandomValues, not randomUUID:
 * randomUUID only exists on secure origins (https or localhost), but the panel is also used from a phone at an address
 * such as http://192.168.1.20:5000, where uploading must work too.
 */
export function randomFileId(cryptoApi = globalThis.crypto) {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function storagePathFor(file, id) {
    return `products/${id}.${ALLOWED_IMAGE_TYPES[file.type]}`;
}
