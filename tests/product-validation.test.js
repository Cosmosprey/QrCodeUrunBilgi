import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateProductFields, LIMITS } from "../admin/product-validation.js";

const valid = { name: "Süt 1L", price: 39.9, stockCount: 12 };

describe("validateProductFields", () => {
    test("accepts a normal product", () => {
        assert.equal(validateProductFields(valid), null);
    });

    test("a name is 2 to 70 characters after trimming: spaces alone are not a name", () => {
        assert.equal(validateProductFields({ ...valid, name: "   " }), "error.name.length");
        assert.equal(validateProductFields({ ...valid, name: "  A  " }), "error.name.length");
        assert.equal(validateProductFields({ ...valid, name: "" }), "error.name.length");
        assert.equal(validateProductFields({ ...valid, name: undefined }), "error.name.length");
        assert.equal(validateProductFields({ ...valid, name: "A".repeat(71) }), "error.name.length");
        assert.equal(validateProductFields({ ...valid, name: "AB" }), null);
        assert.equal(validateProductFields({ ...valid, name: `  ${"A".repeat(70)}  ` }), null);
    });

    test("the price is a number from 0.01 to 1,000,000", () => {
        for (const price of [0, -1, 0.001, 1_000_000.01, NaN, Infinity]) {
            assert.equal(validateProductFields({ ...valid, price }), "error.price.range", String(price));
        }
        assert.equal(validateProductFields({ ...valid, price: LIMITS.priceMin }), null);
        assert.equal(validateProductFields({ ...valid, price: LIMITS.priceMax }), null);
    });

    test("the stock is a whole number from 0 to 1,000,000", () => {
        for (const stockCount of [-1, 1.5, NaN, Infinity, 1_000_001]) {
            assert.equal(validateProductFields({ ...valid, stockCount }), "error.stock.range", String(stockCount));
        }
        assert.equal(validateProductFields({ ...valid, stockCount: 0 }), null);
        assert.equal(validateProductFields({ ...valid, stockCount: LIMITS.stockMax }), null);
    });

    test("reports the name problem first", () => {
        assert.equal(validateProductFields({ name: " ", price: 0, stockCount: -1 }), "error.name.length");
    });
});
