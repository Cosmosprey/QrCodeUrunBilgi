import { db, doc, getDoc } from "../shared/firebase.js";
import { el, safeHttpUrl } from "../shared/dom.js";
import { storeConfig } from "../shared/store-config.js";
import { expiryStatus, stockStatus, discountFor, formatPrice, formatDateTr } from "../shared/product-logic.js";

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
        stockEl.textContent = "STOKTA VAR";
        stockEl.className = `${base} bg-success`;
    } else if (stock.level === "low") {
        // KRİTİK: limit ve altı (TURUNCU)
        stockEl.textContent = `SON ${stock.count} ÜRÜN!`;
        stockEl.className = `${base} bg-warning text-dark fw-bold animate-pulse`;
    } else {
        // TÜKENDİ (KIRMIZI)
        stockEl.textContent = "TÜKENDİ";
        stockEl.className = `${base} bg-danger`;
    }
}

function expiryText(status) {
    switch (status.state) {
        case "upcoming": return `${status.daysLeft} Gün Kaldı`;
        case "today": return "Bugün son gün";
        case "expired": return "Tarihi Geçti";
        default: return "";
    }
}

// SKT / TETT kutusu: tür rozeti, tarih ve kalan süre
function renderDateBox(boxEl, p, status) {
    // MEVZUAT MANTIĞI: Eski ürünlerde dateType yoksa varsayılan SKT yap
    const dateType = p.dateType === "TETT" ? "TETT" : "SKT";
    const dateLabel = dateType === "TETT" ? "Tavsiye Edilen Tüketim Tarihi" : "Son Kullanma Tarihi";

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
            className: "fw-black text-dark mt-1",
            text: formatDateTr(p.lastUseDate),
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
    const reason = discount.dateType === "TETT"
        ? "tavsiye edilen tüketim tarihi geçtiği"
        : "SKT'si yaklaştığı";

    return el("div", { className: "alert alert-success mt-3 shadow-sm animate-bounce", attrs: { id: "coupon" } }, [
        el("div", { className: "d-flex align-items-center gap-3" }, [
            el("i", { className: "bi bi-ticket-perforated-fill fs-2" }),
            el("div", {}, [
                el("strong", { className: "text-dark", text: "Sürdürülebilirlik Fırsatı!" }),
                el("br"),
                el("small", { className: "text-dark" }, [
                    `Ürünün ${reason} için kasada `,
                    el("span", { className: "badge bg-success", text: discount.couponCode, attrs: { style: "font-size: 1rem;" } }),
                    " koduyla ",
                    el("strong", { text: `%${discount.ratePercent} indirim` }),
                    " kazanın!"
                ]),
                el("br"),
                el("small", { className: "text-muted", text: "Demo özelliği: gerçek bir ödeme akışı yoktur." })
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
        ` Son Fiyat Güncelleme: ${formatDateTr(p.priceLastUpdate)}`
    ]);

    document.getElementById("coupon")?.remove();
    const discount = discountFor(p, now);

    if (!discount.eligible) {
        priceEl.replaceChildren(`${formatPrice(p.price)} `, updateNote);
        return;
    }

    priceEl.replaceChildren(
        el("span", { className: "text-muted text-decoration-line-through fs-5 me-2", text: formatPrice(discount.originalPrice) }),
        el("span", { className: "text-success fw-black", text: formatPrice(discount.finalPrice) }),
        updateNote
    );
    document.querySelector(".price-segment")?.after(buildCoupon(discount));
}

function renderProduct(p, now) {
    document.getElementById("name").textContent = p.name ?? "";
    document.getElementById("description").textContent = p.description || "Açıklama belirtilmedi.";
    document.getElementById("category").textContent = p.category ?? "";

    const imageEl = document.getElementById("image");
    const imageUrl = safeHttpUrl(p.image);
    if (imageUrl) {
        imageEl.src = imageUrl;
    } else {
        imageEl.removeAttribute("src");
    }

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
        renderProduct(snap.data(), new Date());
        showOnly("card");
    } catch (err) {
        console.error("Ürün gösterilemedi:", err);
        showOnly("notFound");
    }
}

document.getElementById("retry-btn").addEventListener("click", loadProduct);

loadProduct();
