import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { encodeWithinLimit } from "../admin/image-convert.js";

const MB = 1024 * 1024;

// A stand-in for a canvas: toBlob answers with a made-up size for each quality and records the calls.
function fakeCanvas(sizeByQuality, { type } = {}) {
    const calls = [];
    return {
        calls,
        toBlob(callback, requestedType, quality) {
            calls.push(quality);
            const size = sizeByQuality[quality];
            callback(size === undefined ? null : { type: type ?? requestedType, size });
        }
    };
}

describe("encodeWithinLimit", () => {
    test("stops at the first quality that fits", async () => {
        const canvas = fakeCanvas({ 0.85: 0.8 * MB, 0.75: 0.6 * MB });
        const blob = await encodeWithinLimit(canvas, "image/webp");
        assert.deepEqual(canvas.calls, [0.85]);
        assert.equal(blob.size, 0.8 * MB);
    });

    test("lowers the quality until the result fits", async () => {
        const canvas = fakeCanvas({ 0.85: 3 * MB, 0.75: 2.5 * MB, 0.65: 1.9 * MB, 0.5: 1.2 * MB });
        const blob = await encodeWithinLimit(canvas, "image/webp");
        assert.deepEqual(canvas.calls, [0.85, 0.75, 0.65]);
        assert.equal(blob.size, 1.9 * MB);
    });

    test("returns the smallest attempt when nothing fits, so the caller can refuse it", async () => {
        const canvas = fakeCanvas({ 0.85: 9 * MB, 0.75: 8 * MB, 0.65: 7 * MB, 0.5: 6 * MB, 0.4: 5 * MB });
        const blob = await encodeWithinLimit(canvas, "image/webp");
        assert.equal(canvas.calls.length, 5);
        assert.equal(blob.size, 5 * MB);
        assert.ok(blob.size > 2 * MB);
    });

    test("stops at once when the browser cannot encode the type (it answers with PNG)", async () => {
        const canvas = fakeCanvas({ 0.85: 4 * MB, 0.75: 3 * MB }, { type: "image/png" });
        const blob = await encodeWithinLimit(canvas, "image/webp");
        assert.deepEqual(canvas.calls, [0.85]);
        assert.equal(blob.type, "image/png");
    });

    test("returns null when the canvas gives no data", async () => {
        const canvas = fakeCanvas({});
        assert.equal(await encodeWithinLimit(canvas, "image/webp"), null);
        assert.deepEqual(canvas.calls, [0.85]);
    });

    test("accepts a different limit and different steps", async () => {
        const canvas = fakeCanvas({ 0.9: 500, 0.5: 100 });
        const blob = await encodeWithinLimit(canvas, "image/jpeg", { limit: 200, steps: [0.9, 0.5] });
        assert.deepEqual(canvas.calls, [0.9, 0.5]);
        assert.equal(blob.size, 100);
    });
});
