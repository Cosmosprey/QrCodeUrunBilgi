// The add / edit form of the admin panel.

import { db, collection, addDoc, doc, updateDoc } from "../shared/firebase.js";
import { nextPriceUpdateDate, validateExpiryDate } from "../shared/product-logic.js";
import { validateImageFile } from "./upload.js";
import { uploadProductImage, deleteProductImage } from "./product-images.js";
import { showMessage } from "./ui.js";

const form = document.getElementById("product-form");
const formError = document.getElementById("form-error");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-btn");

let editingId = null;
let currentImageUrl = "";

const field = (id) => document.getElementById(id);

function saveErrorMessage(err) {
    if (err?.code === "permission-denied" || err?.code === "storage/unauthorized") {
        return "Bu işlem için yetkiniz yok veya girilen bilgiler geçersiz.";
    }
    return "Ürün kaydedilemedi. Lütfen tekrar deneyin.";
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

    formTitle.innerText = "Ürünü Düzenle";
    submitButton.innerText = "GÜNCELLE";
    submitButton.className = "btn btn-success w-100 py-3 fw-bold";
}

export function resetForm() {
    form.reset();
    editingId = null;
    formTitle.innerText = "Ürün Ekle";
    submitButton.innerText = "KAYDET";
    submitButton.className = "btn btn-primary w-100 py-3 fw-bold";
    currentImageUrl = "";
    showMessage(formError, "");
}

/** Connects the form. findProduct(id) returns the stored product; onSaved() runs after a successful save. */
export function initProductForm({ findProduct, onSaved }) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showMessage(formError, "");

        const file = field("imageFile").files[0];
        const fileProblem = validateImageFile(file);
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

        submitButton.disabled = true;

        try {
            const previous = editingId ? findProduct(editingId) : undefined;
            const oldImageUrl = currentImageUrl;
            let imageUrl = currentImageUrl;

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

            resetForm();
            await onSaved();
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            showMessage(formError, saveErrorMessage(err));
        } finally {
            submitButton.disabled = false;
        }
    });
}
