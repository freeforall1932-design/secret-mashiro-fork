// Content-script entry (isolated world). Declared statically in manifest.json
// for every pixiv.net page; it stays dormant until the URL is a tag search.

import { PageController, VERSION } from "./popular/controller";

declare global {
    interface Window {
        __mashiro?: { version: string };
    }
}

(() => {
    if (window.__mashiro) return; // already booted in this document
    window.__mashiro = { version: VERSION };

    const boot = () => {
        new PageController().boot().catch((err) => console.error("Mashiro: failed to start", err));
    };
    if (document.body) boot();
    else document.addEventListener("DOMContentLoaded", boot, { once: true });
})();
