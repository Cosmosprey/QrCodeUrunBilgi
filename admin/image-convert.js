// Shrinks a product photo in the browser before it is uploaded: at most MAX_SIDE pixels on the longest side,
// WebP. Phone photos (3-8 MB) become a few hundred KB, which also saves Storage space and makes the customer
// page load faster. The size maths is in image-logic.js.

import { fitWithin, needsConversion, QUALITY_STEPS } from "./image-logic.js";
import { MAX_IMAGE_BYTES } from "./upload.js";

/** The file could not be decoded as a picture ("unreadable"), or no quality made it small enough ("too-large"). */
export class ImageError extends Error {
    constructor(code) {
        super(code);
        this.code = code;
    }
}

const canvasToBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Encodes the canvas, lowering the quality step by step until the result fits `limit` bytes. Returns the last
 * blob tried (which may still be too big), or null. A browser that cannot encode `type` hands back another
 * type (usually PNG); the loop stops then and the caller picks a different type.
 * In practice a 1200 px picture fits at the first step (even random noise is under 1 MB); this is a safety net.
 */
export async function encodeWithinLimit(canvas, type, { limit = MAX_IMAGE_BYTES, steps = QUALITY_STEPS } = {}) {
    let blob = null;
    for (const quality of steps) {
        blob = await canvasToBlob(canvas, type, quality);
        if (!blob || blob.type !== type || blob.size <= limit) break;
    }
    return blob;
}

/**
 * Prepares the picked file for upload. Returns { file, converted }; `file` is the original when nothing needed
 * to change (small pictures, GIFs). Throws ImageError.
 */
export async function prepareImage(file) {
    if (file.type === "image/gif") return { file, converted: false };

    let bitmap;
    try {
        // "from-image" applies the camera's rotation (EXIF), so a portrait photo stays upright.
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        throw new ImageError("unreadable");
    }

    try {
        if (!needsConversion(file, bitmap)) return { file, converted: false };

        const { width, height } = fitWithin(bitmap.width, bitmap.height);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.imageSmoothingQuality = "high";
        context.drawImage(bitmap, 0, 0, width, height); // transparent areas stay transparent (WebP keeps alpha)

        let blob = await encodeWithinLimit(canvas, "image/webp");
        if (!blob || blob.type !== "image/webp") {
            // Browsers without WebP encoding: JPEG on a white background.
            context.globalCompositeOperation = "destination-over";
            context.fillStyle = "#fff";
            context.fillRect(0, 0, width, height);
            blob = await encodeWithinLimit(canvas, "image/jpeg");
        }
        if (!blob || blob.size > MAX_IMAGE_BYTES) throw new ImageError("too-large");

        // Not resized and not smaller: re-encoding only lost quality, keep the original.
        const resized = width !== bitmap.width || height !== bitmap.height;
        if (!resized && blob.size >= file.size && file.size <= MAX_IMAGE_BYTES) return { file, converted: false };

        return { file: new File([blob], "image", { type: blob.type }), converted: true };
    } finally {
        bitmap.close();
    }
}
