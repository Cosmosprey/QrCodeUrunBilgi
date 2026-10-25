# Vendored libraries

## easyqrcodejs 4.6.2

- Source: <https://github.com/ushelp/EasyQRCodeJS> (npm package `easyqrcodejs`), MIT license, see `LICENSE-easyqrcodejs.txt`.
- `easyqrcodejs.js` is built from the package's main file, `dist/easy.qrcode.min.js`, with esbuild (the recipe is below): the library is wrapped as an ES module (`export default QRCode`). esbuild also re-formats the code, so the file is larger than the original (about 72 KB instead of 53 KB); the library code itself is the package's. The browser tests generate, download and print QR codes with it.
- It is kept in the repository so QR codes can be generated without a CDN: the version is fixed and it also works on networks where the CDN is blocked.

To rebuild or upgrade it (needs Node.js; do this in a temporary folder, not in the project):

```bash
npm install easyqrcodejs@VERSION esbuild
echo 'import QRCode from "easyqrcodejs"; export default QRCode;' > entry.js
npx esbuild entry.js --bundle --format=esm --platform=browser \
  --banner:js="/* easyqrcodejs VERSION (MIT, see LICENSE-easyqrcodejs.txt), wrapped as an ES module with esbuild. See README.md in this folder. */" \
  --outfile=easyqrcodejs.js
```

Then copy `easyqrcodejs.js` and the package's `LICENSE` file into this folder and update the version numbers above.
