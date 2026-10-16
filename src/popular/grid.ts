// Mashiro's own results view: a header bar (status, progress, Stop/Refresh/
// Close) and one section per users入り bucket, each with a card grid. Cards
// are built by us — never cloned from Pixiv's React tree — so Pixiv's hashed
// class names cannot break the grid.

import { thumbnailAt, type WorkItem } from "../lib/api";
import { ICONS, clear, firstMatch, h, icon } from "../lib/dom";
import { t } from "../lib/i18n";
import { artworkHref, userHref, type SearchPage } from "../lib/pageType";
import type { Settings } from "../lib/settings";
import { bucketLabel, type Bucket } from "./buckets";
import { SECTION_ORDER, type CrawlProgress, type Section } from "./crawler";

export const ROOT_ID = "mashiro-results";
export const ACTIVE_BODY_CLASS = "mashiro-active";
const NATIVE_PAGER_CLASS = "mashiro-native-pagination";

const WORKS_CONTENT_SELECTORS = ['[data-ga4-label="works_content"]', 'section ul[role="list"]', 'ul[role="list"]'];

export interface GridCallbacks {
    onStop: () => void;
    onRefresh: () => void;
    onClose: () => void;
}

export class ResultsGrid {
    private root: HTMLElement | null = null;
    private sectionsHost: HTMLElement | null = null;
    private statusText: HTMLElement | null = null;
    private statusBar: HTMLElement | null = null;
    private countEl: HTMLElement | null = null;
    private stopButton: HTMLButtonElement | null = null;
    private refreshButton: HTMLButtonElement | null = null;
    private emptyEl: HTMLElement | null = null;
    private sections = new Map<Section, { wrapper: HTMLElement; grid: HTMLElement; count: HTMLElement }>();
    private page: SearchPage | null = null;
    private settings: Settings | null = null;
    private cards = 0;

    constructor(private readonly callbacks: GridCallbacks) {}

    get count(): number {
        return this.cards;
    }

    /** Create (or re-attach) the container next to Pixiv's works list. */
    mount(page: SearchPage, settings: Settings): void {
        this.page = page;
        this.settings = settings;
        if (!this.root) this.build();
        this.applyDisplaySettings(settings);
        this.place();
        this.markNativePagination();
    }

    /** Pixiv re-rendered? Make sure our root is still in the document. */
    ensurePlaced(): void {
        if (this.root && !this.root.isConnected) this.place();
        this.markNativePagination();
    }

    setActive(active: boolean): void {
        document.body.classList.toggle(ACTIVE_BODY_CLASS, active);
        this.root?.classList.toggle("is-active", active);
        if (active) this.root?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    }

    isActive(): boolean {
        return document.body.classList.contains(ACTIVE_BODY_CLASS);
    }

    clear(): void {
        if (this.sectionsHost) clear(this.sectionsHost);
        this.sections.clear();
        this.cards = 0;
        this.updateCount();
        this.setStatusText("");
        if (this.statusBar) this.statusBar.style.width = "0%";
        this.emptyEl?.classList.remove("is-visible");
    }

    applyDisplaySettings(settings: Settings): void {
        this.settings = settings;
        if (!this.root) return;
        this.root.dataset.cardSize = settings.cardSize;
        this.root.classList.toggle("hide-author", !settings.showAuthor);
        this.root.classList.toggle("hide-badge", !settings.showBucketBadge);
        this.root.classList.toggle("hide-headers", !settings.showBucketHeaders);
    }

    addWork(item: WorkItem, section: Section): void {
        if (!this.page || !this.settings) return;
        const target = this.section(section);
        target.grid.appendChild(this.card(item, section));
        this.cards++;
        target.count.textContent = String(target.grid.childElementCount);
        this.updateCount();
    }

    setProgress(progress: CrawlProgress): void {
        if (!this.root) return;
        const running = progress.phase === "buckets" || progress.phase === "alt" || progress.phase === "paused";
        this.root.classList.toggle("is-running", running);
        if (this.stopButton) this.stopButton.hidden = !running;
        if (this.refreshButton) this.refreshButton.hidden = running;

        let text = "";
        let ratio = 0;
        switch (progress.phase) {
            case "buckets":
                text = t("statusFetchingBucket", {
                    bucket: progress.currentBucket || "",
                    done: progress.bucketsDone + 1,
                    total: progress.bucketsTotal,
                    found: progress.found
                });
                ratio = progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
                break;
            case "alt":
                text = t("statusFetchingAlt", { found: progress.found });
                ratio = 0.9;
                break;
            case "paused":
                text = t("statusRateLimited", { s: Math.ceil((progress.retryInMs || 0) / 1000) });
                ratio = progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
                break;
            case "done":
                text = progress.found ? t("statusDone", { found: progress.found }) : t("statusEmpty");
                ratio = 1;
                break;
            case "stopped":
                text = t("statusStopped", { found: progress.found });
                ratio = progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
                break;
            case "error":
                text = progress.errorStatus === 403 ? t("statusForbidden")
                    : progress.errorStatus === null ? t("statusNetworkError")
                        : progress.error || t("stateError");
                ratio = 0;
                break;
            default:
                text = "";
        }
        if (progress.filtered && progress.phase !== "error") {
            text += ` · ${t("filteredOut", { n: progress.filtered })}`;
        }
        this.setStatusText(text);
        if (this.statusBar) this.statusBar.style.width = `${Math.round(ratio * 100)}%`;
        this.root.classList.toggle("is-error", progress.phase === "error");
        this.emptyEl?.classList.toggle("is-visible", progress.phase === "done" && progress.found === 0);
    }

    /** Re-translate static texts after a language change. */
    retranslate(): void {
        if (!this.root) return;
        this.root.querySelector(".mashiro-results-title")!.textContent = t("popular");
        this.stopButton?.setAttribute("title", t("stop"));
        this.refreshButton?.setAttribute("title", t("refresh"));
        this.root.querySelector<HTMLElement>(".mashiro-results-close")?.setAttribute("title", t("close"));
        if (this.emptyEl) this.emptyEl.textContent = t("statusEmpty");
        for (const [section, entry] of this.sections) {
            entry.wrapper.querySelector(".mashiro-section-title")!.textContent = this.sectionTitle(section);
        }
    }

    // ---- building ----------------------------------------------------------

    private build(): void {
        this.statusText = h("span", { class: "mashiro-results-status" });
        this.statusBar = h("span", { class: "mashiro-results-bar" });
        this.countEl = h("span", { class: "mashiro-results-count" });
        this.stopButton = h("button", {
            type: "button",
            class: "mashiro-icon-button",
            title: t("stop"),
            hidden: true,
            on: { click: () => this.callbacks.onStop() }
        }, icon(ICONS.stop));
        this.refreshButton = h("button", {
            type: "button",
            class: "mashiro-icon-button",
            title: t("refresh"),
            on: { click: () => this.callbacks.onRefresh() }
        }, icon(ICONS.refresh));
        const closeButton = h("button", {
            type: "button",
            class: "mashiro-icon-button mashiro-results-close",
            title: t("close"),
            on: { click: () => this.callbacks.onClose() }
        }, icon(ICONS.close));

        this.emptyEl = h("p", { class: "mashiro-results-empty" }, t("statusEmpty"));
        this.sectionsHost = h("div", { class: "mashiro-sections" });

        this.root = h("div", { id: ROOT_ID, class: "mashiro-root mashiro-results" },
            h("div", { class: "mashiro-results-head" },
                h("div", { class: "mashiro-results-headline" },
                    icon(ICONS.flame, 18, "mashiro-results-icon"),
                    h("span", { class: "mashiro-results-title" }, t("popular")),
                    this.countEl
                ),
                this.statusText,
                h("div", { class: "mashiro-results-actions" }, this.stopButton, this.refreshButton, closeButton),
                h("div", { class: "mashiro-results-track" }, this.statusBar)
            ),
            this.emptyEl,
            this.sectionsHost
        );
    }

    private place(): void {
        if (!this.root) return;
        const works = firstMatch<HTMLElement>(WORKS_CONTENT_SELECTORS);
        if (works?.parentNode) {
            // A sibling, never a child: React owns the works list subtree.
            if (works.nextElementSibling !== this.root) works.parentNode.insertBefore(this.root, works.nextSibling);
            if (works.getAttribute("data-ga4-label") !== "works_content") works.classList.add("mashiro-native-grid");
            return;
        }
        const main = document.querySelector("main") || document.body;
        if (main && this.root.parentNode !== main) main.appendChild(this.root);
    }

    private markNativePagination(): void {
        if (document.querySelector(`nav.${NATIVE_PAGER_CLASS}`)) return;
        for (const nav of document.querySelectorAll("nav")) {
            if (nav.closest(".mashiro-root")) continue;
            let pageLinks = 0;
            for (const link of nav.querySelectorAll<HTMLAnchorElement>("a[href]")) {
                try {
                    const url = new URL(link.href, location.href);
                    if (url.origin === location.origin && url.pathname === location.pathname && /^\d+$/.test(url.searchParams.get("p") || "")) {
                        pageLinks++;
                    }
                } catch {
                    /* ignore */
                }
            }
            if (pageLinks >= 2) {
                nav.classList.add(NATIVE_PAGER_CLASS);
                return;
            }
        }
    }

    private section(key: Section) {
        const existing = this.sections.get(key);
        if (existing) return existing;

        const count = h("span", { class: "mashiro-section-count" }, "0");
        const grid = h("div", { class: "mashiro-grid" });
        const wrapper = h("section", { class: "mashiro-section", dataset: { section: key } },
            h("h3", { class: "mashiro-section-head" },
                h("span", { class: `mashiro-bucket-pill ${key === "alt" ? "is-alt" : ""}` }, key === "alt" ? "★" : bucketLabel(key)),
                h("span", { class: "mashiro-section-title" }, this.sectionTitle(key)),
                count
            ),
            grid
        );

        // Keep sections in bucket order regardless of arrival order.
        const order = SECTION_ORDER.indexOf(key);
        let before: Element | null = null;
        for (const child of this.sectionsHost!.children) {
            const childKey = (child as HTMLElement).dataset.section as Section;
            if (SECTION_ORDER.indexOf(childKey) > order) {
                before = child;
                break;
            }
        }
        this.sectionsHost!.insertBefore(wrapper, before);

        const entry = { wrapper, grid, count };
        this.sections.set(key, entry);
        return entry;
    }

    private sectionTitle(key: Section): string {
        return key === "alt" ? t("bucketHeaderAlt") : t("bucketHeader", { label: key });
    }

    private card(item: WorkItem, section: Section): HTMLElement {
        const page = this.page!;
        const settings = this.settings!;
        const href = artworkHref(page, item.id);
        const target = settings.openInNewTab ? "_blank" : "_self";
        const rel = settings.openInNewTab ? "noopener" : "";
        const large = settings.cardSize === "large";

        const img = h("img", {
            class: "mashiro-card-img",
            src: large ? thumbnailAt(item.url, 540) : item.url,
            alt: item.alt || item.title || "",
            loading: "lazy",
            decoding: "async"
        });
        if (img.src !== item.url) {
            // If the larger variant is missing for some reason, fall back to the list thumbnail.
            img.addEventListener("error", () => { img.src = item.url; }, { once: true });
        }

        const thumb = h("a", { class: "mashiro-card-thumb", href, target, rel, dataset: { mashiroId: item.id } },
            img,
            item.xRestrict >= 1 ? h("span", { class: "mashiro-card-r18" }, item.xRestrict === 2 ? "R-18G" : "R-18") : null,
            item.illustType === 2 ? h("span", { class: "mashiro-card-ugoira" }, "▶") : null,
            (item.pageCount || 1) > 1 ? h("span", { class: "mashiro-card-pages", title: t("pages", { n: item.pageCount }) }, String(item.pageCount)) : null,
            section !== "alt" ? h("span", { class: "mashiro-card-bucket" }, bucketLabel(section as Bucket)) : null,
            item.aiType === 2 ? h("span", { class: "mashiro-card-ai" }, "AI") : null
        );

        const title = h("a", { class: "mashiro-card-title", href, target, rel, title: item.title || "" }, item.title || "");

        const author = h("a", { class: "mashiro-card-author", href: userHref(page, item.userId || ""), target, rel },
            item.profileImageUrl ? h("img", { class: "mashiro-card-avatar", src: item.profileImageUrl, alt: "", loading: "lazy" }) : null,
            h("span", null, item.userName || "")
        );

        return h("article", { class: "mashiro-card", dataset: { mashiroId: item.id, illustType: String(item.illustType) } }, thumb, title, author);
    }

    private updateCount(): void {
        if (this.countEl) this.countEl.textContent = this.cards ? String(this.cards) : "";
    }

    private setStatusText(text: string): void {
        if (this.statusText) this.statusText.textContent = text;
    }
}
