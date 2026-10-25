// The panel is also used from a phone at an address such as http://192.168.1.20:5000. That is not a "secure context",
// so some browser features do not exist there (for example crypto.randomUUID). The tests run at http://127.0.0.1,
// which the browser treats as secure, so the missing features are taken away here.

import { test, expect, NOW, TINY_PNG, clearData, storedProducts, signIn, fillProductForm } from "./support.js";

test("a product with a picture can be saved where crypto.randomUUID does not exist", async ({ page }) => {
    await clearData();
    await page.clock.setFixedTime(NOW);
    await page.addInitScript(() => {
        delete Crypto.prototype.randomUUID;
    });
    await signIn(page);
    expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe("undefined");

    await fillProductForm(page, { name: "Resimli", price: 5, stockCount: 1 });
    await page.locator("#imageFile").setInputFiles({ name: "x.png", mimeType: "image/png", buffer: TINY_PNG });
    await page.getByRole("button", { name: "KAYDET" }).click();

    await expect(page.locator(".app-toast")).toHaveText("Ürün kaydedildi.");
    const [stored] = await storedProducts();
    expect(stored.image).toMatch(/products%2F[0-9a-f]{32}\.png/);
});
