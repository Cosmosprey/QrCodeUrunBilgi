// Language support for both pages. `t(key, params)` gives a text in the current language; static texts in the
// HTML carry data-i18n attributes and are filled in by applyTranslations(). The pure parts are in i18n-core.js.
//
// data-i18n          sets the element's text
// data-i18n-placeholder, data-i18n-aria-label, data-i18n-title, data-i18n-alt     set that attribute
// (each holds a dictionary key)
// [data-lang="tr|en"]             a language button (its aria-pressed shows the current language)

import { tr } from "./locales/tr.js";
import { en } from "./locales/en.js";
import { LANGUAGES, detectLanguage, translate, translateParts } from "./i18n-core.js";

const DICTIONARIES = { tr, en };
const STORAGE_KEY = "language";
const ATTRIBUTES = [
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-aria-label", "aria-label"],
    ["data-i18n-title", "title"],
    ["data-i18n-alt", "alt"]
];

// localStorage can be unavailable (private windows, blocked site data), so every access is guarded.
function savedLanguage() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function saveLanguage(language) {
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // not saved; the choice still applies until the page is closed
    }
}

let language = detectLanguage({
    saved: savedLanguage(),
    browserLanguages: navigator.languages?.length ? navigator.languages : [navigator.language]
});
const listeners = new Set();

export const getLanguage = () => language;

/** The text for a key in the current language. */
export const t = (key, params) => translate(DICTIONARIES[language], key, params);

/** Like t(), but returns pieces (strings and the given DOM nodes) for texts that contain a badge or bold part. */
export const tParts = (key, params) => translateParts(DICTIONARIES[language], key, params);

/** Calls `callback(language)` after the language changed, so a module can redraw what it built itself. */
export function onLanguageChange(callback) {
    listeners.add(callback);
}

/** Fills in every translated text inside `root`. */
export function applyTranslations(root = document) {
    document.documentElement.lang = language;
    for (const element of root.querySelectorAll("[data-i18n]")) {
        element.textContent = t(element.dataset.i18n);
    }
    for (const [attribute, property] of ATTRIBUTES) {
        for (const element of root.querySelectorAll(`[${attribute}]`)) {
            element.setAttribute(property, t(element.getAttribute(attribute)));
        }
    }
    for (const button of root.querySelectorAll("[data-lang]")) {
        button.setAttribute("aria-pressed", String(button.dataset.lang === language));
    }
}

export function setLanguage(next) {
    if (!LANGUAGES.includes(next) || next === language) return;
    language = next;
    saveLanguage(language);
    applyTranslations();
    listeners.forEach((callback) => callback(language));
}

/** Translates the page and wires the language buttons. Called once, as early as possible. */
export function initI18n() {
    applyTranslations();
    for (const button of document.querySelectorAll("[data-lang]")) {
        button.addEventListener("click", () => setLanguage(button.dataset.lang));
    }
    document.body.classList.remove("i18n-pending"); // the page was hidden so the wrong language never flashes
}
