import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The pages load the Firebase SDK from Google's CDN at a fixed version, while the tests use the
// `firebase` npm package. Keeping the two on the same version means the rules tests exercise the
// same SDK that runs in the browser, and it stops the CDN version from silently falling behind.

const FILES = ["shared/firebase.js", "admin/firebase-admin.js"];

test("every CDN import uses the same Firebase SDK version as the firebase dev dependency", () => {
    const installed = JSON.parse(readFileSync("node_modules/firebase/package.json", "utf8")).version;
    const used = new Set();

    for (const file of FILES) {
        const versions = [...readFileSync(file, "utf8").matchAll(/gstatic\.com\/firebasejs\/([0-9][^/]*)\//g)].map(
            (m) => m[1]
        );
        assert.ok(versions.length > 0, `${file} has no Firebase CDN import`);
        versions.forEach((version) => used.add(version));
    }

    assert.deepEqual([...used], [installed], "update the gstatic URLs and the firebase dev dependency together");
});
