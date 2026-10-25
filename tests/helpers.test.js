import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { usernameToEmail, AUTH_EMAIL_DOMAIN } from "../admin/username.js";
import { validateImageFile, storagePathFor, MAX_IMAGE_BYTES, MAX_INPUT_BYTES } from "../admin/upload.js";
import { safeHttpUrl } from "../shared/dom.js";

describe("usernameToEmail", () => {
    test("maps a valid username to the internal e-mail address", () => {
        assert.equal(usernameToEmail("admin"), `admin@${AUTH_EMAIL_DOMAIN}`);
    });

    test("trims and lower-cases the username", () => {
        assert.equal(usernameToEmail("  Admin.User  "), `admin.user@${AUTH_EMAIL_DOMAIN}`);
    });

    test("rejects empty, too short, too long and unusual usernames", () => {
        for (const bad of ["", "  ", "ab", "a".repeat(33), "with space", "a@b.com", "ünal", "a/b", null, undefined]) {
            assert.equal(usernameToEmail(bad), null, JSON.stringify(bad));
        }
    });
});

describe("validateImageFile", () => {
    const file = (type, size) => ({ type, size });

    test("accepts nothing selected", () => {
        assert.equal(validateImageFile(undefined), null);
    });

    test("accepts allowed image types within the size limit", () => {
        for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
            assert.equal(validateImageFile(file(type, 1000)), null, type);
        }
        assert.equal(validateImageFile(file("image/png", MAX_IMAGE_BYTES)), null);
    });

    test("rejects SVG and other non-image types", () => {
        for (const type of ["image/svg+xml", "text/html", "application/pdf", ""]) {
            assert.match(validateImageFile(file(type, 1000)), /JPEG, PNG, WebP veya GIF/, type);
        }
    });

    test("photos may be large because they are shrunk before upload, up to 25 MB", () => {
        for (const type of ["image/jpeg", "image/png", "image/webp"]) {
            assert.equal(validateImageFile(file(type, 8 * 1024 * 1024)), null, type);
            assert.equal(validateImageFile(file(type, MAX_INPUT_BYTES)), null, type);
            assert.match(validateImageFile(file(type, MAX_INPUT_BYTES + 1)), /25 MB/, type);
        }
    });

    test("GIFs are not shrunk, so they keep the 2 MB upload limit", () => {
        assert.equal(validateImageFile(file("image/gif", MAX_IMAGE_BYTES)), null);
        assert.match(validateImageFile(file("image/gif", MAX_IMAGE_BYTES + 1)), /GIF.*2 MB/);
    });

    test("does not treat inherited object properties as allowed types", () => {
        assert.notEqual(validateImageFile(file("constructor", 1000)), null);
        assert.notEqual(validateImageFile(file("__proto__", 1000)), null);
    });
});

describe("storagePathFor", () => {
    test("builds the path from the id and the detected type, never from the file name", () => {
        const file = { type: "image/png", name: "../../evil<script>.png" };
        assert.equal(storagePathFor(file, "abc-123"), "products/abc-123.png");
    });
});

describe("safeHttpUrl", () => {
    test("keeps http and https URLs", () => {
        assert.equal(safeHttpUrl("https://example.com/a.png"), "https://example.com/a.png");
        assert.equal(safeHttpUrl("http://127.0.0.1:9199/a.png"), "http://127.0.0.1:9199/a.png");
    });

    test("drops everything else", () => {
        for (const bad of ["javascript:alert(1)", "data:text/html,<b>x</b>", "ftp://x.com/a", "not a url", "", null, undefined, 42]) {
            assert.equal(safeHttpUrl(bad), "", String(bad));
        }
    });
});
