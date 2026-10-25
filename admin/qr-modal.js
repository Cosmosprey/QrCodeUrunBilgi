// The window that shows a product's QR code: site address, download and print.

import { generateQR } from "./qr.js";
import { loadSiteUrl, saveSiteUrl } from "./site-settings.js";
import { normalizeSiteUrl, isLocalAddress, qrTargetUrl, qrFileName } from "./qr-logic.js";
import { formatPrice } from "../shared/product-logic.js";
import { showMessage } from "./ui.js";

const modal = document.getElementById("qrModal");
const title = document.getElementById("qrTitle");
const price = document.getElementById("qrPrice");
const container = document.getElementById("qrContainer");
const linkText = document.getElementById("qrLink");
const warning = document.getElementById("qrWarning");
const siteInput = document.getElementById("qrSiteUrl");
const siteMessage = document.getElementById("qrSiteMessage");
const saveButton = document.getElementById("qrSiteSave");

let currentProduct = null;
let siteUrl = null; // the saved address; null until loaded, "" when none is saved

/** The address in use: the saved one, otherwise the address this page was opened from. */
function effectiveSiteUrl() {
    return siteUrl || window.location.origin;
}

function render() {
    const base = effectiveSiteUrl();
    const url = qrTargetUrl(base, currentProduct.id);

    generateQR(container, url);
    linkText.textContent = url;
    siteInput.value = base;

    showMessage(warning, isLocalAddress(base)
        ? "Bu adres yalnızca bu bilgisayarda çalışır: telefonlar ve diğer cihazlar \"localhost\" adresine ulaşamaz, QR kodu okutulduğunda sayfa açılmaz. Bilgisayarın ağ adresini yazıp Kaydet'e basın (örn. http://192.168.1.20:5000)."
        : "");
}

async function saveAddress() {
    showMessage(siteMessage, "");
    const result = normalizeSiteUrl(siteInput.value);
    if (result.error) {
        siteMessage.className = "small mt-1 text-danger";
        showMessage(siteMessage, result.error);
        return;
    }

    saveButton.disabled = true;
    try {
        await saveSiteUrl(result.url);
        siteUrl = result.url;
        render();
        siteMessage.className = "small mt-1 text-success";
        showMessage(siteMessage, "Adres kaydedildi.");
    } catch (err) {
        console.error("Site adresi kaydedilemedi:", err);
        siteMessage.className = "small mt-1 text-danger";
        showMessage(siteMessage, "Adres kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
        saveButton.disabled = false;
    }
}

function downloadPng() {
    const canvas = container.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = qrFileName(currentProduct.name);
        link.click();
        URL.revokeObjectURL(link.href);
    }, "image/png");
}

function closeQr() {
    modal.classList.add("d-none");
}

export function initQrModal() {
    document.getElementById("qrCloseBtn").addEventListener("click", closeQr);
    document.getElementById("qrDownloadBtn").addEventListener("click", downloadPng);
    document.getElementById("qrPrintBtn").addEventListener("click", () => window.print());
    saveButton.addEventListener("click", saveAddress);
    siteInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveAddress();
    });
}

/** Opens the window for a product (an object with id, name and price). */
export async function showQr(product) {
    currentProduct = product;
    title.textContent = product.name || "QR Kod";
    price.textContent = formatPrice(product.price);
    showMessage(siteMessage, "");
    modal.classList.remove("d-none");

    if (siteUrl === null) {
        siteUrl = (await loadSiteUrl()) ?? "";
    }
    render();
}
