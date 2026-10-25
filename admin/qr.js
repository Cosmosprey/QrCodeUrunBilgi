// Thin wrapper around the vendored easyqrcodejs library (see assets/js/vendor/README.md).

import QRCode from "../assets/js/vendor/easyqrcodejs.js";

export function generateQR(container, text) {
    container.replaceChildren(); // remove the previous code

    new QRCode(container, {
        text: text,
        width: 400, // big enough for a sharp print
        height: 400, // same as the width: the code stays square

        colorDark: "#000000", // the dark modules
        colorLight: "#ffffff", // the light modules

        correctLevel: QRCode.CorrectLevel.H, // H: recovers up to 30% damage; printed labels in a shop can get scratched, so the highest level is used
        quietZone: 20, // white border around the code; makes it easier to scan
        quietZoneColor: "#ffffff"
    });
}
