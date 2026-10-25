// The edit mode of the product form and its protection against mix-ups.

import {
    test,
    expect,
    NOW,
    TINY_PNG,
    clearData,
    addProduct,
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
