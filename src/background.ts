// Service worker. Content scripts are declared in the manifest, so there is
// nothing to inject here; the worker only wires the toolbar icon to the panel.

const PIXIV_SEARCH = /^https:\/\/www\.pixiv\.net\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:tags\/|search\b)/;

chrome.action.onClicked.addListener((tab) => {
    if (!tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "mashiro:togglePanel" }).catch(() => {
        // Not a Pixiv tab (or the content script is not there): open a search page instead.
        const url = tab.url && PIXIV_SEARCH.test(tab.url) ? tab.url : "https://www.pixiv.net/tags/%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB/illustrations";
        void chrome.tabs.create({ url });
    });
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("Mashiro installed — open a Pixiv tag search to use Popular mode.");
    }
});
