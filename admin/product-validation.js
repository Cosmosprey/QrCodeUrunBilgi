// Pure checks of the product form fields (the same limits as firestore.rules). No DOM.

export const LIMITS = { nameMin: 2, nameMax: 70, priceMin: 0.01, priceMax: 1_000_000, stockMax: 1_000_000 };

/**
 * Returns the translation key of the first problem found in the form values, or null when they are acceptable.
 * `name` is checked after trimming, so a name made of spaces is not a name.
 */
export function validateProductFields({ name, price, stockCount }) {
    const length = String(name ?? "").trim().length;
    if (length < LIMITS.nameMin || length > LIMITS.nameMax) return "error.name.length";

    if (!Number.isFinite(price) || price < LIMITS.priceMin || price > LIMITS.priceMax) return "error.price.range";

    if (!Number.isInteger(stockCount) || stockCount < 0 || stockCount > LIMITS.stockMax) return "error.stock.range";

    return null;
}
