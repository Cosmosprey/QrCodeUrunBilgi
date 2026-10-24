// Thin wrapper around the vendored easyqrcodejs library (see assets/js/vendor/README.md).

import QRCode from "../assets/js/vendor/easyqrcodejs.js";

export function generateQR(container, text) {
    container.innerHTML = ""; // eski QR temizle

    new QRCode(container, {
        text: text,
        width: 400, // QR kodun genişliği, çıktının net olması için yeterli boyutta seçildi
        height: 400, // QR kodun yüksekliği, genişlikle aynı yapılarak kare formda kalması sağlandı

        colorDark: "#000000", // QR kodun siyah kısımlarının rengi
        colorLight: "#ffffff", // QR kodun beyaz kısımlarının rengi

        correctLevel: QRCode.CorrectLevel.H, // H: %30'a kadar hata düzeltme,
        // Fiziksel mağazalarda kullanılacağından hasar görme ihtimali yüksek olabileceği için en yüksek düzeltme seviyesi seçildi
        quietZone: 20, // QR kodun etrafındaki beyaz boşluk. müşterilerin okunabilirliği artırır.
        quietZoneColor: "#ffffff",
    });
}