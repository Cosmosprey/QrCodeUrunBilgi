// The add / edit form of the admin panel.

import { db, collection, addDoc, doc, updateDoc } from "../shared/firebase.js";
import { nextPriceUpdateDate, validateExpiryDate } from "../shared/product-logic.js";
import { validateImageFile } from "./upload.js";
import { uploadProductImage, deleteProductImage } from "./product-images.js";
import { prepareImage, ImageError } from "./image-convert.js";
import { formatBytes } from "./image-logic.js";
import { showMessage } from "./ui.js";
import { showToast } from "./toast.js";

const form = document.getElementById("product-form");
const formError = document.getElementById("form-error");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-btn");
const submitLabel = document.getElementById("submit-label");
const submitSpinner = document.getElementById("submit-spinner");

let editingId = null;
let currentImageUrl = "";

const field = (id) => document.getElementById(id);

function saveErrorMessage(err) {
    if (err instanceof ImageError) {
        return err.code === "too-large"
            ? "Görsel yeterince küçültülemedi. Daha küçük bir görsel seçin."
            : "Görsel okunamadı. Başka bir görsel deneyin.";
    }
    if (err?.code === "permission-denied" || err?.code === "storage/unauthorized") {
        return "Bu işlem için yetkiniz yok veya girilen bilgiler geçersiz.";
    }
    return "Ürün kaydedilemedi. Lütfen tekrar deneyin.";
}

/** While a save is running the button is disabled and shows a spinner. */
function setBusy(busy) {
    submitButton.disabled = busy;
    submitSpinner.classList.toggle("d-none", !busy);
    submitButton.setAttribute("aria-busy", String(busy));
}

/** Puts a product into the form for editing. */
export function startEdit(p) {
    field("name").value = p.name ?? "";
    field("price").value = p.price;
    field("category").value = p.category;
    field("description").value = p.description ?? "";
    field("lastUseDate").value = p.lastUseDate ?? "";
    field("stockCount").value = p.stockCount;
    currentImageUrl = p.image ?? "";

    // Eğer eski bir kayıtsa ve dateType yoksa, varsayılan olarak "SKT" seçili gelsin
    const dateType = p.dateType || "SKT";

    const radioBtn = document.querySelector(`input[name="dateType"][value="${dateType}"]`);
    if (radioBtn) {
        radioBtn.checked = true;
    }

    editingId = p.id;

    formTitle.textContent = "Ürünü Düzenle";
    submitLabel.textContent = "GÜNCELLE";
    submitButton.className = "btn btn-success w-100 py-3 fw-bold";
}

export function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Ürün Ekle";
    submitLabel.textContent = "KAYDET";
    submitButton.className = "btn btn-primary w-100 py-3 fw-bold";
    currentImageUrl = "";
    showMessage(formError, "");
}

/** Connects the form. findProduct(id) returns the stored product; onSaved() runs after a successful save. */
export function initProductForm({ findProduct, onSaved }) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showMessage(formError, "");

        const picked = field("imageFile").files[0];
        const fileProblem = validateImageFile(picked);
        if (fileProblem) {
            showMessage(formError, fileProblem);
            return;
        }

        const dateType = document.querySelector('input[name="dateType"]:checked').value;
        const dateProblem = validateExpiryDate({
            dateType,
            dateString: field("lastUseDate").value,
            isNewProduct: !editingId
        });
        if (dateProblem) {
            showMessage(formError, dateProblem);
            return;
        }

        setBusy(true);

        try {
            const previous = editingId ? findProduct(editingId) : undefined;
            const oldImageUrl = currentImageUrl;
            let imageUrl = currentImageUrl;

            // Big photos are shrunk in the browser first; the picked file is kept for small pictures and GIFs.
            const prepared = picked ? await prepareImage(picked) : null;
            const file = prepared?.file;

            if (file) {
                imageUrl = await uploadProductImage(file);
            }

            const price = Number(field("price").value);
            const productData = {
                name: field("name").value,
                price,
                category: field("category").value,
                description: field("description").value,
                dateType,
                lastUseDate: field("lastUseDate").value,
                image: imageUrl,
                stockCount: Number(field("stockCount").value),
                // Fiyatın değiştiği son tarih: sadece yeni üründe veya fiyat değişince bugüne ayarlanır
                priceLastUpdate: nextPriceUpdateDate({
                    previousPrice: previous?.price,
                    previousDate: previous?.priceLastUpdate,
                    newPrice: price
                })
            };

            if (editingId) {
                await updateDoc(doc(db, "products", editingId), productData);
            } else {
                await addDoc(collection(db, "products"), productData);
            }

            // Yeni görsel yüklendiyse eskisi artık kullanılmıyor
            if (file && oldImageUrl && oldImageUrl !== imageUrl) {
                await deleteProductImage(oldImageUrl);
            }

            const wasEditing = Boolean(editingId);
            resetForm();
            await onSaved();
            const saved = wasEditing ? "Ürün güncellendi." : "Ürün kaydedildi.";
            showToast(prepared?.converted
                ? `${saved} Görsel küçültüldü: ${formatBytes(picked.size)} → ${formatBytes(file.size)}.`
                : saved);
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            showMessage(formError, saveErrorMessage(err));
        } finally {
            setBusy(false);
        }
    });
}
