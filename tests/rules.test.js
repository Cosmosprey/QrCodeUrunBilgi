// Security rules tests. Run with `npm test`, which starts the Firebase emulators first.

import { test, describe, before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, collection, setDoc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getBytes, deleteObject, listAll, updateMetadata } from "firebase/storage";

const ADMIN_UID = "dev-admin-uid"; // default value in firestore.rules / storage.rules

const validProduct = () => ({
    name: "Süt 1L",
    price: 39.9,
    category: "İçecek",
    description: "Tam yağlı süt.",
    dateType: "SKT",
    lastUseDate: "2030-01-31",
    image: "https://example.com/sut.jpg",
    stockCount: 12,
    priceLastUpdate: "2026-10-01"
});

let testEnv;

before(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "demo-qr-product-info",
        firestore: { rules: readFileSync("firestore.rules", "utf8") },
        storage: { rules: readFileSync("storage.rules", "utf8") }
    });
});

after(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
    await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "products", "p1"), validProduct());
    });
});

const anonymous = () => testEnv.unauthenticatedContext();
const stranger = () => testEnv.authenticatedContext("someone-else");
const admin = () => testEnv.authenticatedContext(ADMIN_UID);

describe("firestore: who may do what", () => {
    test("anyone can read a single product (the QR page)", async () => {
        await assertSucceeds(getDoc(doc(anonymous().firestore(), "products", "p1")));
    });

    test("anonymous users cannot list the catalogue", async () => {
        await assertFails(getDocs(collection(anonymous().firestore(), "products")));
    });

    test("anonymous users cannot create, update or delete", async () => {
        const db = anonymous().firestore();
        await assertFails(addDoc(collection(db, "products"), validProduct()));
        await assertFails(setDoc(doc(db, "products", "p1"), validProduct()));
        await assertFails(deleteDoc(doc(db, "products", "p1")));
    });

    test("a signed-in user that is not the admin cannot list or write", async () => {
        const db = stranger().firestore();
        await assertFails(getDocs(collection(db, "products")));
        await assertFails(addDoc(collection(db, "products"), validProduct()));
        await assertFails(setDoc(doc(db, "products", "p1"), validProduct()));
        await assertFails(deleteDoc(doc(db, "products", "p1")));
    });

    test("the admin can list, create, update and delete", async () => {
        const db = admin().firestore();
        await assertSucceeds(getDocs(collection(db, "products")));
        await assertSucceeds(addDoc(collection(db, "products"), validProduct()));
        await assertSucceeds(setDoc(doc(db, "products", "p1"), { ...validProduct(), stockCount: 3 }));
        await assertSucceeds(deleteDoc(doc(db, "products", "p1")));
    });

    test("a signed-in non-admin cannot update a product (not only create or delete)", async () => {
        await assertFails(updateDoc(doc(stranger().firestore(), "products", "p1"), { price: 1 }));
        await assertFails(updateDoc(doc(anonymous().firestore(), "products", "p1"), { price: 1 }));
    });

    test("other collections are closed to everyone, admin included", async () => {
        await assertFails(getDoc(doc(admin().firestore(), "settings", "x")));
        await assertFails(setDoc(doc(admin().firestore(), "settings", "x"), { a: 1 }));
    });
});

describe("firestore: site address setting", () => {
    const site = (context) => doc(context.firestore(), "settings", "site");
    const withSetting = () =>
        testEnv.withSecurityRulesDisabled((context) => setDoc(site(context), { siteUrl: "http://192.168.1.20:5000" }));

    test("only the admin can read it", async () => {
        await withSetting();
        await assertSucceeds(getDoc(site(admin())));
        await assertFails(getDoc(site(anonymous())));
        await assertFails(getDoc(site(stranger())));
    });

    test("only the admin can write or delete it", async () => {
        await assertSucceeds(setDoc(site(admin()), { siteUrl: "https://magaza.example.com" }));
        await assertFails(setDoc(site(anonymous()), { siteUrl: "https://evil.example.com" }));
        await assertFails(setDoc(site(stranger()), { siteUrl: "https://evil.example.com" }));
        await withSetting();
        await assertFails(deleteDoc(site(anonymous())));
        await assertFails(deleteDoc(site(stranger())));
        await assertSucceeds(deleteDoc(site(admin())));
    });

    test("accepts http and https addresses", async () => {
        await assertSucceeds(setDoc(site(admin()), { siteUrl: "http://192.168.1.20:5000" }));
        await assertSucceeds(setDoc(site(admin()), { siteUrl: "https://example.com/magaza" }));
    });

    test("rejects anything that is not an http(s) address", async () => {
        for (const bad of [
            "javascript:alert(1)",
            "ftp://example.com",
            "192.168.1.20:5000",
            "http://with space.example",
            "",
            "http://",
            42,
            null
        ]) {
            await assertFails(setDoc(site(admin()), { siteUrl: bad }));
        }
        await assertFails(setDoc(site(admin()), { siteUrl: "https://example.com/" + "x".repeat(200) }));
    });

    test("rejects extra or missing fields", async () => {
        await assertFails(setDoc(site(admin()), { siteUrl: "https://example.com", extra: 1 }));
        await assertFails(setDoc(site(admin()), {}));
    });

    test("no other document can be created in settings", async () => {
        await assertFails(setDoc(doc(admin().firestore(), "settings", "other"), { siteUrl: "https://example.com" }));
        await assertFails(addDoc(collection(admin().firestore(), "settings"), { siteUrl: "https://example.com" }));
    });
});

describe("firestore: product validation (admin writes)", () => {
    const rejects = (label, change) =>
        test(`rejects ${label}`, async () => {
            const data = change(validProduct());
            await assertFails(setDoc(doc(admin().firestore(), "products", "bad"), data));
        });

    const accepts = (label, change) =>
        test(`accepts ${label}`, async () => {
            const data = change(validProduct());
            await assertSucceeds(setDoc(doc(admin().firestore(), "products", "ok"), data));
        });

    rejects("an unknown extra field", (p) => ({ ...p, isAdmin: true }));
    rejects("a missing field", ({ dateType, ...rest }) => rest);

    rejects("a name that is too short", (p) => ({ ...p, name: "A" }));
    rejects("a name that is too long", (p) => ({ ...p, name: "A".repeat(71) }));
    rejects("a name that is not a string", (p) => ({ ...p, name: 123 }));

    rejects("a price of zero", (p) => ({ ...p, price: 0 }));
    rejects("a negative price", (p) => ({ ...p, price: -5 }));
    rejects("a price given as a string", (p) => ({ ...p, price: "<img src=x onerror=alert(1)>" }));
    rejects("an absurdly high price", (p) => ({ ...p, price: 1000001 }));

    rejects("a negative stock count", (p) => ({ ...p, stockCount: -1 }));
    rejects("a fractional stock count", (p) => ({ ...p, stockCount: 1.5 }));
    rejects("a stock count given as a string", (p) => ({ ...p, stockCount: "10" }));

    rejects("an unknown date type", (p) => ({ ...p, dateType: "XYZ" }));
    rejects("a malformed expiry date", (p) => ({ ...p, lastUseDate: "31/01/2030" }));
    rejects("a malformed price update date", (p) => ({ ...p, priceLastUpdate: "yesterday" }));
    rejects("a month that does not exist", (p) => ({ ...p, lastUseDate: "2030-13-01" }));
    rejects("a month 00", (p) => ({ ...p, lastUseDate: "2030-00-10" }));
    rejects("a day that does not exist", (p) => ({ ...p, lastUseDate: "2030-01-32" }));
    rejects("a day 00", (p) => ({ ...p, lastUseDate: "2030-01-00" }));
    rejects("an impossible price update date", (p) => ({ ...p, priceLastUpdate: "9999-99-99" }));
    rejects("an empty price update date", (p) => ({ ...p, priceLastUpdate: "" }));

    rejects("a javascript: image URL", (p) => ({ ...p, image: "javascript:alert(1)" }));
    rejects("a data: image URL", (p) => ({ ...p, image: "data:text/html,<script>alert(1)</script>" }));
    rejects("a description over 1000 characters", (p) => ({ ...p, description: "x".repeat(1001) }));
    rejects("an empty category", (p) => ({ ...p, category: "" }));
    rejects("a category over 40 characters", (p) => ({ ...p, category: "k".repeat(41) }));

    accepts("a product without expiry date, description or image", (p) => ({
        ...p,
        lastUseDate: "",
        description: "",
        image: ""
    }));
    accepts("an integer price", (p) => ({ ...p, price: 25 }));
    accepts("a custom category", (p) => ({ ...p, category: "Kırtasiye" }));
    accepts("the first and last day of the year", (p) => ({
        ...p,
        lastUseDate: "2030-12-31",
        priceLastUpdate: "2030-01-01"
    }));
    accepts("zero stock", (p) => ({ ...p, stockCount: 0 }));
    accepts("TETT products", (p) => ({ ...p, dateType: "TETT" }));
    accepts("an http (emulator style) image URL", (p) => ({
        ...p,
        image: "http://127.0.0.1:9199/v0/b/demo/o/products%2Fa.png?alt=media"
    }));
});

describe("storage: product images", () => {
    const bytes = (size) => new Uint8Array(size);
    const imageRef = (context, name = "products/a.png") => ref(context.storage(), name);

    test("anyone can read an image", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await uploadBytes(imageRef(context), bytes(10), { contentType: "image/png" });
        });
        await assertSucceeds(getBytes(imageRef(anonymous())));
    });

    test("nobody can list the image folder (images are only reachable by their exact URL)", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await uploadBytes(imageRef(context), bytes(10), { contentType: "image/png" });
        });
        await assertFails(listAll(ref(anonymous().storage(), "products")));
        await assertFails(listAll(ref(stranger().storage(), "products")));
    });

    test("anonymous and non-admin users cannot upload", async () => {
        await assertFails(uploadBytes(imageRef(anonymous()), bytes(10), { contentType: "image/png" }));
        await assertFails(uploadBytes(imageRef(stranger()), bytes(10), { contentType: "image/png" }));
    });

    test("the admin can upload JPEG, PNG, WebP and GIF", async () => {
        for (const [name, type] of [
            ["products/a.jpg", "image/jpeg"],
            ["products/b.png", "image/png"],
            ["products/c.webp", "image/webp"],
            ["products/d.gif", "image/gif"]
        ]) {
            await assertSucceeds(uploadBytes(imageRef(admin(), name), bytes(10), { contentType: type }));
        }
    });

    test("the admin cannot upload SVG, HTML or plain text", async () => {
        for (const type of ["image/svg+xml", "text/html", "text/plain", "application/javascript"]) {
            await assertFails(uploadBytes(imageRef(admin(), "products/x.bin"), bytes(10), { contentType: type }));
        }
    });

    test("the admin cannot upload more than 2 MB", async () => {
        await assertSucceeds(
            uploadBytes(imageRef(admin(), "products/ok.png"), bytes(2 * 1024 * 1024), { contentType: "image/png" })
        );
        await assertFails(
            uploadBytes(imageRef(admin(), "products/big.png"), bytes(2 * 1024 * 1024 + 1), { contentType: "image/png" })
        );
    });

    test("nobody can write outside products/", async () => {
        await assertFails(uploadBytes(imageRef(admin(), "other/a.png"), bytes(10), { contentType: "image/png" }));
        await assertFails(uploadBytes(imageRef(admin(), "a.png"), bytes(10), { contentType: "image/png" }));
    });

    test("nobody but the admin can replace an image or change its type", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await uploadBytes(imageRef(context), bytes(10), { contentType: "image/png" });
        });
        await assertFails(uploadBytes(imageRef(anonymous()), bytes(20), { contentType: "image/png" }));
        await assertFails(uploadBytes(imageRef(stranger()), bytes(20), { contentType: "image/png" }));
        await assertFails(updateMetadata(imageRef(stranger()), { contentType: "image/gif" }));
        await assertFails(updateMetadata(imageRef(admin()), { contentType: "text/html" }));
    });

    test("only the admin can delete an image", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await uploadBytes(imageRef(context), bytes(10), { contentType: "image/png" });
        });
        await assertFails(deleteObject(imageRef(anonymous())));
        await assertFails(deleteObject(imageRef(stranger())));
        await assertSucceeds(deleteObject(imageRef(admin())));
    });
});
