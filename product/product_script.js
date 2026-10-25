import { db, doc, getDoc } from "../shared/firebase.js";
import { el, safeHttpUrl } from "../shared/dom.js";
import { storeConfig } from "../shared/store-config.js";
import { expiryStatus, stockStatus, discountFor, formatPrice, formatDate, categoryKey } from "../shared/product-logic.js";
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
        // GÜVENLİ: limitten fazla (YEŞİL)
        stockEl.textContent = t("product.stock.ok");
        stockEl.className = `${base} bg-success`;
    } else if (stock.level === "low") {
        // KRİTİK: limit ve altı (TURUNCU)
        stockEl.textContent = t("product.stock.low", { count: stock.count });
        stockEl.className = `${base} bg-warning text-dark fw-bold animate-pulse`;
    } else {
        // TÜKENDİ (KIRMIZI)
        stockEl.textContent = t("product.stock.out");
        stockEl.className = `${base} bg-danger`;
    }
}

function expiryText(status) {
    switch (status.state) {
        case "upcoming": return t("product.expiry.days", { count: status.daysLeft });
        case "today": return t("product.expiry.today");
        case "expired": return t("product.expiry.expired");
        default: return "";
    }
}

// SKT / TETT kutusu: tür rozeti, tarih ve kalan süre
function renderDateBox(boxEl, p, status) {
    // MEVZUAT MANTIĞI: Eski ürünlerde dateType yoksa varsayılan SKT yap
    const dateType = p.dateType === "TETT" ? "TETT" : "SKT";
    const dateLabel = dateType === "TETT" ? t("product.date.tett") : t("product.date.skt");

    const typeBadge = el("span", {
        className: dateType === "TETT" ? "badge bg-info text-dark ms-2" : "badge bg-danger ms-2",
        text: dateType,
        attrs: { style: "font-size: 0.7rem; letter-spacing: 0.5px;" }
    });

    const isWarning = status.state === "expired" || status.state === "today" ||
        (status.state === "upcoming" && status.daysLeft <= storeConfig.expiryWarningDays);

    const lines = [
        el("div", {
            className: "text-muted small text-uppercase fw-bold",
            attrs: { style: "font-size: 0.7rem;" }
        }, [`${dateLabel} `, typeBadge]),
        el("div", {
            className: "text-dark mt-1",
            text: formatDate(p.lastUseDate, getLanguage()) ?? t("product.notSpecified"),
            attrs: { style: "font-size: 1.1rem;" }
        })
    ];

    if (status.state !== "none") {
        lines.push(el("div", { className: `small mt-1 ${isWarning ? "text-danger fw-bold" : "text-secondary"}` }, [
            el("i", { className: `bi ${isWarning ? "bi-exclamation-circle" : "bi-clock-history"}` }),
            ` ${expiryText(status)}`
        ]));
    }

    boxEl.replaceChildren(
        el("div", { className: "d-flex justify-content-between align-items-start w-100" }, [el("div", {}, lines)])
    );
}

function buildCoupon(discount) {
    const code = el("span", { className: "badge bg-success", text: discount.couponCode, attrs: { style: "font-size: 1rem;" } });
    const percent = el("strong", { text: t("product.coupon.discount", { percent: discount.ratePercent }) });

    return el("div", { className: "alert alert-success mt-3 shadow-sm animate-bounce", attrs: { id: "coupon" } }, [
        el("div", { className: "d-flex align-items-center gap-3" }, [
            el("i", { className: "bi bi-ticket-perforated-fill fs-2" }),
            el("div", {}, [
                el("strong", { className: "text-dark", text: t("product.coupon.title") }),
                el("br"),
                el("small", { className: "text-dark" },
                    tParts(discount.dateType === "TETT" ? "product.coupon.tett" : "product.coupon.skt", { code, discount: percent })),
                el("br"),
                el("small", { className: "text-muted", text: t("product.coupon.demo") })
            ])
        ])
    ]);
}

// Fiyat, son güncelleme tarihi ve (uygunsa) indirim kuponu
function renderPrice(priceEl, p, now) {
    const updateNote = el("div", {
        className: "text-muted mt-1",
        attrs: { style: "font-size: 0.8rem; font-weight: normal;" }
    }, [
        el("i", { className: "bi bi-clock-history" }),
        ` ${t("product.priceUpdated", { date: formatDate(p.priceLastUpdate, getLanguage()) ?? t("product.notSpecified") })}`
    ]);

    document.getElementById("coupon")?.remove();
    const discount = discountFor(p, now);

    if (!discount.eligible) {
        priceEl.replaceChildren(`${formatPrice(p.price, getLanguage())} `, updateNote);
        return;
    }

    priceEl.replaceChildren(
        el("span", { className: "text-muted text-decoration-line-through fs-5 me-2", text: formatPrice(discount.originalPrice, getLanguage()) }),
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

    let snap;
    try {
        snap = await getDoc(doc(db, "products", productId));
    } catch (err) {
        // The product may exist; we just could not reach the database.
        console.error("Firebase Hatası:", err);
        showOnly("loadError");
        return;
    }

    if (!snap.exists()) {
        showOnly("notFound");
        return;
    }

    try {
        shownProduct = snap.data();
        renderImage(shownProduct);
        renderTexts(shownProduct, new Date());
        showOnly("card");
    } catch (err) {
        console.error("Ürün gösterilemedi:", err);
        showOnly("notFound");
    }
}

// The product being shown, kept so the texts can be redrawn when the language changes.
let shownProduct = null;
onLanguageChange(() => {
    if (shownProduct) renderTexts(shownProduct, new Date());
});

document.getElementById("retry-btn").addEventListener("click", loadProduct);

loadProduct();
