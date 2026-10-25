// Pure size maths for preparing product photos before upload. No DOM: easy to test.
// The browser does the actual decoding and encoding in image-convert.js.

import { intlLocale } from "../shared/i18n-core.js";

export const MAX_SIDE = 1200;                   // longest side after resizing, in pixels
export const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.5, 0.4]; // tried in turn until the result fits the upload limit
export const KEEP_AS_IS_BYTES = 300 * 1024;     // a picture this small (and not larger than MAX_SIDE) is left alone

/**
 * The size an image should be scaled to so its longest side is at most `maxSide`.
 * Keeps the aspect ratio, never scales up and never returns a side below 1 pixel.
 */
export function fitWithin(width, height, maxSide = MAX_SIDE) {
    const longest = Math.max(width, height);
    if (longest <= maxSide) return { width, height };
    const scale = maxSide / longest;
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale))
    };
}

/**
 * Whether a photo has to be resized and re-encoded. Animated GIFs would lose their animation, and
 * pictures that are already small are not worth recompressing (that only loses quality).
 */
export function needsConversion({ type, size }, { width, height }) {
    if (type === "image/gif") return false;
    const fitsAlready = Math.max(width, height) <= MAX_SIDE;
    return !(fitsAlready && size <= KEEP_AS_IS_BYTES);
}

/** "180 KB", "4,2 MB" / "4.2 MB" (one decimal for megabytes, in the language's number format). */
export function formatBytes(bytes, language = "tr") {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    const megabytes = new Intl.NumberFormat(intlLocale(language), { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024));
    return `${megabytes} MB`;
}
