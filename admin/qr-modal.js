// The window that shows a product's QR code.

import { generateQR } from "./qr.js";

// The address customers reach the product page at. Replace it with your own address.
const SITE_URL = "https://your-domain.com";

const modal = document.getElementById("qrModal");
const container = document.getElementById("qrContainer");
const linkText = document.getElementById("qrLink");

export function initQrModal() {
    document.getElementById("qrCloseBtn").addEventListener("click", closeQr);
}

/** QR kodu, ürünün detay sayfasının adresinden üretilir. */
export function showQr(productId) {
    const url = `${SITE_URL}/product/product.html?id=${productId}`;

    generateQR(container, url);
    linkText.innerText = url;

    modal.classList.remove("d-none");
}

function closeQr() {
    modal.classList.add("d-none");
}
