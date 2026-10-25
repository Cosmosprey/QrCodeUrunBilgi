// ESLint settings (flat config). Formatting is Prettier's job, so style rules are left out
// (eslint-config-prettier switches off anything that would fight with it).

import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

// The security principle of this project (see CLAUDE.md): data never goes through innerHTML.
// Build elements with shared/dom.js or set textContent instead.
const noHtmlInjection = [
    {
        selector: "AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]",
        message: "Do not assign HTML strings: use textContent or the el() helper from shared/dom.js."
    },
    {
        selector: "CallExpression[callee.property.name=/^(insertAdjacentHTML|write|writeln)$/]",
        message: "Do not inject HTML strings: use textContent or the el() helper from shared/dom.js."
    }
];

export default [
    { ignores: ["assets/**", "node_modules/**", "test-results/**", "playwright-report/**"] },
    js.configs.recommended,

    {
        rules: {
            eqeqeq: "error",
            "no-unused-vars": ["error", { ignoreRestSiblings: true }],
            "no-var": "error",
            "prefer-const": "error",
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-func": "error",
            "no-restricted-syntax": ["error", ...noHtmlInjection]
        }
    },

    // The pages (ES modules in the browser)
    {
        files: ["admin/**/*.js", "product/**/*.js", "shared/**/*.js"],
        languageOptions: { sourceType: "module", globals: globals.browser }
    },

    // Node: tests, scripts, end-to-end tests and the config files
    {
        files: ["tests/**/*.js", "scripts/**/*.js", "e2e/**/*.js", "*.js"],
        languageOptions: { sourceType: "module", globals: globals.node }
    },

    // The end-to-end tests also run code inside the page (page.evaluate)
    {
        files: ["e2e/**/*.js"],
        languageOptions: { globals: { ...globals.node, ...globals.browser } }
    },

    prettier
];
