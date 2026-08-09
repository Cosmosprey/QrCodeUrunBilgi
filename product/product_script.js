import { db, doc, getDoc } from "./firebase.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const loading = document.getElementById("loading");
const card = document.getElementById("product-card");
const error = document.getElementById("error");

async function loadProduct() {
    if (!productId) {
        if (loading) loading.style.display = "none";
        if (error) error.classList.remove("d-none");
        return;
    }

    try {
        const ref = doc(db, "products", productId);
        const snap = await getDoc(ref);

        if (loading) loading.style.display = "none";

        if (!snap.exists()) {
            if (error) error.classList.remove("d-none");
            return;
        }

        const p = snap.data();

        // UI Doldurma
        document.getElementById("name").innerText = p.name;
        document.getElementById("price").innerText = p.price + " ₺";
        document.getElementById("description").innerText = p.description || "Açıklama belirtilmedi.";
        document.getElementById("image").src = p.image;
        if (document.getElementById("category")) document.getElementById("category").innerText = p.category;

        // Stok Durumu Gösterimi
        const stockEl = document.getElementById("stock");
        const count = p.stockCount || 0;

        if (count > 10) {
            // 1. KATMAN: GÜVENLİ 10'dan fazla (YEŞİL)
            stockEl.innerText = `STOKTA VAR`;
            stockEl.className = "badge rounded-pill bg-success shadow-sm px-3 py-2";
        }
        else if (count > 0) {
            // 2. KATMAN: KRİTİK 10'dan az (TURUNCU)
            stockEl.innerText = `SON ${count} ÜRÜN!`;
            stockEl.className = "badge rounded-pill bg-warning text-dark shadow-sm px-3 py-2 fw-bold";

            stockEl.classList.add("animate-pulse");
        }
        else {
            // 3. KATMAN: TÜKENDİ 0 (KIRMIZI)
            stockEl.innerText = "TÜKENDİ";
            stockEl.className = "badge rounded-pill bg-danger shadow-sm px-3 py-2";
        }

        // Son Kullanma Tarihi Hesaplama (Özgün Özellik)
        if (p.lastUseDate) {
            const wDate = new Date(p.lastUseDate);
            const today = new Date();
            const diff = wDate - today;
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

            const lastUseDateEl = document.getElementById("lastUseDate");
            if (days > 0) {
                lastUseDateEl.innerText = `Son Kullanma Tarihinin Geçmesine ${days} Gün Kaldı`;
                lastUseDateEl.className = "fw-bold text-dark";
            } else {
                lastUseDateEl.innerText = "Tarihi Geçmiş";
                lastUseDateEl.className = "fw-bold text-danger";
            }
        }
        // --- Tarih Formatlama Fonksiyonu ---
        const formatDate = (dateStr) => {
            if (!dateStr) return "Belirtilmedi";
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateStr).toLocaleDateString('tr-TR', options);
        };

        // --- SKT/TETT ve Kalan Gün Gösterimi ---
        const expiryDate = new Date(p.lastUseDate);
        const today = new Date();
        const timeDiff = expiryDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // MEVZUAT MANTIĞI: Eski ürünlerde dateType yoksa varsayılan SKT yap
        const dateType = p.dateType || "SKT";
        const dateLabel = dateType === "TETT" ? "Tavsiye Edilen Tüketim Tarihi" : "Son Kullanma Tarihi";
        const couponReasonText = dateType === "TETT" ? "tavsiye edilen tüketim tarihi" : "SKT'si";

        // Türüne göre şık bir rozet (badge) oluşturuyoruz
        const typeBadge = dateType === "TETT"
            ? `<span class="badge bg-info text-dark ms-2" style="font-size: 0.7rem; letter-spacing: 0.5px;">TETT</span>`
            : `<span class="badge bg-danger ms-2" style="font-size: 0.7rem; letter-spacing: 0.5px;">SKT</span>`;

        const warrantyEl = document.getElementById("lastUseDate");
        if (warrantyEl) {
            let statusText = daysDiff > 0 ? `${daysDiff} Gün Kaldı` : "Tarihi Geçti";

            // Kutunun içini daha düzenli ve rozetli hale getiriyoruz
            warrantyEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-start w-100">
                    <div>
                        <div class="text-muted small text-uppercase fw-bold" style="font-size: 0.7rem;">
                            ${dateLabel} ${typeBadge}
                        </div>
                        <div class="fw-black text-dark mt-1" style="font-size: 1.1rem;">
                            ${formatDate(p.lastUseDate)}
                        </div>
                        <div class="small mt-1 ${daysDiff <= 3 ? 'text-danger fw-bold' : 'text-secondary'}">
                            <i class="bi ${daysDiff <= 3 ? 'bi-exclamation-circle' : 'bi-clock-history'}"></i> ${statusText}
                        </div>
                    </div>
                </div>
            `;
        }

        // --- Fiyat, Son Güncelleme ve Kupon Mantığı ---
        const priceEl = document.getElementById("price");
        if (priceEl) {
            const updateNote = `<div class="text-muted mt-1" style="font-size: 0.8rem; font-weight: normal;">
                <i class="bi bi-clock-history"></i> Son Fiyat Güncelleme: ${formatDate(p.priceLastUpdate)}
            </div>`;

            // İndirim Şartı: SKT ise son 3 gün, TETT ise tarihi geçmiş olsa bile indirim. 
            const isDiscountEligible = (dateType === "TETT" && daysDiff < 0) || (dateType === "SKT" && daysDiff <= 3 && daysDiff >= 0);

            if (isDiscountEligible) {
                const discountedPrice = (p.price * 0.8).toFixed(2);

                // İndirimli fiyatı göster
                priceEl.innerHTML = `
                    <span class="text-muted text-decoration-line-through fs-5 me-2">${p.price} ₺</span>
                    <span class="text-success fw-black">${discountedPrice} ₺</span>
                    ${updateNote}`;

                // Kuponu Oluştur
                const couponDiv = document.createElement("div");
                couponDiv.className = "alert alert-success mt-3 shadow-sm animate-bounce";
                couponDiv.innerHTML = `
                    <div class="d-flex align-items-center gap-3">
                        <i class="bi bi-ticket-perforated-fill fs-2"></i>
                        <div>
                            <strong class="text-dark">Sürdürülebilirlik Fırsatı!</strong><br>
                            <small class="text-dark">Ürünün ${couponReasonText} yaklaştığı için kasada 
                            <span class="badge bg-success" style="font-size: 1rem;">KAZAN20</span> koduyla <strong>%20 indirim</strong> kazanın!</small>
                        </div>
                    </div>`;

                const priceSegment = document.querySelector(".price-segment");
                if (priceSegment) priceSegment.after(couponDiv);

            } else {
                // İndirim yoksa sadece normal fiyat
                priceEl.innerHTML = `${p.price} ₺ ${updateNote}`;
            }
        }

        // Kartı Göster
        card.classList.remove("d-none");
    } catch (err) {
        console.error("Firebase Hatası:", err);
        if (loading) loading.style.display = "none";
        if (error) error.classList.remove("d-none");
    }
}


loadProduct();