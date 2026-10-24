# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A QR code based product information system. An admin manages products in a web panel and prints QR codes. Customers scan a QR code and see a mobile product page (price, stock, SKT/TETT expiry info, an optional expiry-based discount).

Hobby / portfolio project, meant to be downloaded and run on a local network by whoever sets it up with their own Firebase project. It is not deployed anywhere.

## Principles

- **Vanilla JS, no framework, no build step.** Plain ES modules served as static files. Do not introduce a bundler or a framework.
- **No runtime dependencies in `package.json`.** `package.json` only holds dev tooling (Firebase emulators, tests, lint).
- **Firebase** (Firestore, Storage, Authentication) is the only backend. No custom server.
- Keep the code simple and readable. Prefer small pure functions that can be unit tested over logic buried in DOM handlers.
- Security first: never inject data into `innerHTML` without escaping; prefer `textContent`. Validate in the Firestore/Storage rules, not only in the form.

## Languages

- User interface: **Turkish** (English is planned).
- Code, comments, commit messages, README, this file: **English**.
- The project owner chats in Turkish, so conversation with them is in Turkish.

## Git conventions

- Commit messages are in English, imperative mood, with a short summary line and a body that explains why.
- Do not add `Co-Authored-By`, `Assisted-by`, `Claude-Session` or any other attribution trailers, session links or "generated with" lines to commit messages or pull request descriptions. The use of Claude Code is disclosed in the README instead.
- Do not open a pull request unless the owner asks for one.

## Layout

```
admin/      admin panel (admin.html, admin_script.js, QR wrapper)
product/    customer-facing product page
shared/     code used by both pages (Firebase init, config)
assets/     vendored CSS/JS (Bootstrap, Bootstrap Icons)
```

`shared/firebase-config.js` is git-ignored. It is created by copying `shared/firebase-config.example.js`. Never commit real project settings.

## Commands

```bash
npm install            # dev tooling only (firebase-tools)
npm run emulators      # Firestore, Storage, Auth and a static server on http://localhost:5000
```

To develop without a real Firebase project, copy the example config, set `projectId` to `demo-qr-product-info` and `useEmulator = true`. Then open `http://localhost:5000/admin/admin.html`. Emulator data is in-memory and lost on restart.

## Environment caveat

In the Claude Code cloud sandbox, `www.gstatic.com` (Firebase SDK) and `cdn.jsdelivr.net` (QR library) are blocked by the network policy. The pages therefore cannot be exercised in a real browser there. Pure logic (date, stock, discount) and Firestore/Storage rules (via the emulator) can still be tested.

## Roadmap

Work proceeds phase by phase, one commit series per phase. Before each phase, describe what will be done and get the owner's approval. Decisions that change behavior or architecture are proposed to the owner first (recommendation + reason), never made silently.

- [x] **Phase 0 - Foundation:** `shared/` folder, config example, emulator setup, this file.
- [ ] **Phase 1 - Security:** username/password login (Firebase Auth, single admin), Firestore and Storage rules with validation, XSS fixes, upload limits.
- [ ] **Phase 2 - Correctness:** pure date/stock/discount functions with `node:test` tests, error handling, fix `priceLastUpdate` (only change when the price changes), discount settings in one config.
- [ ] **Phase 3 - Structure:** remove inline `onclick` handlers and `window.*` assignments, separate the customer page from admin code.
- [ ] **Phase 4 - UI:** responsive admin, QR download/print and a "site address" field (so QR codes work on a LAN), toasts and loading states, accessibility, image downscaling, TR/EN.
- [ ] **Phase 5 - Quality:** ESLint/Prettier, rules tests against the emulator, README and screenshots.

## Known issues being worked on

See the roadmap above. The most important ones: the admin panel has no authentication, product data is rendered through `innerHTML` unescaped, expiry date maths mixes UTC and local time, and `priceLastUpdate` changes on every save.
