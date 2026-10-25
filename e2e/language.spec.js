// The TR / EN switch on both pages.

import { test, expect, NOW, clearData, addProduct, signIn, fillProductForm } from "./support.js";

test.beforeEach(async ({ page }) => {
    await clearData();
    await page.clock.setFixedTime(NOW);
});

const turkishLetters = /[çğıöşüÇĞİÖŞÜ]/;

test.describe("the browser language decides the first visit", () => {
    test.describe("an English browser", () => {
        test.use({ locale: "en-GB" });

        test("gets English texts, prices and dates", async ({ page }) => {
            const id = await addProduct({
                name: "Milk",
                price: 1234.5,
                lastUseDate: "2026-10-28",
                description: "Fresh"
            });
            await page.goto(`/product/product.html?id=${id}`);
            await expect(page.locator("#product-card")).toBeVisible();

            await expect(page.locator("html")).toHaveAttribute("lang", "en");
            await expect(page).toHaveTitle("Milk | Product Details");
            await expect(page.locator("#price")).toContainText("₺1,234.50");
            await expect(page.locator("#lastUseDate")).toContainText("Use by (SKT)");
            await expect(page.locator("#lastUseDate")).toContainText("28 October 2026");
            await expect(page.locator("#lastUseDate")).toContainText("1 day left");
            await expect(page.getByText("Sustainability deal!")).toBeVisible();
            await expect(page.getByText("20% off")).toBeVisible();
            expect(await page.locator("body").innerText()).not.toMatch(turkishLetters);
        });
    });

    test.describe("a browser in any other language", () => {
        test.use({ locale: "de-DE" });

        test("also gets English", async ({ page }) => {
            await page.goto("/admin/admin.html");
            await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
        });
    });

    test("a Turkish browser gets Turkish", async ({ page }) => {
        await page.goto("/admin/admin.html");
        await expect(page.getByRole("heading", { name: "Yönetici Girişi" })).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    });
});

test("the choice is applied at once, remembered, and wins over the browser language", async ({ page }) => {
    const id = await addProduct({ name: "Milk", category: "İçecek", price: 1234.5 });
    await page.goto(`/product/product.html?id=${id}`);
    await expect(page.locator("#category")).toHaveText("İçecek");

    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#category")).toHaveText("Beverages");
    await expect(page.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#price")).toContainText("₺1,234.50");

    await page.reload();
    await expect(page.locator("#category")).toHaveText("Beverages");
});

test.describe("the selected language stands out from the other one", () => {
    // The selected button is a filled pill, the other one has no background and a fainter text colour.
    const looks = (button) =>
        button.evaluate((element) => {
            const style = getComputedStyle(element);
            return { background: style.backgroundColor, color: style.color };
        });

    const check = async (page) => {
        const selected = await looks(page.locator('[data-lang][aria-pressed="true"]:visible'));
        const other = await looks(page.locator('[data-lang][aria-pressed="false"]:visible'));
        expect(selected.background).not.toBe("rgba(0, 0, 0, 0)");
        expect(other.background).toBe("rgba(0, 0, 0, 0)");
        expect(selected.color).not.toBe(other.color);
    };

    test("on the customer page", async ({ page }) => {
        await page.goto(`/product/product.html?id=${await addProduct()}`);
        await expect(page.locator("#product-card")).toBeVisible();
        await check(page);
        await page.getByRole("button", { name: "EN" }).click();
        await check(page);
    });

    test("on the sign-in screen", async ({ page }) => {
        await page.goto("/admin/admin.html");
        await expect(page.locator("#login-view")).toBeVisible();
        await check(page);
    });
});

test("a message that stays on screen is translated when the language changes", async ({ page }) => {
    await page.goto("/admin/admin.html");
    await page.locator("#login-username").fill("admin");
    await page.locator("#login-password").fill("wrong-password");
    await page.locator("#login-btn").click();
    await expect(page.locator("#login-error")).toHaveText("Kullanıcı adı veya parola hatalı.");

    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#login-error")).toHaveText("Wrong username or password.");

    await page.locator("#login-password").fill("admin123");
    await page.locator("#login-btn").click();
    await expect(page.locator("#app-view")).toBeVisible();

    // a message in the product form too
    await fillProductForm(page, { name: "   ", price: 1, stockCount: 1 });
    await page.getByRole("button", { name: "SAVE" }).click();
    await expect(page.locator("#form-error")).toHaveText("The product name must be 2 to 70 characters.");
    await page.locator("#app-view").getByRole("button", { name: "TR" }).click();
    await expect(page.locator("#form-error")).toHaveText("Ürün adı 2 ile 70 karakter arasında olmalı.");
});

test("an unknown category is shown as it was stored", async ({ page }) => {
    const id = await addProduct({ category: "Oyuncak" });
    await page.goto(`/product/product.html?id=${id}`);
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#category")).toHaveText("Oyuncak");
});

test("works when the browser blocks storage", async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
            get() {
                throw new Error("blocked");
            }
        });
    });
    await page.goto("/admin/admin.html");
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
});

test("the admin panel follows the switch, including texts that were built by the scripts", async ({ page }) => {
    await addProduct({ name: "Süt 1L", price: 39.9, stockCount: 3 });
    await signIn(page);
    await page.locator("#app-view").getByRole("button", { name: "EN" }).click();

    await expect(page.locator("#form-title")).toHaveText("Add Product");
    await expect(page.locator("#category option").first()).toHaveText("Food");
    await expect(page.locator("#category option").first()).toHaveAttribute("value", "Yiyecek"); // stored value stays
    const card = page.locator(".product-card");
    await expect(card).toContainText("Low stock: 3");
    await expect(card).toContainText("₺39.90");

    // Editing keeps working, and the title follows the language.
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("#form-title")).toHaveText("Edit Product");
    await page.locator("#app-view").getByRole("button", { name: "TR" }).click();
    await expect(page.locator("#form-title")).toHaveText("Ürünü Düzenle");
    await expect(page.locator("#submit-label")).toHaveText("GÜNCELLE");
});

test("messages and toasts are in English too", async ({ page }) => {
    await signIn(page);
    await page.locator("#app-view").getByRole("button", { name: "EN" }).click();

    await fillProductForm(page, { name: "Old", price: 1, stockCount: 1, lastUseDate: "2026-10-01" });
    await page.getByRole("button", { name: "SAVE" }).click();
    await expect(page.locator("#form-error")).toHaveText("A product whose use-by date has passed cannot be added.");

    await page.locator("#lastUseDate").fill("2030-01-01");
    await page.getByRole("button", { name: "SAVE" }).click();
    await expect(page.locator(".app-toast")).toHaveText("Product saved.");

    page.once("dialog", (dialog) => {
        expect(dialog.message()).toBe("Do you want to delete this product?");
        void dialog.accept();
    });
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator(".app-toast").last()).toHaveText("Product deleted.");
});
