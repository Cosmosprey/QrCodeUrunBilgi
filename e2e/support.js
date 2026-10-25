// Shared helpers for the browser tests.

import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const FIRESTORE = "http://127.0.0.1:8080";
const PROJECT = "demo-qr-product-info";
const DOCUMENTS = `${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)/documents`;
// "Bearer owner" is how the Firestore emulator lets a script bypass the security rules.
const HEADERS = { "Content-Type": "application/json", Authorization: "Bearer owner" };

/** The day the pages believe it is: the SKT / TETT texts and discounts depend on it. */
export const NOW = new Date("2026-10-27T12:00:00+03:00");

/**
 * `test` with two checks added to every test: the page throws no uncaught errors and the Content Security Policy
 * blocks nothing (a violation would mean a script or style that the policy does not allow).
 */
export const test = base.extend({
    page: async ({ page }, use) => {
        await page.addInitScript(() => {
            window.__cspViolations = [];
            document.addEventListener("securitypolicyviolation", (event) => {
                window.__cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`);
            });
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));

        await use(page);

        expect(errors, "uncaught errors in the page").toEqual([]);
        const violations = await page.evaluate(() => window.__cspViolations ?? []).catch(() => []);
        expect(violations, "Content Security Policy violations").toEqual([]);
    }
});

export { expect };

const field = (value) => {
    if (typeof value === "number") {
        return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    }
    return { stringValue: value };
};

/** Empties the products (and settings) in the emulator. */
export async function clearData() {
    await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" });
}

const PRODUCT = {
    name: "Test ürünü",
    price: 100,
    category: "Yiyecek",
    description: "Açıklama",
    dateType: "SKT",
    lastUseDate: "2030-01-01",
    image: "",
    stockCount: 20,
    priceLastUpdate: "2026-10-01"
};

/** Stores a product straight in the emulator and returns its id. */
export async function addProduct(overrides = {}) {
    const product = { ...PRODUCT, ...overrides };
    const response = await fetch(`${DOCUMENTS}/products`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ fields: Object.fromEntries(Object.entries(product).map(([k, v]) => [k, field(v)])) })
    });
    const body = await response.json();
    return body.name.split("/").pop();
}

/** The stored products as plain objects (with their id), to check what the pages saved. */
export async function storedProducts() {
    const response = await fetch(`${DOCUMENTS}/products`, { headers: HEADERS });
    const body = await response.json();
    // The REST answer wraps every value ({ integerValue: "7" }, { stringValue: "x" }): unwrap it.
    const unwrap = (value) => {
        const [[type, content]] = Object.entries(value);
        return type === "integerValue" ? Number(content) : content;
    };
    return (body.documents ?? []).map((document) => ({
        id: document.name.split("/").pop(),
        ...Object.fromEntries(Object.entries(document.fields).map(([key, value]) => [key, unwrap(value)]))
    }));
}

/** Opens the admin panel and signs in as the development admin. */
export async function signIn(page) {
    await page.goto("/admin/admin.html");
    await page.locator("#login-username").fill("admin");
    await page.locator("#login-password").fill("admin123");
    await page.locator("#login-btn").click();
    await expect(page.locator("#app-view")).toBeVisible();
}

/** Fills in the product form. `fields` uses the ids of the inputs. */
export async function fillProductForm(page, { name, price, stockCount, lastUseDate, description } = {}) {
    if (name !== undefined) await page.locator("#name").fill(name);
    if (price !== undefined) await page.locator("#price").fill(String(price));
    if (stockCount !== undefined) await page.locator("#stockCount").fill(String(stockCount));
    if (lastUseDate !== undefined) await page.locator("#lastUseDate").fill(lastUseDate);
    if (description !== undefined) await page.locator("#description").fill(description);
}

/**
 * Runs the axe accessibility checker on what is on screen now and returns the violations (none is expected).
 * Transitions and animations are switched off first: axe measures the colours it finds at that moment, and halfway
 * through a button's hover transition they are blends of the start and end colours with too little contrast. That is
 * not what a visitor sees for more than a fraction of a second, but on a slow machine (CI) the scan can land there.
 */
export async function accessibilityViolations(page) {
    await page.addStyleTag({
        content: "*, *::before, *::after { transition: none !important; animation: none !important; }"
    });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const result = await new AxeBuilder({ page }).analyze();
    return result.violations.map(
        (violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`
    );
}
