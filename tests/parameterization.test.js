import test from "node:test";
import assert from "node:assert/strict";

import { extractParameters, normalizeParameterName, isSameTarget } from "../src/commands/extractor.js";
import { compileRecording } from "../src/commands/compiler.js";
import { resolveTemplateString, resolveValue } from "../src/commands/runner.js";

test("Smart parameter name normalization heuristics", () => {
    assert.equal(normalizeParameterName("Search for atta dal and more"), "query");
    assert.equal(normalizeParameterName("Enter delivery address"), "address");
    assert.equal(normalizeParameterName("Enter quantity"), "quantity");
    assert.equal(normalizeParameterName("Minimum rating"), "min_rating");
    assert.equal(normalizeParameterName("Filter by price (max)"), "max_price");
    assert.equal(normalizeParameterName("Enter your pincode"), "pincode");
});

test("Parameter extraction and default value consolidation from typed events", () => {
    const actions = [
        {
            type: "navigate",
            url: "https://github.com"
        },
        {
            type: "click",
            target: { selector: "button[aria-label='Search']" }
        },
        {
            type: "input",
            target: {
                placeholder: "Search or jump to...",
                value: "s",
                name: "q"
            }
        },
        {
            type: "input",
            target: {
                placeholder: "Search or jump to...",
                value: "sitecmd",
                name: "q"
            }
        },
        {
            type: "navigate",
            url: "https://github.com/search?q=sitecmd"
        }
    ];

    const recording = {
        site: "https://github.com",
        actions
    };

    const compiled = compileRecording(recording, { name: "github_search" });

    assert.equal(compiled.name, "github_search");
    assert.equal(compiled.site, "https://github.com");
    assert.equal(compiled.parameters.length, 1);
    assert.equal(compiled.parameters[0].name, "query");
    assert.equal(compiled.parameters[0].default, "sitecmd");

    // Steps check
    assert.equal(compiled.steps.length, 4);
    assert.equal(compiled.steps[0].action, "navigate");
    assert.equal(compiled.steps[0].url, "https://github.com");
    assert.equal(compiled.steps[1].action, "click");
    assert.equal(compiled.steps[2].action, "input");
    assert.equal(compiled.steps[2].value, "{{query}}");
    assert.equal(compiled.steps[3].action, "navigate");
    assert.equal(compiled.steps[3].url, "https://github.com/search?q={{query}}");
});

test("Disambiguating parameters for different target elements", () => {
    const actions = [
        {
            type: "input",
            target: { placeholder: "Search products", value: "laptop", name: "search1" }
        },
        {
            type: "input",
            target: { placeholder: "Search users", value: "john", name: "search2" }
        }
    ];

    const { parameters } = extractParameters(actions);
    assert.equal(parameters.length, 2);
    assert.equal(parameters[0].name, "query");
    assert.equal(parameters[0].default, "laptop");
    assert.equal(parameters[1].name, "query_2");
    assert.equal(parameters[1].default, "john");
});

test("Runner parameter resolution in template strings and values", () => {
    const cmdParams = [{ name: "query", default: "sitecmd" }];
    const runParams = { query: "playwright" };

    const resolvedUrl = resolveTemplateString("https://site.com/search?q={{query}}", runParams, cmdParams);
    assert.equal(resolvedUrl, "https://site.com/search?q=playwright");

    const resolvedDefaultUrl = resolveTemplateString("https://site.com/search?q={{query}}", {}, cmdParams);
    assert.equal(resolvedDefaultUrl, "https://site.com/search?q=sitecmd");

    const resolvedVal = resolveValue("{{query}}", runParams, cmdParams);
    assert.equal(resolvedVal, "playwright");
});
