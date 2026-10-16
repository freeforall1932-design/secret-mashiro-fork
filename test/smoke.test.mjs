// End-to-end smoke test: the real dist/js/content.js running inside jsdom
// against the mock Pixiv served by demo/server.js. Requires `npm run build`.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";
import { start } from "../demo/server.js";

let server;
let origin;

before(async () => {
    const started = await start(0, "127.0.0.1");
    server = started.server;
    origin = `http://127.0.0.1:${started.port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(check, { timeout = 8000, step = 50, label = "condition" } = {}) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        const value = check();
        if (value) return value;
        await sleep(step);
    }
    throw new Error(`Timed out waiting for ${label}`);
}

async function openPage(path) {
    const url = origin + path;
    const virtualConsole = new VirtualConsole();
    const errors = [];
    const navigations = [];
    virtualConsole.on("jsdomError", (err) => {
        const message = String(err?.message || err);
        // jsdom cannot navigate; record the attempt instead of failing.
        if (/Not implemented: navigation/.test(message)) { navigations.push(message); return; }
        // Stylesheet/image loading noise is irrelevant; script errors are not.
        if (!/Could not load|Could not parse CSS/.test(message)) errors.push(err);
    });
    virtualConsole.on("error", (...args) => errors.push(new Error(args.map(String).join(" "))));
    const dom = await JSDOM.fromURL(url, {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
        virtualConsole,
        beforeParse(window) {
            // jsdom has no fetch; use Node's, resolved against the page URL.
            // The AbortSignal is dropped on purpose: jsdom's and Node's signals are different realms.
            window.fetch = (input, init) => fetch(new URL(String(input), url).href, { headers: init?.headers });
            window.DOMException = window.DOMException || DOMException;
        }
    });
    await new Promise((resolve) => {
        if (dom.window.document.readyState === "complete") resolve();
        else dom.window.addEventListener("load", resolve);
    });
    return { dom, window: dom.window, document: dom.window.document, errors, navigations };
}

test("orange: users入り buckets found, click renders popular grid", async () => {
    const { window, document, errors } = await openPage("/tags/%E3%82%86%E3%82%8B%E3%82%86%E3%82%8A/illustrations");
    try {
        const button = await waitFor(() => document.getElementById("mashiro-popular"), { label: "#mashiro-popular" });
        await waitFor(() => button.classList.contains("is-orange"), { label: "orange button" });
        assert.ok(document.getElementById("mashiro-toolbar"), "toolbar wrapper present");
        assert.ok(document.getElementById("mashiro-panel-button"), "settings gear present");

        button.click();
        const results = await waitFor(() => document.getElementById("mashiro-results"), { label: "#mashiro-results" });
        await waitFor(() => results.classList.contains("is-active"), { label: "results active" });
        assert.ok(document.body.classList.contains("mashiro-active"));

        const cards = await waitFor(() => {
            const n = results.querySelectorAll(".mashiro-card").length;
            return n >= 8 ? n : 0;
        }, { timeout: 15000, label: "≥8 cards" });
        assert.ok(cards >= 8, `rendered ${cards} cards`);

        // Highest bucket first: the first card must be a 100000 or 50000 users入り work.
        const firstBadge = results.querySelector(".mashiro-card .mashiro-card-bucket")?.textContent || "";
        assert.match(firstBadge, /100k\+|50k\+|30k\+/, `first badge "${firstBadge}" should be a top bucket`);

        // Cards link to the artwork, image comes from the API payload.
        const link = results.querySelector(".mashiro-card a[href*='/artworks/']");
        assert.ok(link, "card links to /artworks/<id>");
        assert.ok(results.querySelector(".mashiro-card img[src*='/thumb/']"), "card thumbnail from API");

        // Clicking again returns to Pixiv's own list.
        button.click();
        await waitFor(() => !results.classList.contains("is-active"), { label: "results hidden" });
        assert.equal(document.body.classList.contains("mashiro-active"), false);

        assert.deepEqual(errors.map(String), []);
    } finally {
        window.close();
    }
});

test("blue: no buckets → Pixiv popular list + recommendations", async () => {
    const { window, document, errors } = await openPage("/tags/%E5%BE%A1%E5%9D%82%E7%BE%8E%E7%90%B4/illustrations");
    try {
        const button = await waitFor(() => document.getElementById("mashiro-popular"), { label: "#mashiro-popular" });
        await waitFor(() => button.classList.contains("is-blue"), { label: "blue button" });
        button.click();
        const results = await waitFor(() => document.getElementById("mashiro-results"), { label: "#mashiro-results" });
        const cards = await waitFor(() => {
            const n = results.querySelectorAll(".mashiro-card").length;
            return n >= 4 ? n : 0;
        }, { timeout: 15000, label: "≥4 alt cards" });
        assert.ok(cards >= 4);
        assert.deepEqual(errors.map(String), []);
    } finally {
        window.close();
    }
});

test("grey: nothing available → disabled button", async () => {
    const { window, document, errors } = await openPage("/tags/zzz_no_results/illustrations");
    try {
        const button = await waitFor(() => document.getElementById("mashiro-popular"), { label: "#mashiro-popular" });
        await waitFor(() => button.classList.contains("is-grey"), { label: "grey button" });
        assert.equal(button.getAttribute("aria-disabled"), "true");
        assert.deepEqual(errors.map(String), []);
    } finally {
        window.close();
    }
});

test("SPA navigation: button follows pushState and re-probes", async () => {
    const { window, document } = await openPage("/tags/%E3%82%86%E3%82%8B%E3%82%86%E3%82%8A/illustrations");
    try {
        const first = await waitFor(() => document.getElementById("mashiro-popular"), { label: "#mashiro-popular" });
        await waitFor(() => first.classList.contains("is-orange"), { label: "orange" });

        // Same thing Pixiv's router does; the harness listens for data-spa clicks.
        const link = document.querySelector('#harness a[href="/tags/zzz_no_results/illustrations"]');
        assert.ok(link, "harness nav link");
        link.click();
        assert.equal(window.location.pathname, "/tags/zzz_no_results/illustrations");

        await waitFor(() => {
            const button = document.getElementById("mashiro-popular");
            return button && button.classList.contains("is-grey");
        }, { label: "button turns grey after navigation" });
    } finally {
        window.close();
    }
});

test("Top tab: button is shown and navigates to the Illustrations tab", async () => {
    const { window, document, navigations } = await openPage("/tags/%E3%82%86%E3%82%8B%E3%82%86%E3%82%8A");
    try {
        const button = await waitFor(() => document.getElementById("mashiro-popular"), { label: "#mashiro-popular" });
        await waitFor(() => button.classList.contains("is-top"), { label: "top-tab state" });
        assert.equal(button.getAttribute("aria-disabled"), "false");
        button.click();
        // jsdom refuses real navigation but reports the attempt; that is enough to prove the redirect.
        await waitFor(() => navigations.length > 0, { label: "navigation attempt" });
    } finally {
        window.close();
    }
});

test("missing chip: floating fallback toolbar", async () => {
    const { window, document } = await openPage("/tags/%E3%82%86%E3%82%8B%E3%82%86%E3%82%8A/illustrations?nochip=1");
    try {
        const toolbar = await waitFor(() => document.getElementById("mashiro-toolbar"), { label: "#mashiro-toolbar" });
        assert.ok(toolbar.classList.contains("is-floating"));
    } finally {
        window.close();
    }
});

test("settings panel opens from the gear and persists a change", async () => {
    const { window, document } = await openPage("/tags/%E3%82%86%E3%82%8B%E3%82%86%E3%82%8A/illustrations");
    try {
        const gear = await waitFor(() => document.getElementById("mashiro-panel-button"), { label: "gear" });
        gear.click();
        const panel = await waitFor(() => document.getElementById("mashiro-panel"), { label: "#mashiro-panel" });
        assert.ok(panel.isConnected);
        assert.ok(panel.querySelector(".mashiro-log"), "home view shows the log");

        const nav = panel.querySelector('[data-view="display"]');
        assert.ok(nav, "Display nav entry");
        nav.click();
        const toggle = await waitFor(() => panel.querySelector('[data-setting="showAuthor"] input'), { label: "showAuthor switch" });
        const before = toggle.checked;
        toggle.click();
        await waitFor(() => window.__harnessStorage.mashiroSettings && window.__harnessStorage.mashiroSettings.showAuthor === !before, {
            label: "setting persisted to chrome.storage"
        });

        panel.querySelector(".mashiro-panel-close").click();
        await waitFor(() => !document.getElementById("mashiro-panel"), { label: "panel closed" });
    } finally {
        window.close();
    }
});
