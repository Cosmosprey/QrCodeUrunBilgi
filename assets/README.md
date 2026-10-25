# Third-party files in `assets/`

Nothing here is written for this project. The files are kept in the repository (not loaded from a CDN) so the pages
work without internet access to those hosts. The Firebase SDK is the one exception and is loaded from Google's CDN.

| Files | Library | Version | License | Source |
| :--- | :--- | :--- | :--- | :--- |
| `css/bootstrap.min.css`, `js/bootstrap.bundle.min.js` | Bootstrap | 5.3.8 | MIT, `licenses/LICENSE-bootstrap.txt` | npm package `bootstrap`, files from `dist/` |
| `css/bootstrap-icons.min.css`, `css/fonts/bootstrap-icons.woff`, `css/fonts/bootstrap-icons.woff2` | Bootstrap Icons | 1.13.2 | MIT, `licenses/LICENSE-bootstrap-icons.txt` | npm package `bootstrap-icons`, files from `font/` |
| `js/vendor/easyqrcodejs.js` | EasyQRCodeJS | 4.6.2 | MIT, `js/vendor/LICENSE-easyqrcodejs.txt` | npm package `easyqrcodejs`, see `js/vendor/README.md` |

The Bootstrap and Bootstrap Icons files are the unmodified files of the npm packages (checked byte for byte against
the packages). The two stylesheets of the pages, `css/admin.css` and `css/product.css`, are the project's own.

To update Bootstrap or Bootstrap Icons, install the new version of the package in a temporary folder, copy the same
files over the old ones, and change the version in this table, in the README's "Technologies" section and in the badge
at the top of the README.
