// Background script. Chrome runs it as a service worker, Firefox as an event
// page (see the two manifests written by scripts/build.mjs). Content scripts
// are declared in the manifest, so there is nothing to inject here; this only
// wires the toolbar icon to the panel.

import { ext } from "./lib/ext";

const api = ext()!;
const PIXIV_SEARCH = /^https:\/\/www\.pixiv\.net\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:tags\/|search\b)/;
const DEFAULT_SEARCH = "https://www.pixiv.net/tags/%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB/illustrations";

api.action.onClicked.addListener((tab) => {
    if (!tab.id) return;
    Promise.resolve(api.tabs.sendMessage(tab.id, { type: "mashiro:togglePanel" })).catch(() => {
        // Not a Pixiv tab (or the content script is not there): open a search page instead.
        const url = tab.url && PIXIV_SEARCH.test(tab.url) ? tab.url : DEFAULT_SEARCH;
        void api.tabs.create({ url });
    });
});

api.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("Mashiro installed — open a Pixiv tag search to use Popular mode.");
    }
});
