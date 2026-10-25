// Pure product logic (dates, stock, discount, price formatting). No DOM, no Firebase: easy to test.
// "Dates" here are calendar dates written as "YYYY-MM-DD" (what the admin form stores). They are
// compared as calendar days in the viewer's local time, so the time of day never matters and
// the result does not depend on the time zone.

import { storeConfig } from "./store-config.js";
import { intlLocale } from "./i18n-core.js";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Local calendar date of `date` as "YYYY-MM-DD" (unlike toISOString, never shifted to UTC). */
export function toDateString(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function parseDateString(value) {
    if (typeof value !== "string") return null;
    const match = DATE_PATTERN.exec(value);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const check = new Date(Date.UTC(year, month - 1, day));
    const isRealDate =
        check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
    return isRealDate ? { year, month, day } : null;
}

/** Whole calendar days from today (local) until `dateString`: 0 = today, negative = in the past. null if invalid. */
export function daysUntil(dateString, now = new Date()) {
    const target = parseDateString(dateString);
    if (!target) return null;
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((Date.UTC(target.year, target.month - 1, target.day) - today) / MS_PER_DAY);
}

/** state: "none" (no usable date) | "expired" | "today" (last day, still valid) | "upcoming". */
export function expiryStatus(dateString, now = new Date()) {
    const daysLeft = daysUntil(dateString, now);
    if (daysLeft === null) return { state: "none", daysLeft: null };
    if (daysLeft < 0) return { state: "expired", daysLeft };
    if (daysLeft === 0) return { state: "today", daysLeft };
    return { state: "upcoming", daysLeft };
}

/** level: "ok" | "low" | "out". */
export function stockStatus(value, lowStockLimit = storeConfig.lowStockLimit) {
    const number = Number(value);
    const count = Number.isFinite(number) ? number : 0;
    if (count > lowStockLimit) return { level: "ok", count };
    if (count > 0) return { level: "low", count };
    return { level: "out", count: 0 };
}

const NO_DISCOUNT = Object.freeze({ eligible: false });

/**
 * Expiry-based discount for a product (see storeConfig.discount for the rules).
 * Returns { eligible: false } or { eligible: true, originalPrice, finalPrice, ratePercent, couponCode, dateType }.
 */
export function discountFor(product, now = new Date(), discountConfig = storeConfig.discount) {
    const price = Number(product?.price);
    if (!discountConfig.enabled || !Number.isFinite(price) || price <= 0) return NO_DISCOUNT;

    const daysLeft = daysUntil(product.lastUseDate, now);
    if (daysLeft === null) return NO_DISCOUNT;

    // Older records have no dateType: they count as SKT.
    const dateType = product.dateType === "TETT" ? "TETT" : "SKT";
    const eligible =
        dateType === "TETT" ? daysLeft < 0 : daysLeft >= 0 && daysLeft <= discountConfig.sktDaysBeforeExpiry;
    if (!eligible) return NO_DISCOUNT;

    // Work in kuruş so results like 19.99 * 0.8 round correctly.
    const finalPrice = Math.round(Math.round(price * 100) * (1 - discountConfig.rate)) / 100;
    return {
        eligible: true,
        originalPrice: price,
        finalPrice,
        ratePercent: Math.round(discountConfig.rate * 100),
        couponCode: discountConfig.couponCode,
        dateType
    };
}

/**
 * Date to store as "price last updated": today when the price is new or changed, otherwise the date
 * that was stored before (saving other fields must not claim the price changed).
 */
export function nextPriceUpdateDate({ previousPrice, previousDate, newPrice, now = new Date() }) {
    const hasPrevious = previousPrice !== undefined && previousPrice !== null && parseDateString(previousDate) !== null;
    if (hasPrevious && Number(previousPrice) === Number(newPrice)) return previousDate;
    return toDateString(now);
}

/** Returns the translation key of an error message for an unacceptable expiry date in the admin form, or null. */
export function validateExpiryDate({ dateType, dateString, isNewProduct }, now = new Date()) {
    if (!dateString) return null;
    if (parseDateString(dateString) === null) return "error.date.invalid";
    // A new SKT product that is already expired must not be put on sale. TETT may be past: the
    // discount for it is the point. Editing an existing product is never blocked by its date.
    if (isNewProduct && dateType === "SKT" && daysUntil(dateString, now) < 0) {
        return "error.date.pastSkt";
    }
    return null;
}

// Categories are stored in Turkish (they are the values of the admin form's select); this maps them to translation keys.
const CATEGORY_KEYS = {
    Yiyecek: "category.food",
    İçecek: "category.drink",
    "Temizlik Malzemeleri": "category.cleaning"
};

/** Translation key for a stored category name, or null for an unknown one (show the stored text as it is). */
export function categoryKey(category) {
    return Object.hasOwn(CATEGORY_KEYS, category) ? CATEGORY_KEYS[category] : null;
}

const priceFormats = {
    tr: new Intl.NumberFormat(intlLocale("tr"), { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    en: new Intl.NumberFormat(intlLocale("en"), { minimumFractionDigits: 2, maximumFractionDigits: 2 })
};

/** Turkish: "1.234,50 ₺" (symbol after); English: "₺1,234.50" (symbol before). A dash when the value is not a number. */
export function formatPrice(value, language = "tr") {
    // Number(null), Number("") and Number(false) are all 0: a missing price must not look free.
    const isNumeric = typeof value === "number" || (typeof value === "string" && value.trim() !== "");
    const number = isNumeric ? Number(value) : NaN;
    if (!Number.isFinite(number)) return "—";
    const formatted = priceFormats[language === "en" ? "en" : "tr"].format(number);
    return language === "en" ? `₺${formatted}` : `${formatted} ₺`;
}

/** "25 Ekim 2026" / "25 October 2026" from "YYYY-MM-DD"; null when there is no valid date. */
export function formatDate(dateString, language = "tr") {
    const date = parseDateString(dateString);
    if (!date) return null;
    return new Date(date.year, date.month - 1, date.day).toLocaleDateString(intlLocale(language), {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
