// Follow Pixiv's light/dark theme (or the user's override). Pixiv exposes the
// current theme in a hidden #gtm-var-theme-kind element ("default" | "dark");
// we also look at <html data-theme>, the body background and the OS setting.
// Mashiro UI reacts via the `mashiro-dark` class on <html>.

import { Emitter } from "./events";
import type { ThemeSetting } from "./settings";

export type ThemeName = "light" | "dark";

const FLAG_SELECTOR = "#gtm-var-theme-kind";
const DARK_CLASS = "mashiro-dark";

function luminanceOf(color: string): number | null {
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(color);
    if (!match) return null;
    if (match[4] !== undefined && Number(match[4]) === 0) return null;
    return 0.299 * Number(match[1]) + 0.587 * Number(match[2]) + 0.114 * Number(match[3]);
}

export class Theme extends Emitter<{ change: ThemeName }> {
    current: ThemeName = "light";
    private setting: ThemeSetting = "auto";
    private observer: MutationObserver | null = null;
    private media: MediaQueryList | null = null;

    start(setting: ThemeSetting): void {
        this.setting = setting;
        this.apply(this.detect());
        this.observe();
    }

    setSetting(setting: ThemeSetting): void {
        this.setting = setting;
        this.apply(this.detect());
    }

    detect(): ThemeName {
        if (this.setting !== "auto") return this.setting;

        const flag = document.querySelector(FLAG_SELECTOR)?.textContent?.trim().toLowerCase();
        if (flag === "dark") return "dark";
        if (flag === "default" || flag === "light") return "light";

        const htmlTheme = (document.documentElement.dataset.theme || "").toLowerCase();
        if (htmlTheme === "dark") return "dark";
        if (htmlTheme === "light") return "light";

        if (document.body) {
            const lum = luminanceOf(getComputedStyle(document.body).backgroundColor);
            if (lum !== null && lum <= 34) return "dark";
            if (lum !== null && lum >= 245) return "light";
        }

        return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    private apply(theme: ThemeName): void {
        document.documentElement.classList.toggle(DARK_CLASS, theme === "dark");
        if (theme !== this.current) {
            this.current = theme;
            this.emit("change", theme);
        }
    }

    private observe(): void {
        if (this.observer) return;
        const recheck = () => this.apply(this.detect());

        // <html>/<body> attribute changes (class, data-theme, inline style).
        this.observer = new MutationObserver(recheck);
        this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
        if (document.body) {
            this.observer.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
        }

        // Pixiv's theme flag element may appear after us; poll briefly, then watch its text.
        let attempts = 0;
        const findFlag = () => {
            const flag = document.querySelector(FLAG_SELECTOR);
            if (flag) {
                this.observer?.observe(flag, { characterData: true, childList: true, subtree: true });
                recheck();
                return;
            }
            if (attempts++ < 30) window.setTimeout(findFlag, 1000);
        };
        findFlag();

        this.media = window.matchMedia?.("(prefers-color-scheme: dark)") ?? null;
        this.media?.addEventListener?.("change", recheck);
    }
}

export const theme = new Theme();
