// The window that shows a product's QR code: site address, download and print.
// It is a real dialog: focus moves into it, Tab stays inside, Escape or a click outside closes it, the page
// behind it is inert (no keyboard, no screen reader), and focus returns to the button that opened it.

import { generateQR } from "./qr.js";
import { loadSiteUrl, saveSiteUrl } from "./site-settings.js";
import { normalizeSiteUrl, isLocalAddress, qrTargetUrl, qrFileName } from "./qr-logic.js";
import { formatPrice } from "../shared/product-logic.js";
import { showMessage } from "./ui.js";
import { t, getLanguage, onLanguageChange } from "../shared/i18n.js";

const modal = document.getElementById("qrModal");
const dialog = modal.querySelector(".qr-modal-box");
const background = [document.getElementById("app-view"), document.getElementById("login-view")];
const title = document.getElementById("qrTitle");
const price = document.getElementById("qrPrice");
const container = document.getElementById("qrContainer");
const linkText = document.getElementById("qrLink");
const warning = document.getElementById("qrWarning");
const siteInput = document.getElementById("qrSiteUrl");
const siteMessage = document.getElementById("qrSiteMessage");
const saveButton = document.getElementById("qrSiteSave");

let currentProduct = null;
let opener = null; // the element that had focus before the window opened
let siteUrl = null; // the saved address; null until loaded (or when loading failed), "" when none is saved

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

    renderTexts();
}

/** The parts of the window that depend on the language (the QR code itself does not). */
function renderTexts() {
    title.textContent = currentProduct.name || t("qr.title");
    price.textContent = formatPrice(currentProduct.price, getLanguage());
    showMessage(warning, isLocalAddress(effectiveSiteUrl()) ? "qr.localWarning" : "");
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
        showMessage(siteMessage, "qr.saved");
    } catch (err) {
        console.error("Site adresi kaydedilemedi:", err);
        siteMessage.className = "small mt-1 text-danger";
        showMessage(siteMessage, "qr.saveFailed");
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

const isOpen = () => !modal.classList.contains("d-none");

function openDialog() {
    opener = document.activeElement;
    modal.classList.remove("d-none");
    background.forEach((part) => part.setAttribute("inert", ""));
    dialog.focus();
}

function closeQr() {
    modal.classList.add("d-none");
    background.forEach((part) => part.removeAttribute("inert"));
    (opener?.isConnected ? opener : document.getElementById("search-input")).focus();
    opener = null;
}

/** Keeps Tab and Shift+Tab inside the dialog. */
function keepFocusInside(event) {
    const focusable = [...dialog.querySelectorAll("button:not(:disabled), input:not(:disabled)")].filter(
        (element) => element.offsetParent !== null
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onEdge = event.shiftKey
        ? document.activeElement === first || document.activeElement === dialog
        : document.activeElement === last;

    if (onEdge) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
    }
}

export function initQrModal() {
    document.getElementById("qrCloseBtn").addEventListener("click", closeQr);
    document.getElementById("qrDownloadBtn").addEventListener("click", downloadPng);
    document.getElementById("qrPrintBtn").addEventListener("click", () => window.print());
    saveButton.addEventListener("click", saveAddress);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeQr(); // a click on the dark area around the window
    });
    document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;
        if (e.key === "Escape") closeQr();
        if (e.key === "Tab") keepFocusInside(e);
    });
    siteInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveAddress();
    });
    onLanguageChange(() => {
        if (isOpen() && currentProduct) renderTexts();
    });
}

/** Opens the window for a product (an object with id, name and price). */
export async function showQr(product) {
    currentProduct = product;
    title.textContent = product.name || t("qr.title");
    price.textContent = formatPrice(product.price, getLanguage());
    showMessage(siteMessage, "");
    openDialog();

    if (siteUrl === null) {
        // null again when the address could not be read: it is then tried again the next time
        siteUrl = await loadSiteUrl();
    }
    render();
}
