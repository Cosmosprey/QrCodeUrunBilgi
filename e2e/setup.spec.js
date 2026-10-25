// What a person sees when the Firebase configuration of the pages is wrong: a message, not a blank page.

import { test, expect } from "./support.js";

const serveConfig = (page, body, status = 200) =>
    page.route("**/shared/firebase-config.js", (route) =>
        route.fulfill({ status, contentType: "text/javascript", body })
    );

for (const [name, url] of [
    ["admin panel", "/admin/admin.html"],
    ["customer page", "/product/product.html?id=x"]
]) {
    test.describe(`the ${name}`, () => {
        // the page stops with an error on purpose
        test.use({ allowedPageErrors: [/firebase-config\.js/] });

        test("explains an empty apiKey (the example configuration ships it empty)", async ({ page }) => {
            await serveConfig(
                page,
                'export const firebaseConfig = { apiKey: "", projectId: "demo-qr-product-info" }; export const useEmulator = true;'
            );
            await page.goto(url);
            await expect(page.getByRole("alert")).toContainText('"apiKey" is empty');
            await expect(page.getByRole("alert")).toContainText('"fake"');
        });

        test("explains a missing configuration file", async ({ page }) => {
            await serveConfig(page, "not found", 404);
            await page.goto(url);
            await expect(page.getByRole("alert")).toContainText("shared/firebase-config.js not found");
        });
    });
}
