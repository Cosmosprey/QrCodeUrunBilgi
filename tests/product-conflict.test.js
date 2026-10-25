import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hasChanged, PRODUCT_FIELDS } from "../admin/product-conflict.js";

const product = () => ({
    name: "Süt 1L",
    price: 39.9,
    category: "Yiyecek",
    description: "Taze",
    dateType: "SKT",
    lastUseDate: "2030-01-01",
    image: "",
    stockCount: 12,
    priceLastUpdate: "2026-10-01"
});

describe("hasChanged", () => {
    test("the same product has not changed, whatever else the list added to it", () => {
        assert.equal(hasChanged(product(), product()), false);
        assert.equal(hasChanged({ id: "p1", ...product() }, product()), false);
    });

    test("a change in any single field is a change", () => {
        const changes = {
            name: "Süt 2L",
            price: 12,
            category: "İçecek",
            description: "",
            dateType: "TETT",
            lastUseDate: "2030-01-02",
            image: "https://example.com/a.png",
            stockCount: 11,
            priceLastUpdate: "2026-10-02"
        };
        assert.deepEqual(Object.keys(changes), PRODUCT_FIELDS);
        for (const [field, value] of Object.entries(changes)) {
            assert.equal(hasChanged(product(), { ...product(), [field]: value }), true, field);
        }
    });

    test("a price that looks alike but is another type is a change (the data is compared strictly)", () => {
        assert.equal(hasChanged(product(), { ...product(), price: "39.9" }), true);
        assert.equal(hasChanged(product(), { ...product(), stockCount: "12" }), true);
    });

    test("fields an old record never had are equal while both are missing", () => {
        const { dateType, ...old } = product();
        assert.equal(hasChanged(old, { ...old }), false);
        assert.equal(hasChanged(old, product()), true);
    });

    test("a product that does not exist any more counts as changed", () => {
        assert.equal(hasChanged(product(), undefined), true);
    });
});
