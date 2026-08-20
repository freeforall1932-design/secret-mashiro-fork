// Inject Mashiro on Pixiv tag/search pages, including SPA URL changes.
// Re-injection is skipped when the same extension version is already running.

var PIXIV_SEARCH_URL = /^https:\/\/www\.pixiv\.net\/(?:[a-z]{2}\/)?(?:tags\/|search\b)/;
var injectingTabs = new Set();

function ensureMashiro(tabId) {
    if (injectingTabs.has(tabId)) return;
    injectingTabs.add(tabId);

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: function () {
            return {
                hasJquery: typeof jQuery !== "undefined",
                hasObserver: Boolean(window.__mashiroPageObserver),
                runtimeVersion: window.__mashiroRuntimeVersion || null
            };
        }
    }).then(function (results) {
        var state = results && results[0] && results[0].result;
        var currentVersion = chrome.runtime.getManifest().version;

        // Same version already booted: just resync with the current SPA view.
        if (state && state.hasObserver && state.runtimeVersion === currentVersion) {
            return chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: function () {
                    if (typeof window.__mashiroSync === "function") window.__mashiroSync();
                }
            });
        }

        var files = state && state.hasJquery
            ? ["./foreground.js"]
            : ["./jquery-3.6.0.min.js", "./foreground.js"];

        return chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ["./foreground_styles.css"]
        }).then(function () {
            return chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: files
            });
        });
    }).catch(function (err) {
        console.log("Mashiro:", err);
    }).finally(function () {
        injectingTabs.delete(tabId);
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var url = changeInfo.url || tab.url;
    if (!url || !PIXIV_SEARCH_URL.test(url)) return;

    var isComplete = changeInfo.status === "complete";
    var isSpaNavigation = Boolean(changeInfo.url) && tab.status === "complete";
    if (!isComplete && !isSpaNavigation) return;

    ensureMashiro(tabId);
});
