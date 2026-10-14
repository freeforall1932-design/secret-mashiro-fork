// The "Popular" toolbar button (plus an optional settings gear). Attached
// after Pixiv's sort chip; floats bottom-right when the chip cannot be found.

import { ICONS, firstMatch, h, icon } from "../lib/dom";
import { t } from "../lib/i18n";
import type { Availability } from "./crawler";

export const BUTTON_ID = "mashiro-popular";
export const PANEL_BUTTON_ID = "mashiro-panel-button";
const WRAPPER_ID = "mashiro-toolbar";

// 2026 Pixiv analytics anchor first, then semantic fallbacks.
const SORT_CHIP_SELECTORS = [
    '[data-ga4-label="order_filter_chip"]',
    'button[aria-label*="sort" i]',
    'button[aria-label*="並び"]',
    'button[aria-label*="排序"]'
];

export interface ButtonCallbacks {
    onPopular: () => void;
    onSettings: () => void;
}

export class PopularButton {
    private wrapper: HTMLElement | null = null;
    private button: HTMLButtonElement | null = null;
    private badge: HTMLElement | null = null;
    private gear: HTMLButtonElement | null = null;
    private availability: Availability = "unknown";
    private active = false;
    private busy = false;
    private isTopTab = false;

    constructor(private readonly callbacks: ButtonCallbacks) {}

    /** Insert or re-attach. Returns false when there is nowhere to put it yet. */
    ensure(showGear: boolean): boolean {
        if (!document.body) return false;
        if (!this.wrapper) this.build();
        const wrapper = this.wrapper!;
        if (this.gear) this.gear.hidden = !showGear;

        const chip = firstMatch<HTMLElement>(SORT_CHIP_SELECTORS);
        if (chip && !chip.closest(".mashiro-root")) {
            if (chip.nextElementSibling !== wrapper) chip.insertAdjacentElement("afterend", wrapper);
            wrapper.classList.remove("is-floating");
            return true;
        }
        if (!wrapper.isConnected || !wrapper.classList.contains("is-floating")) {
            wrapper.classList.add("is-floating");
            document.body.appendChild(wrapper);
        }
        return true;
    }

    remove(): void {
        this.wrapper?.remove();
    }

    setAvailability(value: Availability): void {
        this.availability = value;
        this.render();
    }

    setActive(active: boolean): void {
        this.active = active;
        this.render();
    }

    setBusy(busy: boolean): void {
        this.busy = busy;
        this.render();
    }

    setTopTab(isTop: boolean): void {
        this.isTopTab = isTop;
        this.render();
    }

    setCount(count: number): void {
        if (this.badge) this.badge.textContent = count ? String(count) : "";
    }

    retranslate(): void {
        if (this.button) this.button.firstChild!.textContent = t("popular");
        this.gear?.setAttribute("title", t("openSettings"));
        this.gear?.setAttribute("aria-label", t("openSettings"));
        this.render();
    }

    private build(): void {
        this.badge = h("span", { class: "mashiro-popular-count" });
        this.button = h("button", {
            type: "button",
            id: BUTTON_ID,
            class: "mashiro-chip mashiro-popular",
            on: {
                click: (ev) => {
                    ev.preventDefault();
                    this.callbacks.onPopular();
                }
            }
        }, t("popular"), this.badge, h("span", { class: "mashiro-spinner", attrs: { "aria-hidden": "true" } }));

        this.gear = h("button", {
            type: "button",
            id: PANEL_BUTTON_ID,
            class: "mashiro-chip mashiro-gear",
            title: t("openSettings"),
            attrs: { "aria-label": t("openSettings") },
            on: {
                click: (ev) => {
                    ev.preventDefault();
                    this.callbacks.onSettings();
                }
            }
        }, icon(ICONS.gear, 18));

        this.wrapper = h("span", { id: WRAPPER_ID, class: "mashiro-root mashiro-toolbar" }, this.button, this.gear);
        this.render();
    }

    private render(): void {
        const button = this.button;
        if (!button) return;
        button.classList.toggle("is-orange", this.availability === "orange");
        button.classList.toggle("is-blue", this.availability === "blue");
        button.classList.toggle("is-grey", this.availability === "grey");
        button.classList.toggle("is-probing", this.availability === "probing");
        button.classList.toggle("is-top", this.isTopTab);
        button.classList.toggle("is-active", this.active);
        button.classList.toggle("is-busy", this.busy);
        button.setAttribute("aria-pressed", this.active ? "true" : "false");
        // Grey = nothing to show; keep it clickable (a click re-probes) but flag it for AT.
        button.setAttribute("aria-disabled", this.availability === "grey" && !this.isTopTab ? "true" : "false");

        let title: string;
        if (this.isTopTab) title = t("popularTitleTop");
        else if (this.active) title = t("popularTitleActive");
        else if (this.availability === "orange") title = t("popularTitleOrange");
        else if (this.availability === "blue") title = t("popularTitleBlue");
        else if (this.availability === "grey") title = t("popularTitleGrey");
        else if (this.availability === "probing") title = t("popularTitleProbing");
        else title = t("popularTitleIdle");
        button.title = title;
    }
}
