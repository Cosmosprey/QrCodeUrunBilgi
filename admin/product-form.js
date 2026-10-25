// The add / edit form of the admin panel.

import { db, collection, addDoc, doc, updateDoc } from "../shared/firebase.js";
import { nextPriceUpdateDate, validateExpiryDate } from "../shared/product-logic.js";
import { validateImageFile } from "./upload.js";
import { uploadProductImage, deleteProductImage } from "./product-images.js";
import { prepareImage, ImageError } from "./image-convert.js";
import { formatBytes } from "./image-logic.js";
import { showMessage } from "./ui.js";
import { showToast } from "./toast.js";
import { t, getLanguage, onLanguageChange } from "../shared/i18n.js";

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
        return t(err.code === "too-large" ? "error.save.imageTooLarge" : "error.save.imageUnreadable");
    }
    if (err?.code === "permission-denied" || err?.code === "storage/unauthorized") {
        return t("error.save.denied");
    }
    return t("error.save.failed");
}

/** The title and the submit button say "add" or "edit" depending on what the form is doing. */
function renderFormTexts() {
    formTitle.textContent = t(editingId ? "form.editTitle" : "form.addTitle");
    submitLabel.textContent = t(editingId ? "form.update" : "form.save");
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

    renderFormTexts();
    submitButton.className = "btn btn-success w-100 py-3 fw-bold";
}

export function resetForm() {
    form.reset();
    editingId = null;
    renderFormTexts();
    submitButton.className = "btn btn-primary w-100 py-3 fw-bold";
    currentImageUrl = "";
    showMessage(formError, "");
}

/** Connects the form. findProduct(id) returns the stored product; onSaved() runs after a successful save. */
export function initProductForm({ findProduct, onSaved }) {
    renderFormTexts();
    onLanguageChange(renderFormTexts);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showMessage(formError, "");

        const picked = field("imageFile").files[0];
        const fileProblem = validateImageFile(picked);
        if (fileProblem) {
            showMessage(formError, t(fileProblem));
            return;
        }

        const dateType = document.querySelector('input[name="dateType"]:checked').value;
        const dateProblem = validateExpiryDate({
            dateType,
            dateString: field("lastUseDate").value,
            isNewProduct: !editingId
        });
        if (dateProblem) {
            showMessage(formError, t(dateProblem));
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
            const saved = t(wasEditing ? "toast.updated" : "toast.saved");
            showToast(
                prepared?.converted
                    ? t("toast.shrunk", {
                          saved,
                          from: formatBytes(picked.size, getLanguage()),
                          to: formatBytes(file.size, getLanguage())
                      })
                    : saved
            );
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            showMessage(formError, saveErrorMessage(err));
        } finally {
            setBusy(false);
        }
    });
}
