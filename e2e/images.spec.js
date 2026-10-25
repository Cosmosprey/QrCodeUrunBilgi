// Photos are shrunk in the browser before they are uploaded.

import { test, expect, NOW, clearData, storedProducts, signIn, fillProductForm } from "./support.js";

test.beforeEach(async ({ page }) => {
    await clearData();
    await page.clock.setFixedTime(NOW);
    await signIn(page);
});

/** Draws a picture with some noise in the page (like a phone photo it does not compress well) and returns it as a Buffer. */
async function makePhoto(page, { width, height, type }) {
    const base64 = await page.evaluate(
        async ({ width, height, type }) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            const image = context.createImageData(width, height);
            let seed = 12345;
            const random = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
            for (let i = 0; i < image.data.length; i += 4) {
                const x = (i / 4) % width;
                const y = Math.floor(i / 4 / width);
                image.data[i] = 40 + (150 * x) / width + random() * 40;
                image.data[i + 1] = 90 + (100 * y) / height + random() * 40;
                image.data[i + 2] = 160 + random() * 40;
                image.data[i + 3] = 255;
            }
            context.putImageData(image, 0, 0);
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.95));
            const bytes = new Uint8Array(await blob.arrayBuffer());
            let binary = "";
            for (let i = 0; i < bytes.length; i += 0x8000)
                binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
            return btoa(binary);
        },
        { width, height, type }
    );
    return Buffer.from(base64, "base64");
}

test("a big photo is shrunk to 1200 px and stored as a small WebP", async ({ page }) => {
    const photo = await makePhoto(page, { width: 4000, height: 3000, type: "image/jpeg" });
    expect(photo.length).toBeGreaterThan(2 * 1024 * 1024); // too big for the 2 MB limit without shrinking

    await fillProductForm(page, { name: "Foto", price: 10, stockCount: 1 });
    await page.locator("#imageFile").setInputFiles({ name: "photo.jpg", mimeType: "image/jpeg", buffer: photo });
    await page.getByRole("button", { name: "KAYDET" }).click();

    await expect(page.locator(".app-toast")).toContainText("Görsel küçültüldü");

    const [stored] = await storedProducts();
    const info = await page.evaluate(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        return { type: blob.type, size: blob.size, width: bitmap.width, height: bitmap.height };
    }, stored.image);
    expect(info.type).toBe("image/webp");
    expect(info.width).toBe(1200);
    expect(info.height).toBe(900);
    expect(info.size).toBeLessThan(2 * 1024 * 1024);

    // The card shows it.
    await expect(page.locator(".product-card img.product-img")).toBeVisible();
});

test("a small picture is stored as it is", async ({ page }) => {
    const small = await makePhoto(page, { width: 200, height: 150, type: "image/png" });

    await fillProductForm(page, { name: "Küçük", price: 10, stockCount: 1 });
    await page.locator("#imageFile").setInputFiles({ name: "small.png", mimeType: "image/png", buffer: small });
    await page.getByRole("button", { name: "KAYDET" }).click();

    await expect(page.locator(".app-toast")).toHaveText("Ürün kaydedildi.");
    const [stored] = await storedProducts();
    const storedSize = await page.evaluate(async (url) => (await (await fetch(url)).blob()).size, stored.image);
    expect(storedSize).toBe(small.length);
});

test("a corrupt file is refused and nothing is saved", async ({ page }) => {
    await fillProductForm(page, { name: "Bozuk", price: 10, stockCount: 1 });
    await page.locator("#imageFile").setInputFiles({
        name: "broken.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.alloc(300 * 1024, 7) // big enough to be converted, but not a picture
    });
    await page.getByRole("button", { name: "KAYDET" }).click();

    await expect(page.locator("#form-error")).toContainText("Görsel okunamadı");
    expect(await storedProducts()).toHaveLength(0);
});
