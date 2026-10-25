// The QR window: the code, the site address setting, download and keyboard behaviour.

import { test, expect, clearData, addProduct, signIn } from "./support.js";

let productId;

test.beforeEach(async ({ page }) => {
    await clearData();
    productId = await addProduct({ name: "Süt 1L", price: 39.9 });
    await signIn(page);
});

const openQr = async (page) => {
    await page.getByRole("button", { name: "QR Göster" }).click();
    await expect(page.locator("#qrContainer canvas")).toBeVisible();
};

test("shows the product, its price and the address the code points to", async ({ page }) => {
    await openQr(page);

    await expect(page.locator("#qrTitle")).toHaveText("Süt 1L");
    await expect(page.locator("#qrPrice")).toHaveText("39,90 ₺");
    // Without a saved address the address of the page itself is used.
    await expect(page.locator("#qrLink")).toHaveText(`http://127.0.0.1:5000/product/product.html?id=${productId}`);
});

test("warns while the address only works on this computer", async ({ page }) => {
    await openQr(page);
    await expect(page.locator("#qrWarning")).toContainText("yalnızca bu bilgisayarda çalışır");
});

test("saves a site address for every device and drops the warning", async ({ page }) => {
    await openQr(page);
    await page.locator("#qrSiteUrl").fill("http://192.168.1.20:5000/");
    await page.locator("#qrSiteSave").click();

    await expect(page.locator("#qrSiteMessage")).toHaveText("Adres kaydedildi.");
    await expect(page.locator("#qrLink")).toHaveText(`http://192.168.1.20:5000/product/product.html?id=${productId}`);
    await expect(page.locator("#qrWarning")).toBeHidden();

    // It is stored in Firestore, so it is still there after a reload.
    await page.reload();
    await openQr(page);
    await expect(page.locator("#qrSiteUrl")).toHaveValue("http://192.168.1.20:5000");
});

test("refuses addresses that are not http(s) web addresses", async ({ page }) => {
    await openQr(page);
    for (const bad of ["ftp://example.com", "http://user:pass@example.com", "http://example.com/?a=1", "not a url"]) {
        await page.locator("#qrSiteUrl").fill(bad);
        await page.locator("#qrSiteSave").click();
        await expect(page.locator("#qrSiteMessage")).toHaveClass(/text-danger/);
    }
});

test("downloads the code as a PNG named after the product", async ({ page }) => {
    await openQr(page);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#qrDownloadBtn").click()]);
    expect(download.suggestedFilename()).toBe("qr-sut-1l.png");
});

test("behaves like a dialog for the keyboard", async ({ page }) => {
    const opener = page.getByRole("button", { name: "QR Göster" });
    await opener.focus();
    await openQr(page);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeFocused();

    // Tab never leaves the window.
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");
        expect(await page.evaluate(() => document.activeElement.closest(".qr-modal-box") !== null)).toBe(true);
    }
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Shift+Tab");
        expect(await page.evaluate(() => document.activeElement.closest(".qr-modal-box") !== null)).toBe(true);
    }

    // The page behind is not reachable, Escape closes and focus returns to the button.
    await expect(page.locator("#app-view")).toHaveAttribute("inert", "");
    await page.keyboard.press("Escape");
    await expect(page.locator("#qrModal")).toBeHidden();
    await expect(page.locator("#app-view")).not.toHaveAttribute("inert", "");
    await expect(opener).toBeFocused();
});
