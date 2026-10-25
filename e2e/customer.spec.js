// The customer page that a QR code opens.

import { test, expect, NOW, clearData, addProduct, updateProductFields, removeProduct } from "./support.js";

test.beforeEach(async ({ page }) => {
    await clearData();
    await page.clock.setFixedTime(NOW); // 27 October 2026
});

const open = async (page, id) => {
    await page.goto(`/product/product.html?id=${id}`);
    await expect(page.locator("#product-card")).toBeVisible();
};

test("shows the product details", async ({ page }) => {
    const id = await addProduct({
        name: "Zeytinyağı 1L",
        price: 1234.5,
        description: "Sızma, soğuk sıkım",
        lastUseDate: "2030-05-05",
        stockCount: 20
    });
    await open(page, id);

    await expect(page.locator("#name")).toHaveText("Zeytinyağı 1L");
    await expect(page.locator("#category")).toHaveText("Yiyecek");
    await expect(page.locator("#price")).toContainText("1.234,50 ₺");
    await expect(page.locator("#price")).toContainText("Son Fiyat Güncelleme: 1 Ekim 2026");
    await expect(page.locator("#description")).toHaveText("Sızma, soğuk sıkım");
    await expect(page.locator("#stock")).toHaveText("STOKTA VAR");
    await expect(page.locator("#lastUseDate")).toContainText("Son Kullanma Tarihi");
    await expect(page.locator("#lastUseDate")).toContainText("5 Mayıs 2030");
    await expect(page).toHaveTitle("Zeytinyağı 1L | Ürün Detayı");
    await expect(page.getByText("Sürdürülebilirlik Fırsatı!")).toBeHidden();
});

test("shows low stock and out of stock", async ({ page }) => {
    const low = await addProduct({ stockCount: 3 });
    const out = await addProduct({ stockCount: 0 });

    await open(page, low);
    await expect(page.locator("#stock")).toHaveText("SON 3 ÜRÜN!");
    await open(page, out);
    await expect(page.locator("#stock")).toHaveText("TÜKENDİ");
});

test("counts the days to the expiry date", async ({ page }) => {
    await open(page, await addProduct({ lastUseDate: "2026-10-30" }));
    await expect(page.locator("#lastUseDate")).toContainText("3 Gün Kaldı");

    await open(page, await addProduct({ lastUseDate: "2026-10-27" }));
    await expect(page.locator("#lastUseDate")).toContainText("Bugün son gün");

    await open(page, await addProduct({ lastUseDate: "2026-10-20" }));
    await expect(page.locator("#lastUseDate")).toContainText("Tarihi Geçti");
});

test("offers the coupon for an SKT that is close", async ({ page }) => {
    await open(page, await addProduct({ price: 39.9, lastUseDate: "2026-10-28" }));

    await expect(page.getByText("Sürdürülebilirlik Fırsatı!")).toBeVisible();
    await expect(page.getByText("KAZAN20")).toBeVisible();
    await expect(page.getByText("%20 indirim")).toBeVisible();
    await expect(page.locator("#price")).toContainText("39,90 ₺"); // the old price, struck through
    await expect(page.locator("#price")).toContainText("31,92 ₺");
    await expect(page.getByText("Demo özelliği")).toBeVisible();
});

test("offers the coupon for a TETT that has passed", async ({ page }) => {
    await open(page, await addProduct({ dateType: "TETT", lastUseDate: "2026-10-01", price: 19.99 }));

    await expect(page.getByText("tavsiye edilen tüketim tarihi geçtiği için")).toBeVisible();
    await expect(page.locator("#lastUseDate")).toContainText("Tavsiye Edilen Tüketim Tarihi");
});

test("says so when there is no date, and shows an icon when there is no image", async ({ page }) => {
    await open(page, await addProduct({ lastUseDate: "", description: "", image: "" }));

    await expect(page.locator("#description")).toHaveText("Açıklama belirtilmedi.");
    await expect(page.locator("#lastUseDate")).toContainText("Belirtilmedi");
    await expect(page.locator("#image-placeholder")).toBeVisible();
    await expect(page.locator("#image")).toBeHidden();
});

test("shows the placeholder when the image cannot be loaded", async ({ page }) => {
    await page.route("**/missing-picture.png", (route) => route.abort());
    await open(page, await addProduct({ image: "http://127.0.0.1:5000/missing-picture.png" }));
    await expect(page.locator("#image-placeholder")).toBeVisible();
});

test("a long unbroken name does not widen the page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, await addProduct({ name: "A".repeat(70), description: "B".repeat(300) }));

    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
});

test("explains an unknown product", async ({ page }) => {
    await page.goto("/product/product.html?id=does-not-exist");
    await expect(page.getByRole("heading", { name: "Ürün Bulunamadı" })).toBeVisible();
});

test("an id that cannot be a product id is an unknown product, not a connection problem", async ({ page }) => {
    for (const id of ["a/b", "..%2F..%2Fadmin", "%00"]) {
        await page.goto(`/product/product.html?id=${id}`);
        await expect(page.getByRole("heading", { name: "Ürün Bulunamadı" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Bağlantı Sorunu" })).toBeHidden();
    }
});

test.describe("the animations of the low-stock badge and the coupon", () => {
    const animationOf = (page, selector) =>
        page.locator(selector).evaluate((element) => getComputedStyle(element).animationName);

    test("run for a visitor who has no preference", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await open(page, await addProduct({ stockCount: 3, lastUseDate: "2026-10-28" }));
        expect(await animationOf(page, "#stock")).toBe("pulse-animation");
        expect(await animationOf(page, "#coupon")).toBe("bounce");
    });

    test("do not run for a visitor who asked for less motion", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await open(page, await addProduct({ stockCount: 3, lastUseDate: "2026-10-28" }));
        expect(await animationOf(page, "#stock")).toBe("none");
        expect(await animationOf(page, "#coupon")).toBe("none");
    });
});

test("explains a connection problem and recovers with Try again", async ({ page }) => {
    const id = await addProduct({ name: "Bağlantı testi" });
    await page.route("**://127.0.0.1:8080/**", (route) => route.abort());
    await page.goto(`/product/product.html?id=${id}`);
    await expect(page.getByRole("heading", { name: "Bağlantı Sorunu" })).toBeVisible();

    await page.unroute("**://127.0.0.1:8080/**");
    await page.getByRole("button", { name: "Tekrar Dene" }).click();
    await expect(page.locator("#name")).toHaveText("Bağlantı testi");
});

test("never loads sign-in or file storage code (the customer page only reads)", async ({ page }) => {
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    await open(page, await addProduct());

    expect(requests.filter((url) => /firebase-auth|firebase-storage|:9099|:9199/.test(url))).toEqual([]);
});

test.describe("a page that stays open", () => {
    // what the browser does when a visitor comes back to the page (the tab, or the phone after the screen was locked)
    const comeBack = async (page, minutesLater) => {
        await page.clock.setFixedTime(new Date(NOW.getTime() + minutesLater * 60_000));
        await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    };

    test("shows a change made meanwhile when the visitor comes back", async ({ page }) => {
        const id = await addProduct({ price: 100, stockCount: 20 });
        await open(page, id);
        await expect(page.locator("#price")).toContainText("100,00 ₺");

        await updateProductFields(id, { price: 200, stockCount: 0 });
        await comeBack(page, 2);

        await expect(page.locator("#price")).toContainText("200,00 ₺");
        await expect(page.locator("#stock")).toHaveText("TÜKENDİ");
    });

    test("does not read the product again when the visitor comes back within a minute", async ({ page }) => {
        const id = await addProduct({ price: 100 });
        await open(page, id);

        await updateProductFields(id, { price: 200 });
        await comeBack(page, 0.5);
        await page.waitForTimeout(700);

        await expect(page.locator("#price")).toContainText("100,00 ₺");
    });

    test("says the product is gone when it was deleted meanwhile", async ({ page }) => {
        const id = await addProduct();
        await open(page, id);

        await removeProduct(id);
        await comeBack(page, 2);

        await expect(page.getByRole("heading", { name: "Ürün Bulunamadı" })).toBeVisible();
    });

    test("works out the days left and the coupon again at midnight", async ({ page }) => {
        await page.clock.setFixedTime(new Date("2026-10-27T23:59:59.500+03:00"));
        await open(page, await addProduct({ lastUseDate: "2026-10-27", price: 100 }));
        await expect(page.locator("#lastUseDate")).toContainText("Bugün son gün");
        await expect(page.getByText("Sürdürülebilirlik Fırsatı!")).toBeVisible();

        // midnight passes: the page notices a second after it
        await page.clock.setFixedTime(new Date("2026-10-28T00:00:30+03:00"));
        await expect(page.locator("#lastUseDate")).toContainText("Tarihi Geçti");
        await expect(page.getByText("Sürdürülebilirlik Fırsatı!")).toBeHidden();
    });
});

test("needs no sideways scrolling at 320 px with text twice as big", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await open(
        page,
        await addProduct({
            name: "A".repeat(70),
            price: 1000000,
            category: "Temizlik Malzemeleri",
            description: "B".repeat(300)
        })
    );
    await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
    });
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
});
