import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "../shared/firebase.js";
import { generateQR } from "./easyqrcodejs.js";
import { storage, ref, uploadBytes, getDownloadURL } from "../shared/firebase.js";
// --- GLOBAL STATE ---
let products = [];
let editingId = null;
let currentImageUrl = "";
let currentPage = 0;
const itemsPerPage = 4;

// Son kullanma tarihi validation
const today = new Date().toISOString().split('T')[0];// Bugünün tarihini YYYY-MM-DD formatında alıyoruz
document.getElementById("lastUseDate").setAttribute("min", today);// Son kullanma tarihi bugünden küçük olamaz


// --- IMAGE UPLOAD ---
async function uploadImage(file) {
    const fileRef = ref(storage, "products/" + Date.now() + "_" + file.name);

    await uploadBytes(fileRef, file);

    const url = await getDownloadURL(fileRef);

    return url;
}

// --- FORM SUBMIT (ADD / UPDATE) 
document.getElementById("product-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const file = document.getElementById("imageFile").files[0];

    let imageUrl = currentImageUrl;

    if (file) {
        imageUrl = await uploadImage(file);
    }

    const productData = {
        name: document.getElementById("name").value,
        price: Number(document.getElementById("price").value),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        dateType: document.querySelector('input[name="dateType"]:checked').value,
        lastUseDate: document.getElementById("lastUseDate").value,
        image: imageUrl,
        stockCount: Number(document.getElementById("stockCount").value),
        priceLastUpdate: new Date().toISOString().split('T')[0] // Fiyatın değiştiği son tarihi kaydeder
    };


    if (editingId) {
        const refDoc = doc(db, "products", editingId);
        await updateDoc(refDoc, productData);
    } else {
        await addDoc(collection(db, "products"), productData);
    }

    resetForm();
    await fetchProducts();
});

// --- RENDER LOGIC ---
async function fetchProducts() {
    const snapshot = await getDocs(collection(db, "products"));

    products = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));

    renderProducts();
}
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));

    const start = currentPage * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);

    pageItems.forEach(p => {
        // renderProducts içindeki döngünün içinde:
        const count = Number(p.stockCount) || 0;
        let badgeClass = "";
        let badgeText = "";

        if (count > 10) {
            badgeClass = "bg-success"; // Yeşil - Sorun yok
            badgeText = `Stok: ${count}`;
        } else if (count > 0) {
            badgeClass = "bg-warning text-dark"; // Turuncu - Takip et!
            badgeText = `Kritik Stok: ${count}`;
        } else {
            badgeClass = "bg-danger"; // Kırmızı - Hemen sipariş ver!
            badgeText = "Tükendi";
        }

        grid.innerHTML += `
                <div class="product-card d-flex flex-column position-relative shadow">
                    <span class="badge position-absolute top-0 end-0 m-3 ${badgeClass}">${badgeText}</span>
                    <img src="${p.image}" loading="lazy" class="product-img">
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h6 class="mb-0 fw-bold text-white text-truncate" style="max-width:120px">${p.name}</h6>
                            <span class="text-primary fw-bold">${p.price}₺</span>
                        </div>
                        <p class="product-desc">${p.description || 'Açıklama yok.'}</p>
                        <div class="mt-auto d-flex gap-2">
                            <button class="btn btn-sm btn-outline-light flex-grow-1" title="Düzenle" onclick="handleEdit('${p.id}')"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-outline-danger flex-grow-1" title="Sil" onclick="handleDelete('${p.id}')"><i class="bi bi-trash"></i></button>
                            <button class="btn btn-sm btn-primary flex-grow-1"  title="QR Göster" onclick="handleQR('${p.id}')"> <i class="bi bi-qr-code"></i> </button>
                        </div>
                    </div>
                </div>`;
    });

    document.getElementById('prevBtn').disabled = currentPage === 0;
    document.getElementById('nextBtn').disabled = start + itemsPerPage >= filtered.length;
}

// --- EDIT ---
function handleEdit(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById("name").value = p.name;
    document.getElementById("price").value = p.price;
    document.getElementById("category").value = p.category;
    document.getElementById("description").value = p.description;
    document.getElementById("lastUseDate").value = p.lastUseDate;
    document.getElementById("stockCount").value = p.stockCount;
    currentImageUrl = p.image;

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
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
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
}

// --- UTILS ---
function filterAndReset() {
    currentPage = 0;
    renderProducts();
}
function nextPage() { currentPage++; renderProducts(); }
function prevPage() { currentPage--; renderProducts(); }

// İlk yükleme
fetchProducts();




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



// HTML'den erişilebilmesi için fonksiyonları window objesine bağlıyoruz
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.resetForm = resetForm;
window.nextPage = nextPage;
window.prevPage = prevPage;
window.filterAndReset = filterAndReset;
window.handleQR = handleQR;
window.closeQR = closeQR;