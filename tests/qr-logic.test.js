import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizeSiteUrl, isLocalAddress, qrTargetUrl, qrFileName } from "../admin/qr-logic.js";

describe("normalizeSiteUrl", () => {
    test("accepts http and https addresses, with or without a port or path", () => {
        assert.deepEqual(normalizeSiteUrl("http://192.168.1.20:5000"), { url: "http://192.168.1.20:5000" });
        assert.deepEqual(normalizeSiteUrl("https://magaza.example.com"), { url: "https://magaza.example.com" });
        assert.deepEqual(normalizeSiteUrl("https://example.com/magaza"), { url: "https://example.com/magaza" });
    });

    test("trims spaces and trailing slashes, lower-cases the host", () => {
        assert.deepEqual(normalizeSiteUrl("  http://192.168.1.20:5000/  "), { url: "http://192.168.1.20:5000" });
        assert.deepEqual(normalizeSiteUrl("https://Example.COM///"), { url: "https://example.com" });
        assert.deepEqual(normalizeSiteUrl("https://example.com/magaza/"), { url: "https://example.com/magaza" });
    });

    test("drops the default port", () => {
        assert.deepEqual(normalizeSiteUrl("https://example.com:443"), { url: "https://example.com" });
    });

    test("rejects empty input and a missing scheme", () => {
        for (const bad of ["", "   ", null, undefined, "192.168.1.20:5000", "example.com"]) {
            assert.deepEqual(normalizeSiteUrl(bad), { error: "error.site.invalid" }, JSON.stringify(bad));
        }
    });

    test("rejects other schemes (some are not even addresses to the URL parser)", () => {
        assert.deepEqual(normalizeSiteUrl("ftp://example.com"), { error: "error.site.scheme" });
        assert.deepEqual(normalizeSiteUrl("javascript:alert(1)"), { error: "error.site.scheme" });
        assert.deepEqual(normalizeSiteUrl("data:text/html,x"), { error: "error.site.scheme" });
        assert.deepEqual(normalizeSiteUrl("file:///etc/passwd"), { error: "error.site.scheme" });
    });

    test("rejects credentials, query strings and fragments", () => {
        assert.deepEqual(normalizeSiteUrl("http://user:pass@example.com"), { error: "error.site.credentials" });
        assert.deepEqual(normalizeSiteUrl("http://example.com?x=1"), { error: "error.site.queryOrHash" });
        assert.deepEqual(normalizeSiteUrl("http://example.com/#top"), { error: "error.site.queryOrHash" });
    });
});

describe("isLocalAddress", () => {
    test("detects addresses only this computer can reach", () => {
        for (const local of [
            "http://localhost:5000",
            "http://LOCALHOST",
            "http://127.0.0.1:5000",
            "http://127.1.2.3",
            "http://[::1]:5000",
            "http://0.0.0.0:5000",
            "http://shop.localhost:5000"
        ]) {
            assert.equal(isLocalAddress(local), true, local);
        }
    });

    test("network and public addresses are fine", () => {
        for (const reachable of [
            "http://192.168.1.20:5000",
            "http://10.0.0.5",
            "https://example.com",
            "http://magaza.local:5000",
            "http://localhost.example.com"
        ]) {
            assert.equal(isLocalAddress(reachable), false, reachable);
        }
    });

    test("garbage is not reported as local", () => {
        assert.equal(isLocalAddress("not a url"), false);
        assert.equal(isLocalAddress(undefined), false);
    });
});

describe("qrTargetUrl", () => {
    test("builds the product page address", () => {
        assert.equal(
            qrTargetUrl("http://192.168.1.20:5000", "abc123"),
            "http://192.168.1.20:5000/product/product.html?id=abc123"
        );
        assert.equal(
            qrTargetUrl("https://example.com/magaza", "abc123"),
            "https://example.com/magaza/product/product.html?id=abc123"
        );
    });

    test("encodes the id so it cannot change the address", () => {
        assert.equal(
            qrTargetUrl("https://example.com", "a b&c=d#e"),
            "https://example.com/product/product.html?id=a%20b%26c%3Dd%23e"
        );
    });
});

describe("qrFileName", () => {
    test("makes a safe ASCII file name from a product name", () => {
        assert.equal(qrFileName("Süt 1L"), "qr-sut-1l.png");
        assert.equal(qrFileName("ÇAY, Ihlamur & Öğütülmüş Şeker"), "qr-cay-ihlamur-ogutulmus-seker.png");
        assert.equal(qrFileName("İçecek"), "qr-icecek.png");
    });

    test("never contains path or special characters", () => {
        assert.equal(qrFileName("../../etc/passwd"), "qr-etc-passwd.png");
        assert.equal(qrFileName("<img src=x onerror=alert(1)>"), "qr-img-src-x-onerror-alert-1.png");
    });

    test("falls back for empty names and limits the length", () => {
        for (const empty of ["", "   ", "!!!", null, undefined]) assert.equal(qrFileName(empty), "qr-urun.png");
        assert.ok(qrFileName("a".repeat(200)).length <= "qr-".length + 40 + ".png".length);
    });
});
