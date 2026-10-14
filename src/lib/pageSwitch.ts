// Detect Pixiv's in-page (SPA) navigations. pageHook.ts re-broadcasts the
// page's pushState/replaceState as "mashiro:navigate"; popstate covers the
// back/forward buttons. A MutationObserver fallback catches anything else
// (e.g. if the main-world hook was blocked), comparing the URL on DOM churn.

import { Emitter } from "./events";

export class PageSwitch extends Emitter<{ switch: { url: string; previous: string } }> {
    private currentUrl = "";
    private observer: MutationObserver | null = null;
    private debounce: number | null = null;

    start(): void {
        this.currentUrl = this.normalize(location.href);
        const check = () => this.check();
        window.addEventListener("mashiro:navigate", check);
        window.addEventListener("popstate", check);
        window.addEventListener("hashchange", check);

        this.observer = new MutationObserver(() => {
            if (this.debounce !== null) return;
            this.debounce = window.setTimeout(() => {
                this.debounce = null;
                this.check();
            }, 200);
        });
        this.observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    /** Ignore the hash: Pixiv's manga viewer toggles "#1" without changing the page. */
    private normalize(url: string): string {
        return url.split("#")[0];
    }

    private check(): void {
        const url = this.normalize(location.href);
        if (url === this.currentUrl) return;
        const previous = this.currentUrl;
        this.currentUrl = url;
        this.emit("switch", { url, previous });
    }
}

export const pageSwitch = new PageSwitch();
