// Detects that a product was changed somewhere else while it was being edited. Pure: no DOM, no Firebase.

// The fields of a product document (see firestore.rules).
export const PRODUCT_FIELDS = [
    "name",
    "price",
    "category",
    "description",
    "dateType",
    "lastUseDate",
    "image",
    "stockCount",
    "priceLastUpdate"
];

/**
 * True when `stored` (what the database holds now) differs from `seen` (what the admin saw when the edit began)
 * in any field of a product. Other properties, such as the id the list adds, are ignored.
 */
export function hasChanged(seen, stored) {
    return PRODUCT_FIELDS.some((field) => seen?.[field] !== stored?.[field]);
}
