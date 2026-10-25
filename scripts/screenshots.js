// Takes the screenshots shown in the README (docs/screenshots/*.png).
// Usage: npm run screenshots   (it starts the emulators itself and needs Chromium: npx playwright install chromium)
//
// The pages run against the emulators with a few made-up products and the clock fixed to one day, so the pictures
// are the same every time. The product pictures are small drawings made here, so no photo rights are involved.

import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { prepareEmulatorConfig } from "./emulator-config.js";

const BASE = "http://127.0.0.1:5000";
const FIRESTORE = "http://127.0.0.1:8080/v1/projects/demo-qr-product-info/databases/(default)/documents";
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;
const NOW = new Date("2026-10-27T12:00:00+03:00");
const IMAGE_HOST = "https://demo-images.test"; // answered by the browser (see route below), never really contacted

// ---- the product drawings (no text, so no fonts are needed)
// They are wide (1400 x 600) with the product in the middle: the admin cards show the whole picture, the square picture on the
// customer page shows its middle.

const picture = (from, to, drawing) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 600">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="1400" height="600" fill="url(#bg)"/>
<g transform="translate(400 0)">
<ellipse cx="300" cy="500" rx="170" ry="22" fill="#000" opacity=".12"/>${drawing}</g></svg>`;

const DRAWINGS = {
    "olive-oil.svg": picture(
        "#fef9c3",
        "#d9f99d",
        `<rect x="272" y="130" width="56" height="120" rx="12" fill="#4b7a1f"/>
<rect x="230" y="230" width="140" height="262" rx="38" fill="#5b8c2a"/>
<rect x="264" y="98" width="72" height="44" rx="8" fill="#d4a017"/>
<rect x="246" y="300" width="108" height="128" rx="10" fill="#f8f1d8"/>
<ellipse cx="300" cy="352" rx="20" ry="28" fill="#6b8e23"/>
<path d="M300 322 q24 -22 40 -6 q-18 20 -40 6z" fill="#3f6212"/>
<rect x="244" y="256" width="14" height="200" rx="7" fill="#fff" opacity=".25"/>`
    ),
    "milk.svg": picture(
        "#dbeafe",
        "#bfdbfe",
        `<polygon points="210,222 300,150 390,222" fill="#eff6ff"/>
<polygon points="300,150 390,222 300,238" fill="#c7d9f5"/>
<rect x="210" y="222" width="180" height="270" fill="#fff"/>
<rect x="210" y="222" width="180" height="270" fill="none" stroke="#c7d9f5" stroke-width="4"/>
<rect x="236" y="298" width="128" height="128" rx="16" fill="#3b82f6"/>
<path d="M300 320 C270 362 270 398 300 398 C330 398 330 362 300 320Z" fill="#fff"/>
<rect x="210" y="456" width="180" height="36" fill="#3b82f6" opacity=".85"/>`
    ),
    "bread.svg": picture(
        "#ffedd5",
        "#fed7aa",
        `<ellipse cx="300" cy="372" rx="196" ry="112" fill="#c98a43"/>
<ellipse cx="300" cy="346" rx="184" ry="96" fill="#e3ab62"/>
<g stroke="#b97a35" stroke-width="16" stroke-linecap="round">
<line x1="226" y1="316" x2="262" y2="376"/><line x1="290" y1="304" x2="326" y2="364"/><line x1="354" y1="316" x2="390" y2="376"/></g>`
    ),
    "apple-juice.svg": picture(
        "#fee2e2",
        "#fecaca",
        `<polyline points="338,210 358,128 412,104" fill="none" stroke="#ef4444" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="210" y="204" width="180" height="288" rx="16" fill="#f59e0b"/>
<rect x="210" y="204" width="180" height="46" rx="16" fill="#d97706"/>
<circle cx="300" cy="378" r="58" fill="#ef4444"/>
<path d="M300 322 q-4 -22 8 -34" fill="none" stroke="#7c2d12" stroke-width="7" stroke-linecap="round"/>
<ellipse cx="322" cy="308" rx="24" ry="11" transform="rotate(-28 322 308)" fill="#16a34a"/>
<rect x="226" y="262" width="14" height="190" rx="7" fill="#fff" opacity=".25"/>`
    ),
    "dish-soap.svg": picture(
        "#ccfbf1",
        "#a7f3d0",
        `<rect x="276" y="206" width="48" height="60" fill="#0f766e"/>
<rect x="250" y="172" width="104" height="32" rx="12" fill="#0f766e"/>
<rect x="334" y="178" width="58" height="16" rx="8" fill="#0f766e"/>
<rect x="224" y="250" width="152" height="244" rx="44" fill="#14b8a6"/>
<rect x="246" y="322" width="108" height="108" rx="16" fill="#fff" opacity=".92"/>
<path d="M300 342 C278 372 278 398 300 398 C322 398 322 372 300 342Z" fill="#14b8a6"/>
<g fill="#fff" opacity=".7" stroke="#5eead4" stroke-width="3"><circle cx="170" cy="250" r="30"/><circle cx="440" cy="300" r="22"/><circle cx="420" cy="214" r="14"/></g>`
    )
};

// ---- the made-up products. Fixed ids so the list always has the same order.
// Names and descriptions are data that a shop enters in its own language, so every product has a Turkish and an
// English version: the English pictures use the English one, the Turkish picture the Turkish one.

const PRODUCTS = [
    {
        id: "1-olive-oil",
        price: 389.9,
        category: "Yiyecek",
        dateType: "SKT",
        lastUseDate: "2027-03-15",
        image: `${IMAGE_HOST}/olive-oil.svg`,
        stockCount: 24,
        priceLastUpdate: "2026-10-12",
        text: {
            tr: {
                name: "Zeytinyağı 1 L",
                description: "Soğuk sıkım, naturel sızma zeytinyağı. Serin ve karanlık yerde saklayın."
            },
            en: {
                name: "Olive Oil 1 L",
                description: "Cold-pressed extra virgin olive oil. Store in a cool, dark place."
            }
        }
    },
    {
        id: "2-milk",
        price: 39.9,
        category: "Yiyecek",
        dateType: "SKT",
        lastUseDate: "2026-10-29",
        image: `${IMAGE_HOST}/milk.svg`,
        stockCount: 7,
        priceLastUpdate: "2026-10-20",
        text: {
            tr: {
                name: "Tam Yağlı Süt 1 L",
                description: "Günlük süt, pastörize. Açıldıktan sonra buzdolabında 3 gün içinde tüketin."
            },
            en: {
                name: "Whole Milk 1 L",
                description: "Fresh pasteurised milk. Keep in the fridge and use within 3 days of opening."
            }
        }
    },
    {
        id: "3-bread",
        price: 12.5,
        category: "Yiyecek",
        dateType: "SKT",
        lastUseDate: "2026-10-28",
        image: `${IMAGE_HOST}/bread.svg`,
        stockCount: 0,
        priceLastUpdate: "2026-09-01",
        text: {
            tr: { name: "Taze Ekmek", description: "Taş fırında pişmiş köy ekmeği." },
            en: { name: "Fresh Bread", description: "Stone-baked village loaf." }
        }
    },
    {
        id: "4-apple-juice",
        price: 54,
        category: "İçecek",
        dateType: "TETT",
        lastUseDate: "2026-09-30",
        image: `${IMAGE_HOST}/apple-juice.svg`,
        stockCount: 40,
        priceLastUpdate: "2026-08-15",
        text: {
            tr: { name: "Elma Suyu 1 L", description: "%100 elma suyu, şeker ilavesiz." },
            en: { name: "Apple Juice 1 L", description: "100% apple juice, no added sugar." }
        }
    },
    {
        id: "5-dish-soap",
        price: 89.9,
        category: "Temizlik Malzemeleri",
        dateType: "SKT",
        lastUseDate: "2028-01-10",
        image: `${IMAGE_HOST}/dish-soap.svg`,
        stockCount: 15,
        priceLastUpdate: "2026-10-05",
        text: {
            tr: { name: "Sıvı Bulaşık Deterjanı", description: "Yağ çözücü formül, 750 ml." },
            en: { name: "Dish Soap", description: "Grease-cutting formula, 750 ml." }
        }
    }
];

// ---- the emulator database (the "Bearer owner" token lets a script bypass the security rules)

const wrap = (value) => {
    if (typeof value !== "number") return { stringValue: value };
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
};

async function write(path, data) {
    const fields = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, wrap(value)]));
    const response = await fetch(`${FIRESTORE}/${path}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
        body: JSON.stringify({ fields })
    });
    if (!response.ok) throw new Error(`Could not write ${path}: ${await response.text()}`);
}

// ---- the pictures

const imagesLoaded = (page, selector) =>
    page.waitForFunction(
        (css) => [...document.querySelectorAll(css)].every((image) => image.complete && image.naturalWidth > 0),
        selector
    );

async function settle(page) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
}

async function main() {
    const removeConfig = prepareEmulatorConfig();
    const browser = await chromium.launch();
    try {
        await import("./seed-emulator.js");
        await fetch("http://127.0.0.1:8080/emulator/v1/projects/demo-qr-product-info/databases/(default)/documents", {
            method: "DELETE"
        });
        const seedProducts = async (language) => {
            for (const { id, text, ...product } of PRODUCTS) {
                await write(`products/${id}`, { ...product, ...text[language] });
            }
        };
        await seedProducts("en");
        await write("settings/site", { siteUrl: "http://192.168.1.20:5000" });
        mkdirSync(OUT, { recursive: true });

        const shoot = async (page, name, options = {}) => {
            await settle(page);
            await page.screenshot({ path: `${OUT}${name}.png`, animations: "disabled", caret: "hide", ...options });
            console.log(`  ${name}.png`);
        };
        const newContext = async (viewport, extra = {}) => {
            const context = await browser.newContext({
                viewport,
                locale: "en-GB",
                timezoneId: "Europe/Istanbul",
                ...extra
            });
            await context.route(`${IMAGE_HOST}/**`, (route) => {
                const file = new URL(route.request().url()).pathname.slice(1);
                return route.fulfill({ contentType: "image/svg+xml", body: DRAWINGS[file] });
            });
            return context;
        };
        const pickLanguage = (page, code) => page.getByRole("button", { name: code, exact: true }).first().click();

        // Admin panel on a desktop screen, English
        let context = await newContext({ width: 1280, height: 800 });
        let page = await context.newPage();
        await page.clock.setFixedTime(NOW);
        await page.goto(`${BASE}/admin/admin.html`);
        await shoot(page, "admin-login");

        await page.locator("#login-username").fill("admin");
        await page.locator("#login-password").fill("admin123");
        await page.locator("#login-btn").click();
        await page.locator(".product-card").first().waitFor();
        await imagesLoaded(page, "img.product-img");
        await shoot(page, "admin-panel");

        await page
            .locator(".product-card", { hasText: "Whole Milk 1 L" })
            .getByRole("button", { name: "Show QR" })
            .click();
        await page.locator("#qrContainer canvas").waitFor();
        await shoot(page, "admin-qr");
        await context.close();

        // Admin panel on a phone, English
        context = await newContext(
            { width: 390, height: 844 },
            { deviceScaleFactor: 2, isMobile: true, hasTouch: true }
        );
        page = await context.newPage();
        await page.clock.setFixedTime(NOW);
        await page.goto(`${BASE}/admin/admin.html`);
        await page.locator("#login-username").fill("admin");
        await page.locator("#login-password").fill("admin123");
        await page.locator("#login-btn").click();
        await page.locator(".product-card").first().waitFor();
        await imagesLoaded(page, "img.product-img");
        await page.locator("#product-grid").scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, -16));
        await shoot(page, "admin-mobile");
        await context.close();

        // Customer page on a phone
        context = await newContext(
            { width: 390, height: 844 },
            { deviceScaleFactor: 2, isMobile: true, hasTouch: true }
        );
        page = await context.newPage();
        await page.clock.setFixedTime(NOW);
        const open = async (id) => {
            await page.goto(`${BASE}/product/product.html?id=${id}`);
            await page.locator("#product-card").waitFor();
            await imagesLoaded(page, "#image");
        };
        await open("1-olive-oil");
        await shoot(page, "customer-en", { fullPage: true });
        await open("2-milk");
        await shoot(page, "customer-discount-en", { fullPage: true });
        await open("4-apple-juice");
        await shoot(page, "customer-tett-en", { fullPage: true });

        // The Turkish picture: the same product as a Turkish shop would have entered it
        await seedProducts("tr");
        await open("2-milk");
        await pickLanguage(page, "TR");
        await shoot(page, "customer-discount-tr", { fullPage: true });
        await context.close();
    } finally {
        await browser.close();
        removeConfig();
    }
}

console.log("Taking the screenshots into docs/screenshots/:");
await main();
