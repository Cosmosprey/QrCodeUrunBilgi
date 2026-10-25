// The edit mode of the product form and its protection against mix-ups.

import {
    test,
    expect,
    NOW,
    TINY_PNG,
    clearData,
    addProduct,
    expectNoSidewaysScroll,
    removeProduct,
    storedProducts,
    signIn,
    fillProductForm
} from "./support.js";

test.beforeEach(async ({ page }) => {
    await clearData();
    await page.clock.setFixedTime(NOW);
});

const card = (page, name) => page.locator(".product-card", { hasText: name });

test("a picture that was picked earlier is not carried over to the product that is edited", async ({ page }) => {
    await addProduct({ name: "Alpha", image: "" });
    await addProduct({ name: "Beta", image: "" });
    await signIn(page);

    await page.locator("#imageFile").setInputFiles({ name: "x.png", mimeType: "image/png", buffer: TINY_PNG });
    await card(page, "Beta").getByRole("button", { name: "Düzenle" }).click();
    await expect(page.locator("#imageFile")).toHaveValue("");

    await page.getByRole("button", { name: "GÜNCELLE" }).click();
    await expect(page.locator(".app-toast")).toHaveText("Ürün güncellendi.");
    const beta = (await storedProducts()).find((product) => product.name === "Beta");
    expect(beta.image).toBe("");
});

test("editing is visible: the form comes into view, the name is focused, and Cancel leads back", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // a phone: the form is above the list
    for (const name of ["Bir", "İki", "Üç", "Dört"]) await addProduct({ name });
    await signIn(page);

    await page.locator(".product-card").last().scrollIntoViewIfNeeded();
    await expect(page.locator("#form-title")).not.toBeInViewport();

    await page.locator(".product-card").last().getByRole("button", { name: "Düzenle" }).click();
    await expect(page.locator("#form-title")).toBeInViewport();
    await expect(page.locator("#form-title")).toHaveText("Ürünü Düzenle");
    await expect(page.locator("#name")).toBeFocused();

    await page.getByRole("button", { name: "İPTAL" }).click();
    await expect(page.locator("#form-title")).toHaveText("Ürün Ekle");
    await expect(page.locator("#name")).toHaveValue("");
    await expect(page.getByRole("button", { name: "İPTAL" })).toBeHidden();
    await expect(page.getByRole("button", { name: "KAYDET" })).toBeVisible();
});

test("while a save is running, other products can neither be edited nor deleted", async ({ page }) => {
    const alpha = await addProduct({ name: "Alpha", price: 10, image: "" });
    const beta = await addProduct({ name: "Beta", price: 20, image: "" });
    await signIn(page);

    await card(page, "Alpha").getByRole("button", { name: "Düzenle" }).click();
    await page.locator("#imageFile").setInputFiles({ name: "x.png", mimeType: "image/png", buffer: TINY_PNG });

    // Hold the upload, so the save stays "running" while the other card is clicked
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    await page.route(/:9199\//, async (route) => {
        await gate;
        await route.continue();
    });
    const dialogs = [];
    page.on("dialog", (dialog) => {
        dialogs.push(dialog.message());
        void dialog.dismiss();
    });

    await page.getByRole("button", { name: "GÜNCELLE" }).click();
    await expect(page.locator("#submit-btn")).toBeDisabled();

    await card(page, "Beta").getByRole("button", { name: "Düzenle" }).click();
    await card(page, "Beta").getByRole("button", { name: "Sil" }).click();
    await expect(page.locator("#name")).toHaveValue("Alpha");
    expect(dialogs).toEqual([]); // not even the "delete?" question was asked

    release();
    await expect(page.locator(".app-toast")).toHaveText("Ürün güncellendi.");
    const stored = await storedProducts();
    expect(stored.find((product) => product.id === alpha).image).toMatch(/^http/);
    expect(stored.find((product) => product.id === beta)).toMatchObject({
        name: "Beta",
        price: 20,
        image: "",
        priceLastUpdate: "2026-10-01"
    });
});

test("deleting the product that is being edited leaves the edit mode", async ({ page }) => {
    await addProduct({ name: "Alpha" });
    await signIn(page);
    await card(page, "Alpha").getByRole("button", { name: "Düzenle" }).click();
    await expect(page.locator("#form-title")).toHaveText("Ürünü Düzenle");

    page.once("dialog", (dialog) => dialog.accept());
    await card(page, "Alpha").getByRole("button", { name: "Sil" }).click();
    await expect(page.locator(".app-toast")).toHaveText("Ürün silindi.");
    await expect(page.locator("#form-title")).toHaveText("Ürün Ekle");
    await expect(page.getByRole("button", { name: "İPTAL" })).toBeHidden();
});

test("a product with a category that is not in the list can still be edited", async ({ page }) => {
    await addProduct({ name: "Defter", category: "Kırtasiye" });
    await signIn(page);

    await card(page, "Defter").getByRole("button", { name: "Düzenle" }).click();
    await expect(page.locator("#category")).toHaveValue("Kırtasiye");
    await page.getByRole("button", { name: "GÜNCELLE" }).click();
    await expect(page.locator(".app-toast")).toHaveText("Ürün güncellendi.");
    expect((await storedProducts())[0].category).toBe("Kırtasiye");

    // the temporary option goes away with the edit mode
    await card(page, "Defter").getByRole("button", { name: "Düzenle" }).click();
    await page.getByRole("button", { name: "İPTAL" }).click();
    await expect(page.locator("#category option[data-extra]")).toHaveCount(0);
});

test.describe("text fields", () => {
    test("a name made of spaces is not accepted", async ({ page }) => {
        await signIn(page);
        await fillProductForm(page, { name: "     ", price: 5, stockCount: 1 });
        await page.getByRole("button", { name: "KAYDET" }).click();

        await expect(page.locator("#form-error")).toHaveText("Ürün adı 2 ile 70 karakter arasında olmalı.");
        expect(await storedProducts()).toHaveLength(0);
    });

    test("spaces around a name and a description are cut off", async ({ page }) => {
        await signIn(page);
        await fillProductForm(page, { name: "  Süt  ", price: 5, stockCount: 1, description: "  Taze  " });
        await page.getByRole("button", { name: "KAYDET" }).click();

        await expect(page.locator(".app-toast")).toHaveText("Ürün kaydedildi.");
        expect(await storedProducts()).toMatchObject([{ name: "Süt", description: "Taze" }]);
    });

    test("the browser knows the limits of the price and the stock", async ({ page }) => {
        await signIn(page);
        await expect(page.locator("#price")).toHaveAttribute("max", "1000000");
        await expect(page.locator("#stockCount")).toHaveAttribute("max", "1000000");
    });
});

test.describe("a product that was changed somewhere else", () => {
    test("is not overwritten by an edit that started from the old values", async ({ page, context }) => {
        await addProduct({ name: "Alpha", price: 10, stockCount: 20, priceLastUpdate: "2026-10-01" });
        await signIn(page);

        // a second tab (or device) of the same admin
        const other = await context.newPage();
        await other.clock.setFixedTime(NOW);
        await other.goto("/admin/admin.html");
        await expect(card(other, "Alpha")).toContainText("10,00 ₺");

        await card(page, "Alpha").getByRole("button", { name: "Düzenle" }).click();
        await page.locator("#price").fill("12");
        await page.getByRole("button", { name: "GÜNCELLE" }).click();
        await expect(page.locator(".app-toast")).toHaveText("Ürün güncellendi.");

        // the other tab still shows the old price and now only wants to change the stock
        await expect(card(other, "Alpha")).toContainText("10,00 ₺");
        await card(other, "Alpha").getByRole("button", { name: "Düzenle" }).click();
        await other.locator("#stockCount").fill("19");
        await other.getByRole("button", { name: "GÜNCELLE" }).click();

        await expect(other.locator("#form-error")).toHaveText(
            "Bu ürün başka bir yerde değiştirilmiş. Liste yenilendi: güncel değerlere bakıp tekrar düzenleyin."
        );
        await expect(card(other, "Alpha")).toContainText("12,00 ₺"); // the list shows what is stored now
        await expect(other.locator("#form-title")).toHaveText("Ürün Ekle");
        expect(await storedProducts()).toMatchObject([{ price: 12, stockCount: 20, priceLastUpdate: "2026-10-27" }]);

        // starting again from the stored values works, and the date of the price change stays
        await card(other, "Alpha").getByRole("button", { name: "Düzenle" }).click();
        await other.locator("#stockCount").fill("19");
        await other.getByRole("button", { name: "GÜNCELLE" }).click();
        await expect(other.locator(".app-toast")).toHaveText("Ürün güncellendi.");
        expect(await storedProducts()).toMatchObject([{ price: 12, stockCount: 19, priceLastUpdate: "2026-10-27" }]);
    });

    test("that was deleted says so, and the list is refreshed", async ({ page }) => {
        const id = await addProduct({ name: "Alpha" });
        await signIn(page);
        await card(page, "Alpha").getByRole("button", { name: "Düzenle" }).click();

        await removeProduct(id);
        await page.locator("#price").fill("12");
        await page.getByRole("button", { name: "GÜNCELLE" }).click();

        await expect(page.locator("#form-error")).toHaveText(
            "Bu ürün artık yok (başka bir yerde silinmiş). Liste yenilendi."
        );
        await expect(page.getByText("Henüz ürün yok.")).toBeVisible();
        expect(await storedProducts()).toHaveLength(0); // nothing was created again
    });

    test("leaves no picture behind that was uploaded for the refused save", async ({ page }) => {
        const id = await addProduct({ name: "Alpha", image: "" });
        await signIn(page);
        await card(page, "Alpha").getByRole("button", { name: "Düzenle" }).click();
        await page.locator("#imageFile").setInputFiles({ name: "x.png", mimeType: "image/png", buffer: TINY_PNG });
        const uploads = [];
        page.on("response", (response) => {
            if (response.request().method() === "POST" && /:9199\//.test(response.url())) uploads.push(response.url());
        });

        await removeProduct(id);
        await page.getByRole("button", { name: "GÜNCELLE" }).click();
        await expect(page.locator("#form-error")).toContainText("artık yok");

        // the picture was uploaded and then deleted again: its address no longer answers
        expect(uploads).toHaveLength(1);
        const upload = new URL(uploads[0]);
        const object = `${upload.origin}${upload.pathname}/${encodeURIComponent(upload.searchParams.get("name"))}`;
        await expect.poll(async () => (await fetch(`${object}?alt=media`)).status).toBe(404);
    });
});

test("needs no sideways scrolling at 320 px with text twice as big", async ({ page }) => {
    await addProduct({ name: "A".repeat(70), description: "B".repeat(300), category: "Temizlik Malzemeleri" });
    await page.setViewportSize({ width: 320, height: 568 });
    await signIn(page);
    await expect(page.locator(".product-card")).toHaveCount(1);
    await expectNoSidewaysScroll(page);
});
