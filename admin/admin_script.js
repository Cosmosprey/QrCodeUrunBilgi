// Entry point of the admin panel: wires the modules together.

import { initAuthUi, signOutWithMessage } from "./auth-ui.js";
import { initProductList, loadProducts, clearProducts, findProduct } from "./product-list.js";
import { initProductForm, startEdit, resetForm, isSaving, cancelEditOf } from "./product-form.js";
import { initQrModal, showQr } from "./qr-modal.js";

initQrModal();

initProductList({
    onEdit: startEdit,
    onShowQr: showQr,
    onDeleted: cancelEditOf,
    isBusy: isSaving,
    onAccessDenied: () => signOutWithMessage("login.error.noAdmin")
});

initProductForm({ findProduct, onSaved: loadProducts });

initAuthUi({
    onSignedIn: loadProducts,
    onSignedOut: () => {
        clearProducts();
        resetForm();
    }
});
