// The add / edit form of the admin panel.

import { db, collection, addDoc, doc, updateDoc } from "../shared/firebase.js";
import { nextPriceUpdateDate, validateExpiryDate } from "../shared/product-logic.js";
import { validateImageFile } from "./upload.js";
import { validateProductFields } from "./product-validation.js";
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
const cancelButton = document.getElementById("cancel-edit-btn");
const categorySelect = document.getElementById("category");

let editingId = null;
let currentImageUrl = "";
let saving = false;

const field = (id) => document.getElementById(id);

/** True while a save is running: no other product may be edited or deleted then (see product-list.js). */
export const isSaving = () => saving;

/** The translation key of the message for a failed save. */
function saveErrorKey(err) {
    if (err instanceof ImageError) {
        return err.code === "too-large" ? "error.save.imageTooLarge" : "error.save.imageUnreadable";
    }
    if (err?.code === "permission-denied" || err?.code === "storage/unauthorized") {
        return "error.save.denied";
    }
    return "error.save.failed";
}

/** The title, the submit button and the cancel button show whether a product is being added or edited. */
function renderMode() {
    formTitle.textContent = t(editingId ? "form.editTitle" : "form.addTitle");
    submitLabel.textContent = t(editingId ? "form.update" : "form.save");
    submitButton.className = `btn ${editingId ? "btn-success" : "btn-primary"} w-100 py-3 fw-bold`;
    cancelButton.classList.toggle("d-none", !editingId);
}

/** While a save is running the button is disabled and shows a spinner, and the product cards are locked. */
function setBusy(busy) {
    saving = busy;
    document.body.classList.toggle("is-saving", busy);
    submitButton.disabled = busy;
    cancelButton.disabled = busy;
    submitSpinner.classList.toggle("d-none", !busy);
    submitButton.setAttribute("aria-busy", String(busy));
}

/** Selects a category; one that is not in the list (a record made elsewhere) is added as a temporary option. */
function selectCategory(category) {
    categorySelect.querySelector("option[data-extra]")?.remove();
    if (!category) return;
    if (![...categorySelect.options].some((option) => option.value === category)) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        option.dataset.extra = "";
        categorySelect.append(option);
    }
    categorySelect.value = category;
}

/** Puts a product into the form for editing. Does nothing while a save is running. */
export function startEdit(product) {
    if (saving) return;

    form.reset(); // also clears a picture that was picked before, which must not end up on this product
    field("name").value = product.name ?? "";
    field("price").value = product.price;
    selectCategory(product.category);
    field("description").value = product.description ?? "";
    field("lastUseDate").value = product.lastUseDate ?? "";
    field("stockCount").value = product.stockCount;
    currentImageUrl = product.image ?? "";

    // An old record may have no dateType: it counts as SKT
    const radio = document.querySelector(`input[name="dateType"][value="${product.dateType || "SKT"}"]`);
    if (radio) radio.checked = true;

    editingId = product.id;
    showMessage(formError, "");
    renderMode();

    // On a phone the form is above the list: bring it into view and put the cursor in it
    formTitle.scrollIntoView({ block: "nearest" });
    field("name").focus({ preventScroll: true });
}

export function resetForm() {
    form.reset();
    categorySelect.querySelector("option[data-extra]")?.remove();
    editingId = null;
    currentImageUrl = "";
    showMessage(formError, "");
    renderMode();
}

/** Leaves the edit mode when the product being edited has just been deleted. */
export function cancelEditOf(id) {
    if (editingId === id) resetForm();
}

/** Connects the form. findProduct(id) returns the stored product; onSaved() runs after a successful save. */
export function initProductForm({ findProduct, onSaved }) {
    renderMode();
    onLanguageChange(renderMode);

    cancelButton.addEventListener("click", () => {
        if (!saving) resetForm();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (saving) return;
        showMessage(formError, "");

        // Everything is read before the first await: what is saved is what was in the form when Save was pressed
        const picked = field("imageFile").files[0];
        const values = {
            name: field("name").value.trim(),
            price: Number(field("price").value),
            category: field("category").value,
            description: field("description").value.trim(),
            dateType: document.querySelector('input[name="dateType"]:checked').value,
            lastUseDate: field("lastUseDate").value,
            stockCount: Number(field("stockCount").value)
        };
        const productId = editingId;
        const oldImageUrl = currentImageUrl;

        const problem =
            validateImageFile(picked) ||
            validateProductFields(values) ||
            validateExpiryDate({
                dateType: values.dateType,
                dateString: values.lastUseDate,
                isNewProduct: !productId
            });
        if (problem) {
            showMessage(formError, problem);
            return;
        }

        setBusy(true);

        try {
            const previous = productId ? findProduct(productId) : undefined;
            let imageUrl = oldImageUrl;

            // Big photos are shrunk in the browser first; the picked file is kept for small pictures and GIFs.
            const prepared = picked ? await prepareImage(picked) : null;
            const file = prepared?.file;

            if (file) {
                imageUrl = await uploadProductImage(file);
            }

            const productData = {
                ...values,
                image: imageUrl,
                // The date the price last changed: set to today only for a new product or when the price changes
                priceLastUpdate: nextPriceUpdateDate({
                    previousPrice: previous?.price,
                    previousDate: previous?.priceLastUpdate,
                    newPrice: values.price
                })
            };

            try {
                if (productId) {
                    await updateDoc(doc(db, "products", productId), productData);
                } else {
                    await addDoc(collection(db, "products"), productData);
                }
            } catch (err) {
                // The new picture was uploaded but is not used by any product: do not leave it behind
                if (file) await deleteProductImage(imageUrl);
                throw err;
            }

            // A new picture was uploaded, so the old one is no longer used
            if (file && oldImageUrl && oldImageUrl !== imageUrl) {
                await deleteProductImage(oldImageUrl);
            }

            resetForm();
            await onSaved();
            const saved = t(productId ? "toast.updated" : "toast.saved");
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
            console.error("Could not save the product:", err);
            showMessage(formError, saveErrorKey(err));
        } finally {
            setBusy(false);
        }
    });
}
