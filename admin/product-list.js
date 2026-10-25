// The product cards in the admin panel: loading, search, paging and deleting.

import { db, collection, getDocs, deleteDoc, doc } from "../shared/firebase.js";
import { el, safeHttpUrl } from "../shared/dom.js";
import { stockStatus, formatPrice } from "../shared/product-logic.js";
import { filterProductsByName, pageInfo } from "./list-logic.js";
import { deleteProductImage } from "./product-images.js";
import { showMessage } from "./ui.js";

const ITEMS_PER_PAGE = 4;

const grid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const previousButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const listError = document.getElementById("list-error");

let products = [];
let currentPage = 0;
let handlers = { onEdit() {}, onShowQr() {}, onAccessDenied() {} };

function stockBadge(value) {
    const stock = stockStatus(value);
    if (stock.level === "ok") {
        return { className: "bg-success", text: `Stok: ${stock.count}` }; // Yeşil - Sorun yok
    }
    if (stock.level === "low") {
        return { className: "bg-warning text-dark", text: `Kritik Stok: ${stock.count}` }; // Turuncu - Takip et!
    }
    return { className: "bg-danger", text: "Tükendi" }; // Kırmızı - Hemen sipariş ver!
}

function actionButton(className, title, icon, onClick) {
    return el("button", {
        className: `btn btn-sm ${className} flex-grow-1`,
        attrs: { title, type: "button" },
        on: { click: onClick }
    }, [el("i", { className: `bi ${icon}` })]);
}

// A product without a usable image (or whose image fails to load) shows a neutral icon instead of a broken image.
function imageOrPlaceholder(imageUrl) {
    const placeholder = () => el("div", { className: "product-img product-img-placeholder" }, [el("i", { className: "bi bi-image" })]);
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
                el("h6", { className: "product-title mb-0 fw-bold text-white text-truncate", text: String(p.name ?? "") }),
                el("span", { className: "product-price text-primary fw-bold", text: formatPrice(p.price) })
            ]),
            el("p", { className: "product-desc", text: p.description || "Açıklama yok." }),
            el("div", { className: "mt-auto d-flex gap-2" }, [
                actionButton("btn-outline-light", "Düzenle", "bi-pencil", () => handlers.onEdit(p)),
                actionButton("btn-outline-danger", "Sil", "bi-trash", () => deleteProduct(p.id)),
                actionButton("btn-primary", "QR Göster", "bi-qr-code", () => handlers.onShowQr(p))
            ])
        ])
    ]);
}

function renderProducts() {
    const filtered = filterProductsByName(products, searchInput.value);
    const page = pageInfo(filtered.length, currentPage, ITEMS_PER_PAGE);
    currentPage = page.page;

    grid.replaceChildren(...filtered.slice(page.start, page.end).map(buildProductCard));

    previousButton.disabled = !page.hasPrevious;
    nextButton.disabled = !page.hasNext;
}

async function deleteProduct(id) {
    if (!confirm("Silmek istiyor musun?")) return;

    try {
        const imageUrl = findProduct(id)?.image;
        await deleteDoc(doc(db, "products", id));
        await deleteProductImage(imageUrl);
        await loadProducts();
    } catch (err) {
        console.error("Silme hatası:", err);
        showMessage(listError, "Ürün silinemedi. Lütfen tekrar deneyin.");
    }
}

/**
 * Connects the list to the page. Callbacks: onEdit(product), onShowQr(product), and
 * onAccessDenied() for when the signed-in account is not allowed to read the products.
 */
export function initProductList(callbacks) {
    handlers = { ...handlers, ...callbacks };

    searchInput.addEventListener("input", () => {
        currentPage = 0;
        renderProducts();
    });
    previousButton.addEventListener("click", () => { currentPage--; renderProducts(); });
    nextButton.addEventListener("click", () => { currentPage++; renderProducts(); });
}

export function findProduct(id) {
    return products.find((p) => p.id === id);
}

export async function loadProducts() {
    showMessage(listError, "");

    try {
        const snapshot = await getDocs(collection(db, "products"));
        products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error("Ürünler alınamadı:", err);
        if (err?.code === "permission-denied") {
            // Signed in, but not the admin account named in the security rules.
            await handlers.onAccessDenied();
        } else {
            showMessage(listError, "Ürünler yüklenemedi. Lütfen sayfayı yenileyin.");
        }
        return;
    }

    renderProducts();
}

export function clearProducts() {
    products = [];
    currentPage = 0;
    grid.replaceChildren();
}
