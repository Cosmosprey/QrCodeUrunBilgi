import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { configProblem } from "../shared/config-check.js";

const filled = { apiKey: "fake", projectId: "demo-qr-product-info", appId: "" };

describe("configProblem", () => {
    test("accepts a configuration with an apiKey and a projectId (the other values may be anything)", () => {
        assert.equal(configProblem({ firebaseConfig: filled, useEmulator: true }), null);
        assert.equal(configProblem({ firebaseConfig: filled }), null);
    });

    test("an empty apiKey or projectId is reported by name (the example file ships them empty)", () => {
        assert.match(configProblem({ firebaseConfig: { ...filled, apiKey: "" } }), /"apiKey" is empty/);
        assert.match(configProblem({ firebaseConfig: { ...filled, projectId: "  " } }), /"projectId" is empty/);
        assert.match(configProblem({ firebaseConfig: { ...filled, apiKey: undefined } }), /"apiKey" is empty/);
    });

    test("the hint depends on whether the emulators are used", () => {
        assert.match(configProblem({ firebaseConfig: { ...filled, apiKey: "" }, useEmulator: true }), /"fake"/);
        assert.match(configProblem({ firebaseConfig: { ...filled, apiKey: "" } }), /settings of your Firebase project/);
    });

    test("a module without firebaseConfig is reported", () => {
        assert.match(configProblem({}), /must export firebaseConfig/);
        assert.match(configProblem(undefined), /must export firebaseConfig/);
        assert.match(configProblem({ firebaseConfig: "x" }), /must export firebaseConfig/);
    });
});
