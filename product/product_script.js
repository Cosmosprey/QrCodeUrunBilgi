import { db, doc, getDoc } from "../shared/firebase.js";
import { el, safeHttpUrl } from "../shared/dom.js";
import { storeConfig } from "../shared/store-config.js";
import {
    expiryStatus,
    stockStatus,
    discountFor,
    formatPrice,
    formatDate,
    categoryKey,
    isValidProductId,
    msUntilNextMidnight,
    isStale
} from "../shared/product-logic.js";
import { t, tParts, getLanguage, onLanguageChange } from "../shared/i18n.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const views = {
    loading: document.getElementById("loading"),
    notFound: document.getElementById("error"),
    loadError: document.getElementById("load-error"),
    card: document.getElementById("product-card")
};

function showOnly(name) {
    for (const [key, element] of Object.entries(views)) {
        element.classList.toggle("d-none", key !== name);
    }
}

function renderStock(stockEl, stockCount) {
    const stock = stockStatus(stockCount);
    const base = "badge rounded-pill shadow-sm px-3 py-2";

    if (stock.level === "ok") {
        // SAFE: above the limit (green)
        stockEl.textContent = t("product.stock.ok");
        stockEl.className = `${base} bg-success`;
    } else if (stock.level === "low") {
        // CRITICAL: at or below the limit (orange)
        stockEl.textContent = t("product.stock.low", { count: stock.count });
        stockEl.className = `${base} bg-warning text-dark fw-bold animate-pulse`;
    } else {
        // OUT OF STOCK (red)
        stockEl.textContent = t("product.stock.out");
        stockEl.className = `${base} bg-danger`;
    }
}

function expiryText(status) {
    switch (status.state) {
        case "upcoming":
            return t("product.expiry.days", { count: status.daysLeft });
        case "today":
            return t("product.expiry.today");
        case "expired":
            return t("product.expiry.expired");
        default:
            return "";
    }
}

// The SKT / TETT box: the type badge, the date and the time left
function renderDateBox(boxEl, p, status) {
    // An old record may have no dateType: it counts as SKT
    const dateType = p.dateType === "TETT" ? "TETT" : "SKT";
    const dateLabel = dateType === "TETT" ? t("product.date.tett") : t("product.date.skt");

    const typeBadge = el("span", {
        className: dateType === "TETT" ? "badge bg-info text-dark ms-2" : "badge bg-danger ms-2",
        text: dateType,
        attrs: { style: "font-size: 0.7rem; letter-spacing: 0.5px;" }
    });

    const isWarning =
        status.state === "expired" ||
        status.state === "today" ||
        (status.state === "upcoming" && status.daysLeft <= storeConfig.expiryWarningDays);

    const lines = [
        el(
            "div",
            {
                className: "text-muted small text-uppercase fw-bold",
                attrs: { style: "font-size: 0.7rem;" }
            },
            [`${dateLabel} `, typeBadge]
        ),
        el("div", {
            className: "text-dark mt-1",
            text: formatDate(p.lastUseDate, getLanguage()) ?? t("product.notSpecified"),
            attrs: { style: "font-size: 1.1rem;" }
        })
    ];

    if (status.state !== "none") {
        lines.push(
            el("div", { className: `small mt-1 ${isWarning ? "text-danger fw-bold" : "text-secondary"}` }, [
                el("i", { className: `bi ${isWarning ? "bi-exclamation-circle" : "bi-clock-history"}` }),
                ` ${expiryText(status)}`
            ])
        );
    }

    boxEl.replaceChildren(
        el("div", { className: "d-flex justify-content-between align-items-start w-100" }, [el("div", {}, lines)])
    );
}

function buildCoupon(discount) {
    const code = el("span", {
        className: "badge bg-success",
        text: discount.couponCode,
        attrs: { style: "font-size: 1rem;" }
    });
    const percent = el("strong", { text: t("product.coupon.discount", { percent: discount.ratePercent }) });

    return el("div", { className: "alert alert-success mt-3 shadow-sm animate-bounce", attrs: { id: "coupon" } }, [
        el("div", { className: "d-flex align-items-center gap-3" }, [
            el("i", { className: "bi bi-ticket-perforated-fill fs-2" }),
            el("div", {}, [
                el("strong", { className: "text-dark", text: t("product.coupon.title") }),
                el("br"),
                el(
                    "small",
                    { className: "text-dark" },
                    tParts(discount.dateType === "TETT" ? "product.coupon.tett" : "product.coupon.skt", {
                        code,
                        discount: percent
                    })
                ),
                el("br"),
                el("small", { className: "text-muted", text: t("product.coupon.demo") })
            ])
        ])
    ]);
}

// The price, the date it last changed and (when eligible) the discount coupon
function renderPrice(priceEl, p, now) {
    const updateNote = el(
        "div",
        {
            className: "text-muted mt-1",
            attrs: { style: "font-size: 0.8rem; font-weight: normal;" }
        },
        [
            el("i", { className: "bi bi-clock-history" }),
            ` ${t("product.priceUpdated", { date: formatDate(p.priceLastUpdate, getLanguage()) ?? t("product.notSpecified") })}`
        ]
    );

    document.getElementById("coupon")?.remove();
    const discount = discountFor(p, now);

    if (!discount.eligible) {
        priceEl.replaceChildren(`${formatPrice(p.price, getLanguage())} `, updateNote);
        return;
    }

    priceEl.replaceChildren(
        el("span", {
            className: "text-muted text-decoration-line-through fs-5 me-2",
            text: formatPrice(discount.originalPrice, getLanguage())
        }),
        el("span", { className: "text-success", text: formatPrice(discount.finalPrice, getLanguage()) }),
        updateNote
    );
    document.querySelector(".price-segment")?.after(buildCoupon(discount));
}

// A product category is stored in Turkish; the three known ones are shown in the current language.
function categoryLabel(category) {
    const key = categoryKey(category);
    return key ? t(key) : (category ?? "");
}

// The image is set once per product (redoing it would reload it). A missing image, or one that fails to load,
// is replaced by a neutral icon.
function renderImage(p) {
    const imageEl = document.getElementById("image");
    const placeholderEl = document.getElementById("image-placeholder");
    const imageUrl = safeHttpUrl(p.image);
    const showPlaceholder = (show) => {
        imageEl.classList.toggle("d-none", show);
        placeholderEl.classList.toggle("d-none", !show);
    };
    imageEl.alt = p.name ?? "";
    showPlaceholder(!imageUrl);
    if (imageUrl) {
        imageEl.addEventListener("error", () => showPlaceholder(true), { once: true });
        imageEl.src = imageUrl;
    } else {
        imageEl.removeAttribute("src");
    }
}

// Everything that depends on the language or on today's date.
function renderTexts(p, now) {
    document.getElementById("name").textContent = p.name ?? "";
    document.title = p.name ? t("product.titleWithName", { name: p.name }) : t("product.title");
    document.getElementById("description").textContent = p.description || t("product.noDescription");
    document.getElementById("category").textContent = categoryLabel(p.category);

    renderStock(document.getElementById("stock"), p.stockCount);
    renderDateBox(document.getElementById("lastUseDate"), p, expiryStatus(p.lastUseDate, now));
    renderPrice(document.getElementById("price"), p, now);
}

async function loadProduct() {
    if (!productId) {
        showOnly("notFound");
        return;
    }

    showOnly("loading");

    // An id that cannot be a document id (for example one with a slash) is a product that does not exist
    if (!isValidProductId(productId)) {
        showOnly("notFound");
        return;
    }

    let snap;
    try {
        snap = await getDoc(doc(db, "products", productId));
    } catch (err) {
        // The product may exist; we just could not reach the database.
        console.error("Could not load the product:", err);
        showOnly("loadError");
        return;
    }

    if (!snap.exists()) {
        showOnly("notFound");
        return;
    }

    try {
        shownProduct = snap.data();
        loadedAt = Date.now();
        renderImage(shownProduct);
        renderTexts(shownProduct, new Date());
        showOnly("card");
        scheduleMidnightRefresh();
    } catch (err) {
        console.error("Could not show the product:", err);
        showOnly("notFound");
    }
}

// The product being shown, kept so the texts can be redrawn when the language changes or the day changes.
let shownProduct = null;
let loadedAt = 0;
let midnightTimer;
onLanguageChange(() => {
    if (shownProduct) renderTexts(shownProduct, new Date());
});

// The page is a snapshot: a phone may keep it open for hours. So the product is read again when the visitor comes
// back to the page (if the data is older than a minute), and at midnight, when the days left and the coupon change.
const REFRESH_AFTER_MS = 60 * 1000;

/**
 * Reads the product again and redraws the page. A failure is not shown: the page keeps what it has (with the days
 * left worked out again), because the visitor did not ask for anything.
 */
async function refreshProduct() {
    if (!shownProduct) return;
    try {
        const snap = await getDoc(doc(db, "products", productId));
        if (!snap.exists()) {
            shownProduct = null; // the product was deleted while the page was open
            showOnly("notFound");
            return;
        }
        const next = snap.data();
        const pictureChanged = next.image !== shownProduct.image;
        shownProduct = next;
        loadedAt = Date.now();
        if (pictureChanged) renderImage(next);
        renderTexts(next, new Date());
    } catch (err) {
        console.warn("Could not refresh the product:", err);
        renderTexts(shownProduct, new Date());
    }
}

function scheduleMidnightRefresh() {
    clearTimeout(midnightTimer);
    // one second after midnight, so the new day is certainly there; a day is far below the longest possible timeout
    midnightTimer = setTimeout(
        async () => {
            await refreshProduct();
            scheduleMidnightRefresh();
        },
        msUntilNextMidnight(new Date()) + 1000
    );
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !shownProduct) return;
    if (isStale(loadedAt, Date.now(), REFRESH_AFTER_MS)) refreshProduct();
    else renderTexts(shownProduct, new Date()); // the day may have changed
});

document.getElementById("retry-btn").addEventListener("click", loadProduct);

loadProduct();
