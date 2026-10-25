// Small helpers shared by the admin panel modules.

import { t, onLanguageChange } from "../shared/i18n.js";

// The alert boxes that are showing a message, with the key of what they say: a message that stays on screen
// is translated again when the language changes.
const shown = new Map();

/**
 * Shows the message with translation key `key` (and its `params`) in an alert element, or hides the element
 * when `key` is empty.
 */
export function showMessage(element, key, params) {
    if (key) shown.set(element, { key, params });
    else shown.delete(element);
    element.textContent = key ? t(key, params) : "";
    element.classList.toggle("d-none", !key);
}

onLanguageChange(() => {
    for (const [element, { key, params }] of shown) element.textContent = t(key, params);
});
