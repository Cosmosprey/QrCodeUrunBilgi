// Automatic accessibility checks (axe-core) on every screen, in both languages.
// They catch missing labels, low contrast, wrong heading order and similar problems.

import { test, expect, NOW, clearData, addProduct, signIn, accessibilityViolations } from "./support.js";

test.beforeEach(async ({ page }) => {
    await clearData();
    await page.clock.setFixedTime(NOW);
});

for (const [language, button] of [
    ["Turkish", "TR"],
    ["English", "EN"]
]) {
    test.describe(language, () => {
        const pickLanguage = (page) => page.getByRole("button", { name: button, exact: true }).first().click();

        test("login screen", async ({ page }) => {
            await page.goto("/admin/admin.html");
            await pickLanguage(page);
            expect(await accessibilityViolations(page)).toEqual([]);
        });

        test("admin panel", async ({ page }) => {
            await addProduct({ name: "Süt 1L", stockCount: 3 });
            await addProduct({ name: "Ekmek", stockCount: 0, image: "" });
            await signIn(page);
            await pickLanguage(page);
            await expect(page.locator(".product-card")).toHaveCount(2);
            expect(await accessibilityViolations(page)).toEqual([]);
        });

        test("admin panel in edit mode (with the Cancel button and an error message)", async ({ page }) => {
            await addProduct({ name: "Süt 1L" });
            await signIn(page);
            await pickLanguage(page);
            await page.locator(".product-card button.btn-outline-light").click();
            await expect(page.locator("#cancel-edit-btn")).toBeVisible();
            await page.locator("#name").fill("   ");
            await page.locator("#submit-btn").click();
            await expect(page.locator("#form-error")).toBeVisible();
            expect(await accessibilityViolations(page)).toEqual([]);
        });

        test("QR window, also with an error message in it", async ({ page }) => {
            await addProduct();
            await signIn(page);
            await pickLanguage(page);
            await page.locator(".product-card button.btn-primary").click();
            await expect(page.locator("#qrContainer canvas")).toBeVisible();
            expect(await accessibilityViolations(page)).toEqual([]);

            await page.locator("#qrSiteUrl").fill("ftp://x");
            await page.locator("#qrSiteSave").click();
            await expect(page.locator("#qrSiteMessage")).toBeVisible();
            expect(await accessibilityViolations(page)).toEqual([]);
        });

        test("customer page with a discount", async ({ page }) => {
            const id = await addProduct({ lastUseDate: "2026-10-28" });
            await page.goto(`/product/product.html?id=${id}`);
            await expect(page.locator("#product-card")).toBeVisible();
            await pickLanguage(page);
            expect(await accessibilityViolations(page)).toEqual([]);
        });

        test("customer page: product not found", async ({ page }) => {
            await page.goto("/product/product.html?id=does-not-exist");
            await expect(page.locator("#error")).toBeVisible();
            await pickLanguage(page);
            expect(await accessibilityViolations(page)).toEqual([]);
        });
    });
}
