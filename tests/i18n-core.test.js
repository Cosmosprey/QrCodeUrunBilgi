import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { detectLanguage, intlLocale, interpolate, translate, translateParts } from "../shared/i18n-core.js";

describe("detectLanguage", () => {
    test("a saved choice wins over the browser", () => {
        assert.equal(detectLanguage({ saved: "en", browserLanguages: ["tr-TR"] }), "en");
        assert.equal(detectLanguage({ saved: "tr", browserLanguages: ["en-US"] }), "tr");
    });

    test("an unknown saved value is ignored", () => {
        assert.equal(detectLanguage({ saved: "de", browserLanguages: ["tr"] }), "tr");
        assert.equal(detectLanguage({ saved: null, browserLanguages: ["fr"] }), "en");
    });

    test("Turkish browsers get Turkish, everything else English", () => {
        for (const turkish of ["tr", "tr-TR", "TR-tr"]) assert.equal(detectLanguage({ browserLanguages: [turkish] }), "tr", turkish);
        for (const other of ["en-US", "en-GB", "de-DE", "az", "ar"]) assert.equal(detectLanguage({ browserLanguages: [other] }), "en", other);
    });

    test("the browser's first preference decides", () => {
        assert.equal(detectLanguage({ browserLanguages: ["en-US", "tr"] }), "en");
        assert.equal(detectLanguage({ browserLanguages: ["tr-TR", "en"] }), "tr");
    });

    test("with no information the original language, Turkish, is used", () => {
        assert.equal(detectLanguage(), "tr");
        assert.equal(detectLanguage({ browserLanguages: [] }), "tr");
        assert.equal(detectLanguage({ browserLanguages: [undefined, ""] }), "tr");
    });
});

describe("intlLocale", () => {
    test("maps the two languages to number and date locales", () => {
        assert.equal(intlLocale("tr"), "tr-TR");
        assert.equal(intlLocale("en"), "en-GB");
    });
});

describe("interpolate", () => {
    test("fills in named placeholders", () => {
        assert.equal(interpolate("Stok: {count}", { count: 7 }), "Stok: 7");
        assert.equal(interpolate("{a} ve {b}, {a}", { a: "x", b: "y" }), "x ve y, x");
    });

    test("leaves unknown placeholders and texts without placeholders alone", () => {
        assert.equal(interpolate("Merhaba {name}"), "Merhaba {name}");
        assert.equal(interpolate("Merhaba"), "Merhaba");
    });

    test("parameter values are plain text (no markup is interpreted)", () => {
        assert.equal(interpolate("{n}", { n: "<b>x</b>" }), "<b>x</b>");
    });
});

describe("translate", () => {
    const dictionary = { hello: "Hello {name}", "days": "{count} days left", "days.one": "{count} day left" };

    test("looks up and fills in", () => {
        assert.equal(translate(dictionary, "hello", { name: "Ada" }), "Hello Ada");
    });

    test("uses the singular variant for exactly one", () => {
        assert.equal(translate(dictionary, "days", { count: 1 }), "1 day left");
        assert.equal(translate(dictionary, "days", { count: 2 }), "2 days left");
        assert.equal(translate(dictionary, "days", { count: 0 }), "0 days left");
    });

    test("a language without a singular variant just uses the base text", () => {
        assert.equal(translate({ days: "{count} Gün Kaldı" }, "days", { count: 1 }), "1 Gün Kaldı");
    });

    test("a missing key is returned as the key, never as undefined", () => {
        assert.equal(translate(dictionary, "nope"), "nope");
        assert.equal(translate(dictionary, "constructor"), "constructor");
        assert.equal(translate(dictionary, "__proto__"), "__proto__");
    });
});

describe("translateParts", () => {
    const dictionary = { coupon: "Use {code} to get {discount} off!", plain: "Just text" };

    test("splits around placeholders and keeps node-like parameters as they are", () => {
        const code = { tag: "span" };
        const discount = { tag: "strong" };
        assert.deepEqual(translateParts(dictionary, "coupon", { code, discount }), ["Use ", code, " to get ", discount, " off!"]);
    });

    test("the order of placeholders follows the language, not the code", () => {
        const swapped = { coupon: "{discount} off with {code}" };
        const code = { tag: "span" };
        const discount = { tag: "strong" };
        assert.deepEqual(translateParts(swapped, "coupon", { code, discount }), [discount, " off with ", code]);
    });

    test("plain parameters become text; unknown placeholders stay visible", () => {
        assert.deepEqual(translateParts({ k: "A {x} B {y}" }, "k", { x: 5 }), ["A ", "5", " B ", "{y}"]);
    });

    test("a text without placeholders is a single piece; a missing key is the key", () => {
        assert.deepEqual(translateParts(dictionary, "plain"), ["Just text"]);
        assert.deepEqual(translateParts(dictionary, "missing"), ["missing"]);
    });
});
