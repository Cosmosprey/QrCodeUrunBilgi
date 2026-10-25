import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { filterProductsByName, pageInfo, listState } from "../admin/list-logic.js";

describe("filterProductsByName", () => {
    const products = [
        { id: "1", name: "Süt 1L" },
        { id: "2", name: "İçecek Çay" },
        { id: "3", name: "SÜT TOZU" },
        { id: "4", name: "Isparta Gülü" },
        { id: "5" },
        { id: "6", name: null }
    ];
    const ids = (term) => filterProductsByName(products, term).map((p) => p.id);

    test("an empty search keeps everything, including products without a name", () => {
        assert.deepEqual(ids(""), ["1", "2", "3", "4", "5", "6"]);
        assert.deepEqual(ids(undefined), ["1", "2", "3", "4", "5", "6"]);
    });

    test("matches part of the name, ignoring case", () => {
        assert.deepEqual(ids("süt"), ["1", "3"]);
        assert.deepEqual(ids("TOZ"), ["3"]);
    });

    test("handles the Turkish dotted and dotless i", () => {
        assert.deepEqual(ids("içecek"), ["2"]); // lower-case i finds İ
        assert.deepEqual(ids("ısparta"), ["4"]); // lower-case ı finds I
    });

    test("products without a name never match a non-empty search and never crash", () => {
        assert.deepEqual(ids("zzz"), []);
    });

    test("special characters in the search are plain text", () => {
        assert.deepEqual(ids("<img src=x>"), []);
        assert.deepEqual(ids(".*"), []);
    });
});

describe("pageInfo", () => {
    test("first page of several", () => {
        assert.deepEqual(pageInfo(10, 0, 4), { page: 0, start: 0, end: 4, hasPrevious: false, hasNext: true });
    });

    test("middle and last page", () => {
        assert.deepEqual(pageInfo(10, 1, 4), { page: 1, start: 4, end: 8, hasPrevious: true, hasNext: true });
        assert.deepEqual(pageInfo(10, 2, 4), { page: 2, start: 8, end: 10, hasPrevious: true, hasNext: false });
    });

    test("an exact multiple of the page size has no empty last page", () => {
        assert.deepEqual(pageInfo(8, 1, 4), { page: 1, start: 4, end: 8, hasPrevious: true, hasNext: false });
    });

    test("falls back into range after the last item of the last page is gone", () => {
        assert.equal(pageInfo(4, 1, 4).page, 0);
        assert.equal(pageInfo(5, 5, 4).page, 1);
    });

    test("never goes below the first page", () => {
        assert.equal(pageInfo(10, -1, 4).page, 0);
    });

    test("an empty list is one empty page", () => {
        assert.deepEqual(pageInfo(0, 0, 4), { page: 0, start: 0, end: 0, hasPrevious: false, hasNext: false });
        assert.equal(pageInfo(0, 3, 4).page, 0);
    });
});

describe("listState", () => {
    test("loading until the first answer, whatever the numbers say", () => {
        assert.equal(listState({ loaded: false, total: 0, matching: 0 }), "loading");
        assert.equal(listState({ loaded: false, total: 5, matching: 5 }), "loading");
    });

    test("empty when the shop has no products, no-results when only the search matches none", () => {
        assert.equal(listState({ loaded: true, total: 0, matching: 0 }), "empty");
        assert.equal(listState({ loaded: true, total: 3, matching: 0 }), "no-results");
    });

    test("list otherwise", () => {
        assert.equal(listState({ loaded: true, total: 3, matching: 1 }), "list");
        assert.equal(listState({ loaded: true, total: 3, matching: 3 }), "list");
    });
});
