// Pure logic of the admin product list (search and paging). No DOM: easy to test.

/** Products whose name contains `term`, ignoring case the Turkish way (İ/i, I/ı). */
export function filterProductsByName(products, term) {
    const needle = String(term ?? "").toLocaleLowerCase("tr");
    return products.filter((p) =>
        String(p.name ?? "")
            .toLocaleLowerCase("tr")
            .includes(needle)
    );
}

/**
 * Paging for `totalItems` items. The requested page is moved back into range, so after deleting the
 * only item on the last page the list falls back to the previous page instead of showing nothing.
 */
export function pageInfo(totalItems, requestedPage, perPage) {
    const lastPage = Math.max(0, Math.ceil(totalItems / perPage) - 1);
    const page = Math.min(Math.max(0, requestedPage), lastPage);
    const start = page * perPage;
    return {
        page,
        start,
        end: Math.min(start + perPage, totalItems),
        hasPrevious: page > 0,
        hasNext: start + perPage < totalItems
    };
}

/**
 * What the product area should show: "loading" before the first answer, "empty" when there are no
 * products at all, "no-results" when a search matches nothing, otherwise "list".
 */
export function listState({ loaded, total, matching }) {
    if (!loaded) return "loading";
    if (total === 0) return "empty";
    if (matching === 0) return "no-results";
    return "list";
}
