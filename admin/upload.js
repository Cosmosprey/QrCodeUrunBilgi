// Rules for product image uploads. Keep in sync with storage.rules, which enforces the same
// limits on the server (this file only gives the admin a friendly error before uploading).

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// SVG is intentionally not allowed: it can carry scripts.
export const ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
};

/** Returns a (Turkish) error message for an unacceptable image file, or null when it is fine. */
export function validateImageFile(file) {
    if (!file) return null;
    if (!Object.hasOwn(ALLOWED_IMAGE_TYPES, file.type)) {
        return "Görsel JPEG, PNG, WebP veya GIF olmalıdır.";
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return "Görsel en fazla 2 MB olabilir.";
    }
    return null;
}

/** Storage path for an upload. The user's file name is never used. */
export function storagePathFor(file, id) {
    return `products/${id}.${ALLOWED_IMAGE_TYPES[file.type]}`;
}
