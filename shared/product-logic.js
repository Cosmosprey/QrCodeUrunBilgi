// Pure product logic (dates, stock, discount, price formatting). No DOM, no Firebase: easy to test.
// "Dates" here are calendar dates written as "YYYY-MM-DD" (what the admin form stores). They are
// compared as calendar days in the viewer's local time, so the time of day never matters and
// the result does not depend on the time zone.

import { storeConfig } from "./store-config.js";

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
    const isRealDate = check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
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
    const eligible = dateType === "TETT"
        ? daysLeft < 0
        : daysLeft >= 0 && daysLeft <= discountConfig.sktDaysBeforeExpiry;
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

/** Returns a (Turkish) error message for an unacceptable expiry date in the admin form, or null. */
export function validateExpiryDate({ dateType, dateString, isNewProduct }, now = new Date()) {
    if (!dateString) return null;
    if (parseDateString(dateString) === null) return "Geçerli bir tarih girin.";
    // A new SKT product that is already expired must not be put on sale. TETT may be past: the
    // discount for it is the point. Editing an existing product is never blocked by its date.
    if (isNewProduct && dateType === "SKT" && daysUntil(dateString, now) < 0) {
        return "Son kullanma tarihi geçmiş bir ürün eklenemez.";
    }
    return null;
}

const priceFormat = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "39,90 ₺"; a dash when the value is not a number. */
export function formatPrice(value) {
    // Number(null), Number("") and Number(false) are all 0: a missing price must not look free.
    const isNumeric = typeof value === "number" || (typeof value === "string" && value.trim() !== "");
    const number = isNumeric ? Number(value) : NaN;
    return Number.isFinite(number) ? `${priceFormat.format(number)} ₺` : "—";
}

/** "25 Ekim 2026" from "YYYY-MM-DD"; "Belirtilmedi" when there is no valid date. */
export function formatDateTr(dateString) {
    const date = parseDateString(dateString);
    if (!date) return "Belirtilmedi";
    return new Date(date.year, date.month - 1, date.day)
        .toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
}
