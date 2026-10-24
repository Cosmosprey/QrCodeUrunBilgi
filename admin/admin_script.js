import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "../shared/firebase.js";
import {
    auth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
    storage, ref, uploadBytes, getDownloadURL, deleteObject
} from "./firebase-admin.js";
import { generateQR } from "./easyqrcodejs.js";
import { el, safeHttpUrl } from "../shared/dom.js";
import { stockStatus, nextPriceUpdateDate, validateExpiryDate, formatPrice } from "../shared/product-logic.js";
import { usernameToEmail } from "./username.js";
import { validateImageFile, storagePathFor } from "./upload.js";
// --- GLOBAL STATE ---
let products = [];
let editingId = null;
let currentImageUrl = "";
let currentPage = 0;
const itemsPerPage = 4;

// --- AUTH (LOGIN / LOGOUT) ---
const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginButton = document.getElementById("login-btn");

function showMessage(element, message) {
    element.textContent = message;
    element.classList.toggle("d-none", !message);
}

function loginErrorMessage(err) {
    switch (err?.code) {
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-email":
            return "Kullanıcı adı veya parola hatalı.";
        case "auth/too-many-requests":
            return "Çok fazla hatalı deneme. Bir süre sonra tekrar deneyin.";
        case "auth/network-request-failed":
            return "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.";
        default:
            return "Giriş yapılamadı. Lütfen tekrar deneyin.";
    }
}

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    showMessage(loginError, "");

    const email = usernameToEmail(document.getElementById("login-username").value);
    const password = document.getElementById("login-password").value;
    if (!email || !password) {
        showMessage(loginError, "Kullanıcı adı veya parola hatalı.");
        return;
    }

    loginButton.disabled = true;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        showMessage(loginError, loginErrorMessage(err));
    } finally {
        loginButton.disabled = false;
    }
});

document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));

// The panel is only shown (and data only requested) while someone is signed in.
// What the signed-in user may actually do is decided by the Firestore/Storage rules, not here.
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginView.classList.add("d-none");
        appView.classList.remove("d-none");
        fetchProducts();
    } else {
        appView.classList.add("d-none");
        loginView.classList.remove("d-none");
        products = [];
        resetForm();
        document.getElementById("login-password").value = "";
        document.getElementById("product-grid").replaceChildren();
    }
});


// --- IMAGE UPLOAD ---
async function uploadImage(file) {
    const fileRef = ref(storage, storagePathFor(file, crypto.randomUUID()));

    await uploadBytes(fileRef, file, { contentType: file.type });

    const url = await getDownloadURL(fileRef);

    return url;
}

// Removes an image from Storage. A failure only leaves an unused file behind, so it never blocks the user.
async function deleteImageQuietly(url) {
    if (!safeHttpUrl(url)) return;
    try {
        await deleteObject(ref(storage, url));
    } catch (err) {
        console.warn("Görsel silinemedi (önemli değil):", err);
    }
}

// --- FORM SUBMIT (ADD / UPDATE)
document.getElementById("product-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const formError = document.getElementById("form-error");
    showMessage(formError, "");

    const file = document.getElementById("imageFile").files[0];
    const fileProblem = validateImageFile(file);
    if (fileProblem) {
        showMessage(formError, fileProblem);
        return;
    }

    const dateType = document.querySelector('input[name="dateType"]:checked').value;
    const dateProblem = validateExpiryDate({
        dateType,
        dateString: document.getElementById("lastUseDate").value,
        isNewProduct: !editingId
    });
    if (dateProblem) {
        showMessage(formError, dateProblem);
        return;
    }

    const submitButton = document.getElementById("submit-btn");
    submitButton.disabled = true;

    try {
        const previous = editingId ? products.find(x => x.id === editingId) : undefined;
        const oldImageUrl = currentImageUrl;
        let imageUrl = currentImageUrl;

        if (file) {
            imageUrl = await uploadImage(file);
        }

        const price = Number(document.getElementById("price").value);
        const productData = {
            name: document.getElementById("name").value,
            price,
            category: document.getElementById("category").value,
            description: document.getElementById("description").value,
            dateType,
            lastUseDate: document.getElementById("lastUseDate").value,
            image: imageUrl,
            stockCount: Number(document.getElementById("stockCount").value),
            // Fiyatın değiştiği son tarih: sadece yeni üründe veya fiyat değişince bugüne ayarlanır
            priceLastUpdate: nextPriceUpdateDate({
                previousPrice: previous?.price,
                previousDate: previous?.priceLastUpdate,
                newPrice: price
            })
        };


        if (editingId) {
            const refDoc = doc(db, "products", editingId);
            await updateDoc(refDoc, productData);
        } else {
            await addDoc(collection(db, "products"), productData);
        }

        // Yeni görsel yüklendiyse eskisi artık kullanılmıyor
        if (file && oldImageUrl && oldImageUrl !== imageUrl) {
            await deleteImageQuietly(oldImageUrl);
        }

        resetForm();
        await fetchProducts();
    } catch (err) {
        console.error("Kaydetme hatası:", err);
        showMessage(formError, saveErrorMessage(err));
    } finally {
        submitButton.disabled = false;
    }
});

function saveErrorMessage(err) {
    if (err?.code === "permission-denied" || err?.code === "storage/unauthorized") {
        return "Bu işlem için yetkiniz yok veya girilen bilgiler geçersiz.";
    }
    return "Ürün kaydedilemedi. Lütfen tekrar deneyin.";
}

// --- RENDER LOGIC ---
async function fetchProducts() {
    const listError = document.getElementById("list-error");
    showMessage(listError, "");

    try {
        const snapshot = await getDocs(collection(db, "products"));

        products = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
    } catch (err) {
        console.error("Ürünler alınamadı:", err);
        if (err?.code === "permission-denied") {
            // Signed in, but not the admin account named in the security rules.
            await signOut(auth);
            showMessage(document.getElementById("login-error"), "Bu hesabın yönetici yetkisi yok.");
        } else {
            showMessage(listError, "Ürünler yüklenemedi. Lütfen sayfayı yenileyin.");
        }
        return;
    }

    renderProducts();
}

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

function buildProductCard(p) {
    const badge = stockBadge(p.stockCount);
    const imageUrl = safeHttpUrl(p.image);

    return el("div", { className: "product-card d-flex flex-column position-relative shadow" }, [
        el("span", { className: `badge position-absolute top-0 end-0 m-3 ${badge.className}`, text: badge.text }),
        el("img", { className: "product-img", attrs: { src: imageUrl, loading: "lazy", alt: "" } }),
        el("div", { className: "p-3 d-flex flex-column flex-grow-1" }, [
            el("div", { className: "d-flex justify-content-between align-items-center mb-1" }, [
                el("h6", { className: "mb-0 fw-bold text-white text-truncate", text: String(p.name ?? ""), attrs: { style: "max-width:120px" } }),
                el("span", { className: "text-primary fw-bold", text: formatPrice(p.price) })
            ]),
            el("p", { className: "product-desc", text: p.description || "Açıklama yok." }),
            el("div", { className: "mt-auto d-flex gap-2" }, [
                el("button", {
                    className: "btn btn-sm btn-outline-light flex-grow-1",
                    attrs: { title: "Düzenle", type: "button" },
                    on: { click: () => handleEdit(p.id) }
                }, [el("i", { className: "bi bi-pencil" })]),
                el("button", {
                    className: "btn btn-sm btn-outline-danger flex-grow-1",
                    attrs: { title: "Sil", type: "button" },
                    on: { click: () => handleDelete(p.id) }
                }, [el("i", { className: "bi bi-trash" })]),
                el("button", {
                    className: "btn btn-sm btn-primary flex-grow-1",
                    attrs: { title: "QR Göster", type: "button" },
                    on: { click: () => handleQR(p.id) }
                }, [el("i", { className: "bi bi-qr-code" })])
            ])
        ])
    ]);
}

function renderProducts() {
    const grid = document.getElementById('product-grid');

    const searchTerm = document.getElementById('search-input').value.toLocaleLowerCase('tr');
    const filtered = products.filter(p => String(p.name ?? "").toLocaleLowerCase('tr').includes(searchTerm));

    // Silme sonrası olmayan bir sayfada kalma
    currentPage = Math.min(currentPage, Math.max(0, Math.ceil(filtered.length / itemsPerPage) - 1));

    const start = currentPage * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);

    grid.replaceChildren(...pageItems.map(buildProductCard));

    document.getElementById('prevBtn').disabled = currentPage === 0;
    document.getElementById('nextBtn').disabled = start + itemsPerPage >= filtered.length;
}

// --- EDIT ---
function handleEdit(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById("name").value = p.name ?? "";
    document.getElementById("price").value = p.price;
    document.getElementById("category").value = p.category;
    document.getElementById("description").value = p.description ?? "";
    document.getElementById("lastUseDate").value = p.lastUseDate ?? "";
    document.getElementById("stockCount").value = p.stockCount;
    currentImageUrl = p.image ?? "";

    // Eğer eski bir kayıtsa ve dateType yoksa, varsayılan olarak "SKT" seçili gelsin
    const dt = p.dateType || "SKT";

    const radioBtn = document.querySelector(`input[name="dateType"][value="${dt}"]`);
    if (radioBtn) {
        radioBtn.checked = true;
    }

    editingId = id;

    document.getElementById("form-title").innerText = "Ürünü Düzenle";
    document.getElementById("submit-btn").innerText = "GÜNCELLE";
    document.getElementById("submit-btn").className = "btn btn-success w-100 py-3 fw-bold";
}

// --- DELETE ---
async function handleDelete(id) {
    if (confirm("Silmek istiyor musun?")) {
        try {
            const imageUrl = products.find(x => x.id === id)?.image;
            await deleteDoc(doc(db, "products", id));
            await deleteImageQuietly(imageUrl);
            await fetchProducts();
        } catch (err) {
            console.error("Silme hatası:", err);
            showMessage(document.getElementById("list-error"), "Ürün silinemedi. Lütfen tekrar deneyin.");
        }
    }
}

// --- RESET ---
function resetForm() {
    document.getElementById("product-form").reset();
    editingId = null;
    document.getElementById("form-title").innerText = "Yeni Ürün";
    document.getElementById("submit-btn").innerText = "KAYDET";
    document.getElementById("submit-btn").className = "btn btn-primary w-100 py-3 fw-bold";
    currentImageUrl = "";
    showMessage(document.getElementById("form-error"), "");
}

// --- UTILS ---
function filterAndReset() {
    currentPage = 0;
    renderProducts();
}
function nextPage() { currentPage++; renderProducts(); }
function prevPage() { currentPage--; renderProducts(); }




// --- QR KOD ---
function handleQR(id) {
    // QR kodu oluşturmak için ürünün detay sayfasının URL'sini kullanıyoruz
    const url_site = "https://your-domain.com";
    const url = `${url_site}/product/product.html?id=${id}`;
    const modal = document.getElementById("qrModal");
    const container = document.getElementById("qrContainer");
    const linkText = document.getElementById("qrLink");

    generateQR(container, url);

    linkText.innerText = url;

    modal.style.display = "flex";
}
// QR modal'ını kapatma
function closeQR() {
    document.getElementById("qrModal").style.display = "none";
}



// admin.html içindeki satır içi (onclick/onkeyup) çağrıların erişebilmesi için window'a bağlıyoruz
window.resetForm = resetForm;
window.nextPage = nextPage;
window.prevPage = prevPage;
window.filterAndReset = filterAndReset;
window.closeQR = closeQR;
