import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tr } from "../shared/locales/tr.js";
import { en } from "../shared/locales/en.js";

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const baseKeys = (dictionary) => Object.keys(dictionary).filter((key) => !key.endsWith(".one"));

describe("the two dictionaries", () => {
    test("have exactly the same keys (plural variants aside)", () => {
        assert.deepEqual(baseKeys(en).sort(), baseKeys(tr).sort());
    });

    test("a singular variant always belongs to an existing key", () => {
        for (const dictionary of [tr, en]) {
            for (const key of Object.keys(dictionary).filter((k) => k.endsWith(".one"))) {
                assert.ok(Object.hasOwn(dictionary, key.slice(0, -4)), key);
            }
        }
    });

    test("use the same placeholders in every key", () => {
        for (const key of baseKeys(tr)) {
            assert.deepEqual(placeholders(en[key]), placeholders(tr[key]), key);
        }
        for (const key of Object.keys(en).filter((k) => k.endsWith(".one"))) {
            assert.deepEqual(placeholders(en[key]), placeholders(en[key.slice(0, -4)]), key);
        }
    });

    test("have no empty texts", () => {
        for (const [name, dictionary] of [
            ["tr", tr],
            ["en", en]
        ]) {
            for (const [key, text] of Object.entries(dictionary)) assert.ok(text.trim().length > 0, `${name}: ${key}`);
        }
    });

    test("English texts contain no Turkish letters (a sign of a missing translation)", () => {
        for (const [key, text] of Object.entries(en)) {
            // the stored category values and the SKT/TETT terms are the only Turkish words allowed
            assert.doesNotMatch(text.replace(/SKT|TETT/g, ""), /[çğıöşüÇĞİÖŞÜ]/, key);
        }
    });
});

// ---- every key used in the code exists, and every key in the dictionary is used somewhere
const SOURCE_FILES = ["admin", "product", "shared"].flatMap((dir) =>
    readdirSync(dir)
        .filter((name) => name.endsWith(".js") || name.endsWith(".html"))
        .map((name) => join(dir, name))
);
const source = (file) => readFileSync(file, "utf8");
const KEY_SHAPE = /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/;

// A key that is only mentioned in a comment is not used: comments are removed before the code is scanned.
const withoutComments = (text) =>
    text
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/(^|\s)\/\/.*$/gm, "$1");

describe("keys used in the code", () => {
    const usedInCalls = new Set();
    const anyLiteral = new Set();
    for (const file of SOURCE_FILES.filter((f) => !f.includes("locales"))) {
        const text = withoutComments(source(file));
        for (const m of text.matchAll(/\bt(?:Parts)?\(\s*["']([^"']+)["']/g)) usedInCalls.add(m[1]);
        for (const m of text.matchAll(/showMessage\(\s*[\w.]+,\s*["']([^"']+)["']/g)) usedInCalls.add(m[1]);
        for (const m of text.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) usedInCalls.add(m[1]);
        for (const m of text.matchAll(/["']([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+)["']/g)) anyLiteral.add(m[1]);
    }

    test("every key passed to t() or data-i18n exists in both dictionaries", () => {
        assert.ok(usedInCalls.size > 30, "the scan should find the keys (found " + usedInCalls.size + ")");
        for (const key of usedInCalls) {
            assert.ok(Object.hasOwn(tr, key), `tr is missing "${key}"`);
            assert.ok(Object.hasOwn(en, key), `en is missing "${key}"`);
        }
    });

    test("every dictionary key is used somewhere (no dead texts)", () => {
        for (const key of baseKeys(tr)) {
            assert.ok(usedInCalls.has(key) || anyLiteral.has(key), `"${key}" is never used`);
        }
    });

    test("every literal that looks like a key of this app exists (functions such as validators return keys)", () => {
        // the first part of a key ("error", "login", ...) is a namespace of the dictionary
        const namespaces = new Set(Object.keys(tr).map((key) => key.split(".")[0]));
        const looksLikeFile = /\.(html|js|css|json|png|svg|webp|jpe?g|gif|ico)$/;
        for (const key of anyLiteral) {
            if (!namespaces.has(key.split(".")[0]) || looksLikeFile.test(key)) continue;
            assert.ok(Object.hasOwn(tr, key), `"${key}" looks like a translation key but tr.js has no such key`);
            assert.ok(Object.hasOwn(en, key), `"${key}" looks like a translation key but en.js has no such key`);
        }
        assert.ok(KEY_SHAPE.test("error.image.type"));
    });
});
