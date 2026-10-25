// The product cards in the admin panel: loading, search, paging and deleting.

import { db, collection, getDocs, deleteDoc, doc } from "../shared/firebase.js";
import { el, safeHttpUrl } from "../shared/dom.js";
import { stockStatus, formatPrice } from "../shared/product-logic.js";
import { filterProductsByName, pageInfo, listState } from "./list-logic.js";
import { deleteProductImage } from "./product-images.js";
import { showMessage } from "./ui.js";
import { showToast } from "./toast.js";
import { t, getLanguage, onLanguageChange } from "../shared/i18n.js";

const ITEMS_PER_PAGE = 4;

const grid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const previousButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const listError = document.getElementById("list-error");

let products = [];
let loaded = false; // true after the first answer from Firestore
let currentPage = 0;
let handlers = { onEdit() {}, onShowQr() {}, onAccessDenied() {}, onDeleted() {}, isBusy: () => false };

function stockBadge(value) {
    const stock = stockStatus(value);
    if (stock.level === "ok") {
        return { className: "bg-success", text: t("card.stockOk", { count: stock.count }) }; // green: fine
    }
    if (stock.level === "low") {
        return { className: "bg-warning text-dark", text: t("card.stockLow", { count: stock.count }) }; // orange: keep an eye on it
    }
    return { className: "bg-danger", text: t("card.stockOut") }; // red: reorder now
}

function actionButton(className, title, icon, onClick) {
    return el(
        "button",
        {
            className: `btn btn-sm ${className} flex-grow-1`,
            attrs: { title, "aria-label": title, type: "button" },
            on: { click: onClick }
        },
        [el("i", { className: `bi ${icon}`, attrs: { "aria-hidden": "true" } })]
    );
}

// A product without a usable image (or whose image fails to load) shows a neutral icon instead of a broken image.
function imageOrPlaceholder(imageUrl) {
    const placeholder = () =>
        el("div", { className: "product-img product-img-placeholder" }, [el("i", { className: "bi bi-image" })]);
    if (!imageUrl) return placeholder();

    const image = el("img", { className: "product-img", attrs: { src: imageUrl, loading: "lazy", alt: "" } });
    image.addEventListener("error", () => image.replaceWith(placeholder()), { once: true });
    return image;
}

function buildProductCard(p) {
    const badge = stockBadge(p.stockCount);
    const imageUrl = safeHttpUrl(p.image);

    return el("div", { className: "product-card d-flex flex-column position-relative shadow" }, [
        el("span", { className: `badge position-absolute top-0 end-0 m-3 ${badge.className}`, text: badge.text }),
        imageOrPlaceholder(imageUrl),
        el("div", { className: "p-3 d-flex flex-column flex-grow-1" }, [
            el("div", { className: "d-flex justify-content-between align-items-center mb-1" }, [
                el("h3", {
                    className: "product-title h6 mb-0 fw-bold text-white text-truncate",
                    text: String(p.name ?? "")
                }),
                el("span", {
                    className: "product-price text-primary fw-bold",
                    text: formatPrice(p.price, getLanguage())
                })
            ]),
            el("p", { className: "product-desc", text: p.description || t("card.noDescription") }),
            el("div", { className: "mt-auto d-flex gap-2" }, [
                actionButton("btn-outline-light", t("card.edit"), "bi-pencil", () => handlers.onEdit(p)),
                actionButton("btn-outline-danger", t("card.delete"), "bi-trash", () => deleteProduct(p.id)),
                actionButton("btn-primary", t("card.qr"), "bi-qr-code", () => handlers.onShowQr(p))
            ])
        ])
    ]);
}

const STATUS_KEYS = {
    loading: "list.loading",
    empty: "list.empty",
    "no-results": "list.noResults"
};

function renderProducts() {
    const filtered = filterProductsByName(products, searchInput.value);
    const page = pageInfo(filtered.length, currentPage, ITEMS_PER_PAGE);
    currentPage = page.page;

    const state = listState({ loaded, total: products.length, matching: filtered.length });
    if (state === "list") {
        grid.replaceChildren(...filtered.slice(page.start, page.end).map(buildProductCard));
    } else {
        grid.replaceChildren(el("p", { className: "list-status", text: t(STATUS_KEYS[state]) }));
    }

    previousButton.disabled = !page.hasPrevious;
    nextButton.disabled = !page.hasNext;
}

async function deleteProduct(id) {
    if (handlers.isBusy()) return; // a save is running
    if (!confirm(t("list.confirmDelete"))) return;

    try {
        const imageUrl = findProduct(id)?.image;
        await deleteDoc(doc(db, "products", id));
        await deleteProductImage(imageUrl);
        handlers.onDeleted(id);
        await loadProducts();
        showToast(t("toast.deleted"));
    } catch (err) {
        console.error("Could not delete the product:", err);
        showMessage(listError, "list.deleteError");
    }
}

/**
 * Connects the list to the page. Callbacks: onEdit(product), onShowQr(product), onDeleted(id) after a product was
 * deleted, isBusy() (true while a save is running: nothing may be edited or deleted then) and
 * onAccessDenied() for when the signed-in account is not allowed to read the products.
 */
export function initProductList(callbacks) {
    handlers = { ...handlers, ...callbacks };

    searchInput.addEventListener("input", () => {
        currentPage = 0;
        renderProducts();
    });
    previousButton.addEventListener("click", () => {
        currentPage--;
        renderProducts();
    });
    nextButton.addEventListener("click", () => {
        currentPage++;
        renderProducts();
    });
    onLanguageChange(renderProducts);
}

export function findProduct(id) {
    return products.find((p) => p.id === id);
}

export async function loadProducts() {
    showMessage(listError, "");
    if (!loaded) renderProducts(); // "Loading products..." until the first answer

    try {
        const snapshot = await getDocs(collection(db, "products"));
        products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        loaded = true;
    } catch (err) {
        console.error("Could not load the products:", err);
        grid.replaceChildren(); // do not leave the loading text on screen
        if (err?.code === "permission-denied") {
            // Signed in, but not the admin account named in the security rules.
            await handlers.onAccessDenied();
        } else {
            showMessage(listError, "list.loadError");
        }
        return;
    }

    renderProducts();
}

export function clearProducts() {
    products = [];
    loaded = false;
    currentPage = 0;
    grid.replaceChildren();
}
