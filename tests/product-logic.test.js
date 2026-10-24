import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    toDateString,
    daysUntil,
    expiryStatus,
    stockStatus,
    discountFor,
    nextPriceUpdateDate,
    validateExpiryDate,
    formatPrice,
    formatDateTr
} from "../shared/product-logic.js";

// The date logic must give the same answers wherever the visitor is, so the date tests run in
// several time zones (UTC+14, UTC+3, UTC, UTC-7). `now` is always built from local components,
// so "25 Oct 15:00" means 15:00 on the wall clock of whichever zone is being tested.
const TIME_ZONES = ["Pacific/Kiritimati", "Europe/Istanbul", "UTC", "America/Los_Angeles"];

function inTimeZone(zone, fn) {
    const previous = process.env.TZ;
    process.env.TZ = zone;
    try {
        fn();
    } finally {
        if (previous === undefined) delete process.env.TZ;
        else process.env.TZ = previous;
    }
}

const at = (year, month, day, hour = 12, minute = 0, second = 0) =>
    new Date(year, month - 1, day, hour, minute, second);

describe("the time zone switch used by these tests actually works", () => {
    test("each zone has a different UTC offset", () => {
        const offsets = TIME_ZONES.map((zone) => {
            let offset;
            inTimeZone(zone, () => { offset = new Date(2026, 9, 25, 12).getTimezoneOffset(); });
            return offset;
        });
        assert.deepEqual(offsets, [-840, -180, 0, 420]);
    });
});

for (const zone of TIME_ZONES) {
    describe(`dates in ${zone}`, () => {
        const run = (name, fn) => test(name, () => inTimeZone(zone, fn));

        run("toDateString uses the local calendar date, not UTC", () => {
            assert.equal(toDateString(at(2026, 10, 25, 0, 30)), "2026-10-25");
            assert.equal(toDateString(at(2026, 10, 25, 23, 59, 59)), "2026-10-25");
            assert.equal(toDateString(at(2026, 1, 5, 9)), "2026-01-05");
        });

        run("expiry day is 0 days away at any time of day (never negative, never -0)", () => {
            for (const [h, m, s] of [[0, 0, 1], [1, 30, 0], [12, 0, 0], [15, 0, 0], [23, 59, 59]]) {
                const result = daysUntil("2026-10-25", at(2026, 10, 25, h, m, s));
                assert.ok(Object.is(result, 0), `${h}:${m}:${s} gave ${result}`);
            }
        });

        run("counts whole calendar days before and after", () => {
            const now = at(2026, 10, 25, 15);
            assert.equal(daysUntil("2026-10-26", now), 1);
            assert.equal(daysUntil("2026-10-28", now), 3);
            assert.equal(daysUntil("2026-10-24", now), -1);
            assert.equal(daysUntil("2026-10-25", at(2026, 10, 24, 23, 59, 59)), 1);
            assert.equal(daysUntil("2026-10-25", at(2026, 10, 26, 0, 0, 1)), -1);
        });

        run("works across month and year boundaries and daylight saving changes", () => {
            assert.equal(daysUntil("2027-01-01", at(2026, 12, 31, 20)), 1);
            assert.equal(daysUntil("2026-03-01", at(2026, 2, 28, 12)), 1);
            assert.equal(daysUntil("2028-03-01", at(2028, 2, 28, 12)), 2); // leap year
            assert.equal(daysUntil("2026-11-02", at(2026, 10, 31, 12)), 2); // US clocks go back on 1 Nov
            assert.equal(daysUntil("2026-03-30", at(2026, 3, 28, 12)), 2); // EU clocks go forward on 29 Mar
        });

        run("rejects anything that is not a real YYYY-MM-DD date", () => {
            const now = at(2026, 10, 25);
            for (const bad of ["", null, undefined, 20261025, "31/01/2030", "2026-1-5", "2026-02-30", "2027-02-29",
                "2026-13-01", "2026-00-10", "2026-10-25T10:00:00Z", " 2026-10-25"]) {
                assert.equal(daysUntil(bad, now), null, JSON.stringify(bad));
            }
            assert.equal(daysUntil("2028-02-29", now) !== null, true); // real leap day
        });

        run("expiryStatus names the four situations", () => {
            const now = at(2026, 10, 25, 15);
            assert.deepEqual(expiryStatus("2026-10-30", now), { state: "upcoming", daysLeft: 5 });
            assert.deepEqual(expiryStatus("2026-10-25", now), { state: "today", daysLeft: 0 });
            assert.deepEqual(expiryStatus("2026-10-24", now), { state: "expired", daysLeft: -1 });
            assert.deepEqual(expiryStatus("", now), { state: "none", daysLeft: null });
        });

        run("SKT discount: the last 3 days including the expiry day, never after", () => {
            const product = (date) => ({ price: 100, dateType: "SKT", lastUseDate: date });
            const now = at(2026, 10, 25, 15);
            assert.equal(discountFor(product("2026-10-29"), now).eligible, false); // 4 days left
            assert.equal(discountFor(product("2026-10-28"), now).eligible, true);  // 3 days left
            assert.equal(discountFor(product("2026-10-25"), now).eligible, true);  // last day
            assert.equal(discountFor(product("2026-10-24"), now).eligible, false); // expired
        });

        run("TETT discount: only once the recommended date has passed", () => {
            const product = (date) => ({ price: 100, dateType: "TETT", lastUseDate: date });
            const now = at(2026, 10, 25, 15);
            assert.equal(discountFor(product("2026-10-26"), now).eligible, false);
            assert.equal(discountFor(product("2026-10-25"), now).eligible, false);
            assert.equal(discountFor(product("2026-10-24"), now).eligible, true);
            assert.equal(discountFor(product("2020-01-01"), now).eligible, true);
        });

        run("validateExpiryDate", () => {
            const now = at(2026, 10, 25, 1, 30); // just after midnight: the old UTC code saw "yesterday"
            assert.equal(validateExpiryDate({ dateType: "SKT", dateString: "", isNewProduct: true }, now), null);
            assert.match(validateExpiryDate({ dateType: "SKT", dateString: "31/01/2030", isNewProduct: true }, now), /Geçerli/);
            assert.match(validateExpiryDate({ dateType: "SKT", dateString: "2026-10-24", isNewProduct: true }, now), /geçmiş/);
            assert.equal(validateExpiryDate({ dateType: "SKT", dateString: "2026-10-25", isNewProduct: true }, now), null);
            assert.equal(validateExpiryDate({ dateType: "TETT", dateString: "2020-01-01", isNewProduct: true }, now), null);
            assert.equal(validateExpiryDate({ dateType: "SKT", dateString: "2020-01-01", isNewProduct: false }, now), null);
        });

        run("formatDateTr does not shift the day", () => {
            assert.equal(formatDateTr("2026-10-25"), "25 Ekim 2026");
            assert.equal(formatDateTr("2026-01-01"), "1 Ocak 2026");
            assert.equal(formatDateTr("2026-12-31"), "31 Aralık 2026");
            assert.equal(formatDateTr("nope"), "Belirtilmedi");
            assert.equal(formatDateTr(""), "Belirtilmedi");
        });

        run("nextPriceUpdateDate stamps today only when the price is new or changed", () => {
            const now = at(2026, 10, 25, 1, 30);
            assert.equal(nextPriceUpdateDate({ previousPrice: 10, previousDate: "2026-09-01", newPrice: 10, now }), "2026-09-01");
            assert.equal(nextPriceUpdateDate({ previousPrice: 10, previousDate: "2026-09-01", newPrice: 12, now }), "2026-10-25");
            assert.equal(nextPriceUpdateDate({ previousPrice: undefined, previousDate: undefined, newPrice: 12, now }), "2026-10-25");
            assert.equal(nextPriceUpdateDate({ previousPrice: 10, previousDate: "garbage", newPrice: 10, now }), "2026-10-25");
            assert.equal(nextPriceUpdateDate({ previousPrice: 10, previousDate: "2026-09-01", newPrice: "10", now }), "2026-09-01");
        });
    });
}

describe("stockStatus", () => {
    test("ok above the limit, low from 1 to the limit, out at zero or less", () => {
        assert.deepEqual(stockStatus(11), { level: "ok", count: 11 });
        assert.deepEqual(stockStatus(10), { level: "low", count: 10 });
        assert.deepEqual(stockStatus(1), { level: "low", count: 1 });
        assert.deepEqual(stockStatus(0), { level: "out", count: 0 });
        assert.deepEqual(stockStatus(-3), { level: "out", count: 0 });
    });

    test("treats missing or non-numeric values as out of stock, and accepts numeric strings", () => {
        for (const bad of [undefined, null, "abc", NaN]) {
            assert.deepEqual(stockStatus(bad), { level: "out", count: 0 }, String(bad));
        }
        assert.deepEqual(stockStatus("12"), { level: "ok", count: 12 });
    });

    test("uses the configured limit when given one", () => {
        assert.equal(stockStatus(6, 5).level, "ok");
        assert.equal(stockStatus(5, 5).level, "low");
    });
});

describe("discountFor: amounts and edge cases", () => {
    const now = at(2026, 10, 25, 12);
    const expiringSoon = (price, extra = {}) => ({ price, dateType: "SKT", lastUseDate: "2026-10-26", ...extra });

    test("applies the configured rate and reports what the page needs to show", () => {
        assert.deepEqual(discountFor(expiringSoon(100), now), {
            eligible: true,
            originalPrice: 100,
            finalPrice: 80,
            ratePercent: 20,
            couponCode: "KAZAN20",
            dateType: "SKT"
        });
    });

    test("rounds to whole kuruş", () => {
        assert.equal(discountFor(expiringSoon(19.99), now).finalPrice, 15.99);
        assert.equal(discountFor(expiringSoon(39.9), now).finalPrice, 31.92);
        assert.equal(discountFor(expiringSoon(12.34), now).finalPrice, 9.87);
        assert.equal(discountFor(expiringSoon(0.01), now).finalPrice, 0.01);
    });

    test("old records without a dateType count as SKT", () => {
        assert.equal(discountFor({ price: 50, lastUseDate: "2026-10-26" }, now).dateType, "SKT");
    });

    test("no discount without a usable date or price", () => {
        assert.equal(discountFor(expiringSoon(100, { lastUseDate: "" }), now).eligible, false);
        assert.equal(discountFor(expiringSoon(100, { lastUseDate: undefined }), now).eligible, false);
        assert.equal(discountFor(expiringSoon(0), now).eligible, false);
        assert.equal(discountFor(expiringSoon(-5), now).eligible, false);
        assert.equal(discountFor(expiringSoon("<b>x</b>"), now).eligible, false);
        assert.equal(discountFor(undefined, now).eligible, false);
    });

    test("can be switched off and tuned in the config", () => {
        const config = { enabled: false, rate: 0.5, sktDaysBeforeExpiry: 10, couponCode: "HALF" };
        assert.equal(discountFor(expiringSoon(100), now, config).eligible, false);
        const tuned = discountFor(expiringSoon(100, { lastUseDate: "2026-11-03" }), now, { ...config, enabled: true });
        assert.deepEqual([tuned.eligible, tuned.finalPrice, tuned.ratePercent, tuned.couponCode], [true, 50, 50, "HALF"]);
    });
});

describe("formatPrice", () => {
    test("uses Turkish number formatting with two decimals", () => {
        assert.equal(formatPrice(39.9), "39,90 ₺");
        assert.equal(formatPrice(25), "25,00 ₺");
        assert.equal(formatPrice(1234.5), "1.234,50 ₺");
        assert.equal(formatPrice(0), "0,00 ₺");
        assert.equal(formatPrice("12.5"), "12,50 ₺");
    });

    test("shows a dash for anything that is not a number", () => {
        for (const bad of [undefined, null, "", "  ", false, "abc", NaN, "<img src=x onerror=alert(1)>"]) {
            assert.equal(formatPrice(bad), "—", String(bad));
        }
    });
});
