import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { fitWithin, needsConversion, formatBytes, MAX_SIDE, KEEP_AS_IS_BYTES } from "../admin/image-logic.js";

describe("fitWithin", () => {
    test("scales the longest side down to the limit and keeps the aspect ratio", () => {
        assert.deepEqual(fitWithin(4000, 3000), { width: 1200, height: 900 });
        assert.deepEqual(fitWithin(3000, 4000), { width: 900, height: 1200 });
        assert.deepEqual(fitWithin(2400, 2400), { width: 1200, height: 1200 });
    });

    test("never scales up and leaves pictures within the limit alone", () => {
        assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 });
        assert.deepEqual(fitWithin(MAX_SIDE, 10), { width: MAX_SIDE, height: 10 });
    });

    test("rounds to whole pixels and never returns a zero side", () => {
        assert.deepEqual(fitWithin(1999, 1001), { width: 1200, height: 601 });
        assert.deepEqual(fitWithin(100000, 10), { width: 1200, height: 1 });
    });

    test("accepts a different limit", () => {
        assert.deepEqual(fitWithin(1000, 500, 400), { width: 400, height: 200 });
    });
});

describe("needsConversion", () => {
    const photo = (type, size) => ({ type, size });
    const dims = (width, height) => ({ width, height });

    test("large photos are converted", () => {
        assert.equal(needsConversion(photo("image/jpeg", 5_000_000), dims(4000, 3000)), true);
        assert.equal(needsConversion(photo("image/png", 900_000), dims(1000, 800)), true); // small in pixels, big in bytes
        assert.equal(needsConversion(photo("image/jpeg", 100_000), dims(2000, 1000)), true); // small in bytes, big in pixels
    });

    test("small pictures are left alone", () => {
        assert.equal(needsConversion(photo("image/jpeg", KEEP_AS_IS_BYTES), dims(MAX_SIDE, 800)), false);
        assert.equal(needsConversion(photo("image/png", 2_000), dims(1, 1)), false);
    });

    test("GIFs are never converted (the animation would be lost)", () => {
        assert.equal(needsConversion(photo("image/gif", 5_000_000), dims(4000, 3000)), false);
    });
});

describe("formatBytes", () => {
    test("kilobytes below one megabyte, at least 1 KB", () => {
        assert.equal(formatBytes(180 * 1024), "180 KB");
        assert.equal(formatBytes(1), "1 KB");
        assert.equal(formatBytes(1024 * 1024 - 1), "1024 KB");
    });

    test("megabytes with one decimal, in the language's number format", () => {
        assert.equal(formatBytes(4.2 * 1024 * 1024), "4,2 MB");
        assert.equal(formatBytes(4.2 * 1024 * 1024, "en-US"), "4.2 MB");
        assert.equal(formatBytes(2 * 1024 * 1024), "2 MB");
    });
});
