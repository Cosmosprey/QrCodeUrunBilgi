// Pure logic for QR codes: which address goes into the code and how its file is named. No DOM.

/**
 * Checks and tidies the site address typed by the admin.
 * Returns { url } (no trailing slash) or { error } with the translation key of a message.
 */
export function normalizeSiteUrl(input) {
    const text = String(input ?? "").trim();

    let url;
    try {
        url = new URL(text);
    } catch {
        return { error: "error.site.invalid" };
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { error: "error.site.scheme" };
    }
    if (url.username || url.password) {
        return { error: "error.site.credentials" };
    }
    if (url.search || url.hash) {
        return { error: "error.site.queryOrHash" };
    }

    return { url: `${url.origin}${url.pathname}`.replace(/\/+$/, "") };
}

/** True for addresses only the computer itself can reach (localhost, 127.x.x.x, ::1, 0.0.0.0). */
export function isLocalAddress(siteUrl) {
    let hostname;
    try {
        hostname = new URL(siteUrl).hostname.toLowerCase();
    } catch {
        return false;
    }
    return (
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        /^127(\.\d{1,3}){3}$/.test(hostname) ||
        hostname === "[::1]" ||
        hostname === "0.0.0.0"
    );
}

/** The address a QR code points to. */
export function qrTargetUrl(siteUrl, productId) {
    return `${siteUrl}/product/product.html?id=${encodeURIComponent(productId)}`;
}

const TURKISH_ASCII = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

/** File name for a downloaded QR code, e.g. "Süt 1L" -> "qr-sut-1l.png". */
export function qrFileName(productName) {
    const slug = String(productName ?? "")
        .toLocaleLowerCase("tr")
        .replace(/[çğıöşü]/g, (letter) => TURKISH_ASCII[letter])
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40)
        .replace(/-+$/g, "");
    return `qr-${slug || "urun"}.png`;
}
