// Runs in the page's MAIN world (see manifest.json), not in the content-script
// isolated world. Pixiv's React router navigates with history.pushState /
// replaceState; those calls are invisible from the isolated world, so we wrap
// them here and re-broadcast each one as a DOM event, which crosses worlds.
//
// PixivBatchDownloader does the same with its listen_history_change.js.

export {};

declare global {
    interface History {
        __mashiroHooked?: boolean;
    }
}

(() => {
    const EVENT_NAME = "mashiro:navigate";
    const history = window.history;
    if (history.__mashiroHooked) return;
    history.__mashiroHooked = true;

    for (const type of ["pushState", "replaceState"] as const) {
        const original = history[type];
        history[type] = function (this: History, ...args: Parameters<History["pushState"]>) {
            const result = original.apply(this, args);
            window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type } }));
            return result;
        };
    }
})();
