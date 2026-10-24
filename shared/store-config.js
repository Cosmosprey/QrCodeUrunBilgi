// Store settings that change how the product page behaves. Not secret; edit freely.

export const storeConfig = {
    // Stock above this number shows "in stock"; between 1 and this number shows "critical stock".
    lowStockLimit: 10,

    // The date info box turns red when this many days or fewer are left.
    expiryWarningDays: 3,

    // Expiry-based discount (a demonstration feature: the price is only shown, there is no checkout).
    //  - SKT products get the discount during the last `sktDaysBeforeExpiry` days, expiry day included.
    //  - TETT products get the discount once the recommended date has passed.
    //  - Products without a date, or SKT products that are already expired, get no discount.
    discount: {
        enabled: true,
        rate: 0.2,               // 0.2 = 20 % off
        sktDaysBeforeExpiry: 3,
        couponCode: "KAZAN20"    // only displayed; nothing validates it
    }
};
