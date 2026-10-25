// The admin panel: signing in, adding, editing, searching and deleting products.

import { test, expect, NOW, clearData, addProduct, storedProducts, signIn, fillProductForm } from "./support.js";

test.beforeEach(async ({ page }) => {
    await clearData();
    await page.clock.setFixedTime(NOW);
});

test.describe("signing in", () => {
    test("a wrong password shows an error and keeps the login screen", async ({ page }) => {
        await page.goto("/admin/admin.html");
        await page.locator("#login-username").fill("admin");
        await page.locator("#login-password").fill("wrong-password");
        await page.locator("#login-btn").click();

        await expect(page.getByRole("alert")).toHaveText("Kullanıcı adı veya parola hatalı.");
        await expect(page.locator("#login-view")).toBeVisible();
        await expect(page.locator("#app-view")).toBeHidden();
    });

    test("the panel is hidden until someone signs in, and signing out hides it again", async ({ page }) => {
        await page.goto("/admin/admin.html");
        await expect(page.locator("#login-view")).toBeVisible();
        await expect(page.locator("#app-view")).toBeHidden();

        await signIn(page);
        await expect(page.locator("#login-view")).toBeHidden();

        await page.locator("#logout-btn").click();
        await expect(page.locator("#login-view")).toBeVisible();
        await expect(page.locator("#login-password")).toHaveValue("");
    });

    test("the session survives a reload", async ({ page }) => {
        await signIn(page);
        await page.reload();
        await expect(page.locator("#app-view")).toBeVisible();
    });
});

test.describe("the product list", () => {
    test("says so when there are no products yet", async ({ page }) => {
        await signIn(page);
        await expect(page.getByText("Henüz ürün yok.")).toBeVisible();
    });

    test("shows a card per product with price and stock", async ({ page }) => {
        await addProduct({ name: "Süt 1L", price: 1234.5, stockCount: 3 });
        await signIn(page);

        const card = page.locator(".product-card", { hasText: "Süt 1L" });
        await expect(card).toContainText("1.234,50 ₺");
        await expect(card).toContainText("Kritik Stok: 3");
    });

    test("searches by name, ignoring case the Turkish way", async ({ page }) => {
        await addProduct({ name: "Işık lambası" });
        await addProduct({ name: "Süt 1L" });
        await signIn(page);
        await expect(page.locator(".product-card")).toHaveCount(2);

        await page.locator("#search-input").fill("ışık");
        await expect(page.locator(".product-card")).toHaveCount(1);
        await expect(page.locator(".product-card")).toContainText("Işık lambası");

        await page.locator("#search-input").fill("yok böyle bir ürün");
        await expect(page.getByText("Aramanızla eşleşen ürün bulunamadı.")).toBeVisible();
    });

    test("shows four products per page and pages with the arrows", async ({ page }) => {
        for (let i = 1; i <= 5; i++) await addProduct({ name: `Ürün ${i}` });
        await signIn(page);

        await expect(page.locator(".product-card")).toHaveCount(4);
        await expect(page.locator("#prevBtn")).toBeDisabled();
        await page.locator("#nextBtn").click();
        await expect(page.locator(".product-card")).toHaveCount(1);
        await expect(page.locator("#nextBtn")).toBeDisabled();
    });
});

test.describe("adding a product", () => {
    test("saves it, shows a toast and clears the form", async ({ page }) => {
        await signIn(page);
        await fillProductForm(page, { name: "Yeni ürün", price: 12.5, stockCount: 7, lastUseDate: "2030-05-05" });
        await page.locator("#category").selectOption("İçecek");
        await page.getByRole("button", { name: "KAYDET" }).click();

        await expect(page.locator(".app-toast")).toHaveText("Ürün kaydedildi.");
        await expect(page.locator(".product-card", { hasText: "Yeni ürün" })).toBeVisible();
        await expect(page.locator("#name")).toHaveValue("");

        const [stored] = await storedProducts();
        expect(stored).toMatchObject({
            name: "Yeni ürün",
            price: 12.5,
            stockCount: 7,
            category: "İçecek",
            dateType: "SKT",
            lastUseDate: "2030-05-05",
            priceLastUpdate: "2026-10-27" // the day the price was set
        });
    });

    test("rejects a new SKT product whose date has passed", async ({ page }) => {
        await signIn(page);
        await fillProductForm(page, { name: "Bayat", price: 5, stockCount: 1, lastUseDate: "2026-10-01" });
        await page.getByRole("button", { name: "KAYDET" }).click();

        await expect(page.locator("#form-error")).toContainText("Son kullanma tarihi geçmiş");
        expect(await storedProducts()).toHaveLength(0);
    });

    test("accepts a new TETT product whose date has passed (the discount is the point)", async ({ page }) => {
        await signIn(page);
        await fillProductForm(page, { name: "Eski TETT", price: 5, stockCount: 1, lastUseDate: "2026-10-01" });
        await page.getByRole("radio", { name: "TETT" }).check();
        await page.getByRole("button", { name: "KAYDET" }).click();

        await expect(page.locator(".app-toast")).toHaveText("Ürün kaydedildi.");
    });

    test("rejects a file that is not a picture", async ({ page }) => {
        await signIn(page);
        await fillProductForm(page, { name: "Resimsiz", price: 5, stockCount: 1 });
        await page
            .locator("#imageFile")
            .setInputFiles({ name: "not-a-picture.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
        await page.getByRole("button", { name: "KAYDET" }).click();

        await expect(page.locator("#form-error")).toContainText("JPEG, PNG, WebP veya GIF");
        expect(await storedProducts()).toHaveLength(0);
    });
});

test.describe("editing a product", () => {
    test("puts the product in the form and saves the changes", async ({ page }) => {
        await addProduct({ name: "Eski ad", price: 10 });
        await signIn(page);

        await page.getByRole("button", { name: "Düzenle" }).click();
        await expect(page.locator("#form-title")).toHaveText("Ürünü Düzenle");
        await expect(page.locator("#name")).toHaveValue("Eski ad");

        await page.locator("#name").fill("Yeni ad");
        await page.locator("#price").fill("15");
        await page.getByRole("button", { name: "GÜNCELLE" }).click();

        await expect(page.locator(".app-toast")).toHaveText("Ürün güncellendi.");
        await expect(page.locator("#form-title")).toHaveText("Ürün Ekle");
        const [stored] = await storedProducts();
        expect(stored).toMatchObject({ name: "Yeni ad", price: 15 });
    });

    test("the price date only changes when the price changes", async ({ page }) => {
        await addProduct({ name: "Fiyat testi", price: 10, priceLastUpdate: "2026-10-01" });
        await signIn(page);

        // Only the name changes: the stored "price last updated" date stays.
        await page.getByRole("button", { name: "Düzenle" }).click();
        await page.locator("#name").fill("Fiyat testi 2");
        await page.getByRole("button", { name: "GÜNCELLE" }).click();
        await expect(page.locator(".app-toast")).toHaveText("Ürün güncellendi.");
        expect((await storedProducts())[0].priceLastUpdate).toBe("2026-10-01");

        // The price changes: the date becomes today.
        await page.getByRole("button", { name: "Düzenle" }).click();
        await page.locator("#price").fill("11");
        await page.getByRole("button", { name: "GÜNCELLE" }).click();
        await expect.poll(async () => (await storedProducts())[0].priceLastUpdate).toBe("2026-10-27");
    });
});

test.describe("deleting a product", () => {
    test("asks first, then removes the product", async ({ page }) => {
        await addProduct({ name: "Silinecek" });
        await signIn(page);

        page.once("dialog", (dialog) => dialog.dismiss());
        await page.getByRole("button", { name: "Sil" }).click();
        await expect(page.locator(".product-card")).toHaveCount(1);

        page.once("dialog", (dialog) => dialog.accept());
        await page.getByRole("button", { name: "Sil" }).click();
        await expect(page.locator(".app-toast")).toHaveText("Ürün silindi.");
        await expect(page.locator(".product-card")).toHaveCount(0);
        expect(await storedProducts()).toHaveLength(0);
    });
});
