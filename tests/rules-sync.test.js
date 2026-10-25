// The two rules files and the admin code repeat some values ("keep in sync" comments). A value changed in one
// place only would leave the other service closed or too open, so these tests compare them.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES } from "../admin/upload.js";
import { LIMITS } from "../admin/product-validation.js";

const firestoreRules = readFileSync("firestore.rules", "utf8");
const storageRules = readFileSync("storage.rules", "utf8");

const adminUid = (rules) => /request\.auth\.uid == '([^']+)'/.exec(rules)?.[1];

test("firestore.rules and storage.rules name the same admin", () => {
    assert.ok(adminUid(firestoreRules), "no admin uid found in firestore.rules");
    assert.equal(adminUid(storageRules), adminUid(firestoreRules));
});

test("the upload limit in storage.rules is the one the admin form checks", () => {
    const [, megabytes] = /request\.resource\.size <= (\d+) \* 1024 \* 1024/.exec(storageRules) ?? [];
    assert.equal(Number(megabytes) * 1024 * 1024, MAX_IMAGE_BYTES);
});

test("the image types in storage.rules are the ones the admin form accepts", () => {
    const [, list] = /contentType\.matches\('image\/\(([^)]+)\)'\)/.exec(storageRules) ?? [];
    assert.deepEqual(
        list.split("|").sort(),
        Object.keys(ALLOWED_IMAGE_TYPES)
            .map((type) => type.split("/")[1])
            .sort()
    );
});

test("the product limits in firestore.rules are the ones the admin form checks", () => {
    assert.match(
        firestoreRules,
        new RegExp(`data\\.name\\.size\\(\\) >= ${LIMITS.nameMin} && data\\.name\\.size\\(\\) <= ${LIMITS.nameMax}`)
    );
    assert.match(firestoreRules, new RegExp(`data\\.price > 0 && data\\.price <= ${LIMITS.priceMax}`));
    assert.match(firestoreRules, new RegExp(`data\\.stockCount >= 0 && data\\.stockCount <= ${LIMITS.stockMax}`));
});
