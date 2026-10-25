![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple?style=for-the-badge&logo=bootstrap)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Storage-orange?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/license-Apache%202.0-lightgrey?style=for-the-badge)

# QR E-Commerce


A QR code-based product information system developed as a web project.

The project allows an administrator to manage products through a web-based admin panel and provides a customer-facing product page that can be accessed directly through a QR code assigned to each product.

The main goal of the project is to provide quick access to dynamic product information while keeping the system simple, modular, and easy to use.

> **Note on Language:** While this repository and documentation are written in English, the application's user interface (UI)—including labels, buttons, stock status indicators, and date categories (SKT / TETT)—is fully presented in **Turkish** to align with its intended local market design.
---

## Features

### Admin Panel

The admin panel provides a single-page interface for managing products.

- Add new products
- Edit existing products
- Delete products
- Search products by name
- Paginate product cards
- Upload product images
- Display uploaded product images
- Generate QR codes for products, download them as PNG or print them
- Works on phones and tablets (the form moves above the list)
- Manage product categories
- Manage product prices
- Manage product descriptions
- Manage stock quantities
- Define expiry date information
- Select between SKT (Son Kullanma Tarihi) and TETT (Tavsiye Edilen Tüketim Tarihi)
- Display the last price update date
- Display stock status according to stock quantity

<p align="center">
<img width="%55" style="vertical-align: middle;margin-right: 10px;" alt="admin_panel" src="https://github.com/user-attachments/assets/99fa4e4d-1578-46c1-a848-77a5924aa067"/>
</p>

### Customer Product Page

The customer-facing page is designed to be accessed through a product-specific QR code.

The product ID is included in the URL and is used to retrieve the corresponding product information.

The page can display:

- Product image
- Product name
- Product price
- Product category
- Product description
- Current stock status
- Expiry date information
- SKT / TETT information
- Remaining days until the specified date
- Last price update date

The customer page is designed primarily for mobile use, since the main access method is scanning a QR code with a smartphone.

<p align="center">
  <img width="%25" style="vertical-align:middle;" alt="product_page" src="https://github.com/user-attachments/assets/1e3a552d-ca5d-4c4d-9d3a-a82087357f30" />
</p>

---

## Additional Product Features

The project includes several features designed to provide more meaningful information than a simple static product page.

### Stock Status

Stock quantity is stored as a numerical value and is converted into a visual status on both the admin and customer sides.

- **More than 10:** Stock available
- **1–10:** Critical stock
- **0:** Out of stock

The limit of 10 can be changed in `shared/store-config.js`.

The customer-facing page uses different visual indicators depending on the current stock level.

### SKT / TETT Support

Products can store either:

- **SKT** — Son Kullanma Tarihi
- **TETT** — Tavsiye Edilen Tüketim Tarihi

The customer page calculates the remaining time and presents the corresponding information dynamically.

Days are counted as whole calendar days in the visitor's local time, and the date itself is still valid: on the expiry day the page says "Bugün son gün" (last day), and from the next day "Tarihi Geçti" (expired). The result does not depend on the time of day or the time zone.

When adding a **new** product, an SKT date in the past is rejected (an expired product must not be put on sale), while a TETT date in the past is allowed, because the TETT discount is meant for exactly those products. Editing an existing product is never blocked by its date.

### Expiry-Based Discount

The customer page contains an additional demonstration feature based on the product's date information.

Depending on the selected date type and remaining time, eligible products can display a discounted price and a promotional coupon:

- **SKT:** during the last 3 days, including the expiry day. Expired SKT products get no discount.
- **TETT:** once the recommended date has passed.
- Products without a date get no discount.

The rate (20 %), the 3-day window, the coupon code (`KAZAN20`) and the on/off switch live in `shared/store-config.js`. Prices are rounded to whole kuruş.

This feature was implemented as a project-specific concept rather than as a complete real-world payment or coupon infrastructure.

### Price Update Information

The system stores the date on which the product price last **changed** and displays this information on the customer-facing page. Saving other fields (for example the stock) does not change it.

### QR Code Generation

Each product can have a QR code generated from its product-specific URL.

The generated URL follows the general structure:

`SITE_ADDRESS/product/product.html?id=PRODUCT_ID`

The QR window shows the product name, price and the code, and offers **PNG indir** (download the code as an image) and **Yazdır** (print: only the name, price, code and address are printed).

**Site address (local network and mobile testing):**  
`SITE_ADDRESS` is the address customers reach the pages at. It is set in the QR window itself ("Site adresi") and saved in Firestore (`settings/site`, readable and writable only by the admin), so it is the same on every device. Until one is saved, the address the admin page was opened from is used. When that is `localhost` or `127.0.0.1`, the window warns you: a smartphone cannot reach those addresses, so enter your computer's network address instead (e.g. `http://192.168.1.20:5000`) and press **Kaydet**. Existing QR codes already printed with another address keep pointing to it; only newly shown codes use the new one.

When the QR code is scanned, the product ID is read from the URL and the corresponding product information is loaded dynamically.

---

## Technologies

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap
- Bootstrap Icons

The project does not use a frontend framework such as React, Vue, or Angular.

The interface is built using standard HTML, CSS, and JavaScript to keep the project lightweight and straightforward.

### Backend / Data Layer

The project uses Firebase services for data storage and image storage.

- Firebase Firestore
- Firebase Storage

Firestore is used for product data, while Firebase Storage is used for product images.

There is no custom backend server or traditional SQL database in the current implementation.

### QR Code

- EasyQRCodeJS 4.6.2 (MIT), included in the repository under `assets/js/vendor/`, so no CDN is needed for QR codes

QR codes are generated dynamically from product-specific URLs.

---

## Project Structure

The project is separated into two main user-facing areas:

* `admin/` — Product management interface. `admin_script.js` only wires small modules together: `auth-ui.js` (login), `product-list.js` (cards, search, paging, delete), `product-form.js` (add / edit), `qr-modal.js` (QR window: address, download, print), `site-settings.js` (the saved site address), plus helpers for image upload and the pure list and QR logic.
* `product/` — Customer-facing product page

* `shared/` — Code used by both areas (Firebase initialisation and configuration, safe DOM helpers, the pure date / stock / discount logic and the store settings)

Shared frontend resources are stored under `assets/`: one stylesheet per page (`css/admin.css`, `css/product.css`) next to Bootstrap and Bootstrap Icons, and the QR library under `js/vendor/`.

Both pages carry a Content Security Policy (`<meta>` tag) that only allows scripts from the page's own files and `www.gstatic.com` (the Firebase SDK). The pages contain no inline scripts or event handlers.

---

## Firebase Setup

Firebase configuration is intentionally not included in this repository.

To use the project with Firebase, create your own Firebase project and configure Firestore and Firebase Storage.

Copy the example configuration file and fill it in:

```bash
cp shared/firebase-config.example.js shared/firebase-config.js
```

`shared/firebase-config.js` is git-ignored, so your project settings are never committed. It exports the standard Firebase configuration object:

```javascript
export const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};
```

Replace the empty values with the configuration values from your own Firebase project.

### Developing without a Firebase project

The Firebase Emulator Suite can stand in for a real project (requires Node.js 24.12 or newer, which is the current LTS line, and Java). The web pages themselves need no Node.js at all, only the emulators and the tests do:

```bash
npm install
npm run emulators
```

In `shared/firebase-config.js` set `projectId` to `demo-qr-product-info` and `useEmulator` to `true`. In a second terminal run `npm run seed`, which creates the development admin (username `admin`, password `admin123`). Then open `http://localhost:5000/admin/admin.html` and sign in. Emulator data is kept in memory and is lost when the emulators stop (run the seed command again after a restart).

### Tests

```bash
npm test
```

This starts the Firestore and Storage emulators and runs the security rules tests (who may read, write and upload what, and which invalid data is rejected) together with the unit tests in `tests/`. It needs Node.js 24.12 or newer and Java.

### Required Firebase Services

The current project uses:

* **Cloud Firestore** for product data
* **Cloud Storage** for product images
* **Authentication** (Email/Password provider) for the admin login

### Setting Up the Admin Account and Security Rules

Only one admin account may change data. Everyone else can only open a single product page.

1. In the Firebase Console, open **Authentication**, enable the **Email/Password** sign-in method and add a user. The admin panel asks for a *username*; it turns it into an e-mail address of the form `username@qr-admin.local`. So for the username `admin`, create the user `admin@qr-admin.local` with a password of your choice. (Password-reset e-mails therefore do not work; change the password in the console if needed.)
2. Copy that user's **User UID** from the Users table.
3. Replace `dev-admin-uid` with the UID in **both** `firestore.rules` and `storage.rules` (the `isAdmin()` function at the top).
4. Publish the rules: paste each file into the Rules tab of Firestore and Storage in the console, or run `npx firebase deploy --only firestore:rules,storage --project YOUR_PROJECT_ID` (requires `npm install` and `npx firebase login`).

Until step 3 is done, nobody is an admin and every write is denied. This is deliberate: Firebase assigns random UIDs, so nobody can sign up as `dev-admin-uid` on a real project.

What the rules enforce:

* Anyone may read a single product (this is what the QR code opens), but only the admin may list, create, change or delete products.
* A product must have exactly the fields in the table below, with sane types and sizes (name 2–70 characters, price above 0, whole-number stock, dates as `YYYY-MM-DD`, `SKT` or `TETT`, image URL starting with `http(s)://`).
* Only the admin may upload images; only JPEG, PNG, WebP and GIF up to 2 MB are accepted (SVG is rejected on purpose, it can carry scripts).
* The only other document is `settings/site` (the QR site address): the admin can read and write it, nobody else, and it must be an `http(s)://` address.

The application expects a Firestore collection named:

```text
products
```

Each document in the `products` collection strictly expects the following data types:

| Field Name | JavaScript Type | Firestore Type | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | `string` | Product name |
| `price` | `Number` | `int64 for integers`<br>`double for decimals` | Original price |
| `category` | `string` | `string` | Category name |
| `description` | `string` | `string` | Detailed product info |
| `dateType` | `string` | `string` | `"SKT"` or `"TETT"` |
| `lastUseDate` | `string` | `string` | Format: `YYYY-MM-DD` |
| `image` | `string` | `string` | Firebase Storage Image URL |
| `stockCount` | `Number` | `int64` | Inventory count |
| `priceLastUpdate` | `string` | `string` | Format: `YYYY-MM-DD` |

The exact document ID is generated by Firestore and is used as the product identifier in QR code URLs.

---

## Running the Project

The project is a client-side web application and does not require a custom backend server.

For local development, serve the project using a local web server rather than opening the HTML files directly.

For example, the project can be run using the Live Server extension in Visual Studio Code.

After configuring Firebase, open:

```text
admin/admin.html
```
to access the administration panel.

Customer product pages can be accessed using:

```text
product/product.html?id=PRODUCT_ID
```

---

## QR Code Workflow

The general workflow is:

```text
Admin creates product
        ↓
Product is stored in Firestore
        ↓
Firestore generates a document ID
        ↓
Product ID is added to the product URL
        ↓
QR code is generated from the URL
        ↓
Customer scans the QR code
        ↓
Product page reads the ID from the URL
        ↓
Product data is retrieved from Firestore
        ↓
Product information is displayed
```

This allows the QR code to point to a dynamic product record instead of containing the product information itself.

Therefore, changes made to a product can be reflected on the customer page without generating a completely new QR code, as long as the product document ID remains the same.

---

## Design Approach

The project uses separate visual structures for the administration and customer interfaces.

### Admin Interface

The admin panel is designed primarily for desktop use.

Its main design goal is to make product management possible from a single page.

The interface uses:

* Product cards
* Inline edit/delete actions
* A single product form for both adding and editing
* Search
* Pagination
* QR code generation

Instead of opening separate pages for every operation, the same interface is reused for product creation and editing.

### Customer Interface

The customer page is designed primarily for mobile devices.

The design focuses on:

* Clear product information
* Large product imagery
* Simple navigation
* Visible stock information
* Clear price presentation
* Expiry-date information
* QR-code-oriented access

---

## Security and Configuration

Firebase credentials are not included in this repository.

The repository contains a Firebase configuration template so that users can connect the application to their own Firebase project.

Access control is enforced by Firebase itself, not by the web pages: the admin panel requires a login, and the Firestore and Storage security rules (`firestore.rules`, `storage.rules`) only let the admin account change data. See *Setting Up the Admin Account and Security Rules* above. The pages never put product data into `innerHTML`; it is always inserted as plain text.

The Firebase web configuration (API key and project id) is not a secret by itself, because it is visible to every visitor. What protects the data is the login and the rules, so make sure the rules are published before exposing the project to a network you do not control.

The current repository is intended primarily as a project, demonstration, and development template.

---

## Current Project Status

The core functionality of the project has been implemented.

### Completed

* Admin product management
* Admin login (Firebase Authentication)
* Firestore and Storage security rules with data validation, covered by automated tests
* Product creation
* Product editing
* Product deletion
* Product search
* Product pagination
* Firebase Firestore integration
* Firebase Storage image upload
* Dynamic product page
* QR code generation
* QR download (PNG) and printing
* Configurable site address for QR codes, shared by all devices
* Product-specific QR URLs
* Numerical stock management
* Stock status visualization
* SKT / TETT support
* Expiry date calculation
* Price update date
* Expiry-based promotional logic
* Responsive customer interface (long names wrap, a missing image shows a placeholder)
* Responsive admin panel for phones and tablets
* Separate admin and customer page structures
* Local frontend assets (Bootstrap, Bootstrap Icons and the QR library are included; only the Firebase SDK is loaded from Google's CDN)

---

## Project Purpose

This project was developed as a practical web development project to explore:

* Client-side web development
* CRUD operations
* Cloud databases
* Cloud file storage
* Dynamic web pages
* QR code-based navigation
* Responsive UI design
* JavaScript module structure
* Performance optimization
* Basic security and deployment considerations

The project focuses on building a functional system with a simple architecture rather than introducing unnecessary backend complexity.

---

## AI Assistance

The first version of this project was written with help from a chat-based AI assistant. Later improvements (security, structure, tests and UI) are developed with Claude Code. Design decisions and code review remain with the project owner.

---

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
