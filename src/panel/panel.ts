// The floating settings/status panel — same shape as PixivBatchDownloader's
// panel (header, left navigation, card sections) but built for Mashiro.

import { ICONS, clear, h, icon } from "../lib/dom";
import { assetUrl } from "../lib/ext";
import { t } from "../lib/i18n";
import { log, type LogEntry } from "../lib/log";
import type { PageInfo } from "../lib/pageType";
import { DEFAULT_SETTINGS, type SettingKey, type Settings, type SettingsStore } from "../lib/settings";
import { toast } from "../lib/toast";
import { BUCKETS, bucketLabel } from "../popular/buckets";
import { SECTION_ORDER, type Availability, type CrawlProgress, type PopularCrawler, type Section } from "../popular/crawler";
import { button, card, numberRow, selectRow, textRow, textareaRow, toggleRow, type Control } from "./controls";

export type PanelView = "home" | "crawl" | "filters" | "display" | "general" | "help";

export interface PanelHost {
    settings: SettingsStore;
    crawler: PopularCrawler;
    version: string;
    repoUrl: string;
    getPage(): PageInfo;
    start(): void;
    stop(): void;
    clearResults(): void;
}

const PANEL_ID = "mashiro-panel";

export class SettingsPanel {
    private root: HTMLElement | null = null;
    private content: HTMLElement | null = null;
    private navButtons = new Map<PanelView, HTMLButtonElement>();
    private view: PanelView = "home";
    private controls = new Map<SettingKey, Control<never>>();
    private unsubscribe: Array<() => void> = [];

    // Home view live elements
    private stateBadge: HTMLElement | null = null;
    private searchLine: HTMLElement | null = null;
    private availLine: HTMLElement | null = null;
    private progressBar: HTMLElement | null = null;
    private progressLabel: HTMLElement | null = null;
    private statFound: HTMLElement | null = null;
    private statFiltered: HTMLElement | null = null;
    private statRequests: HTMLElement | null = null;
    private perSection: HTMLElement | null = null;
    private logList: HTMLElement | null = null;
    private startButton: HTMLButtonElement | null = null;
    private stopButton: HTMLButtonElement | null = null;
    private onKeydown = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") this.close();
    };

    constructor(private readonly host: PanelHost) {}

    get isOpen(): boolean {
        return !!this.root?.isConnected;
    }

    open(view: PanelView = this.view): void {
        if (!this.root) this.build();
        document.body.appendChild(this.root!);
        this.show(view);
        document.addEventListener("keydown", this.onKeydown);
        this.refreshHome();
    }

    close(): void {
        this.root?.remove();
        document.removeEventListener("keydown", this.onKeydown);
    }

    toggle(): void {
        if (this.isOpen) this.close();
        else this.open();
    }

    /** Throw the DOM away (e.g. after a language change); reopen if it was open. */
    rebuild(): void {
        const wasOpen = this.isOpen;
        this.close();
        for (const off of this.unsubscribe) off();
        this.unsubscribe = [];
        this.controls.clear();
        this.root = null;
        if (wasOpen) this.open(this.view);
    }

    /** Called by the controller whenever page/availability/progress changes. */
    refreshHome(): void {
        if (!this.isOpen) return;
        const page = this.host.getPage();
        const progress = this.host.crawler.progress;
        const availability = this.host.crawler.availability;

        if (this.searchLine) {
            clear(this.searchLine);
            if (page.kind === "search") {
                this.searchLine.append(h("strong", null, `#${page.word}`), ` · ${page.tab}`);
            } else {
                this.searchLine.textContent = t("notSearchPage");
            }
        }
        if (this.availLine) {
            clear(this.availLine);
            this.availLine.append(h("span", { class: `mashiro-dot is-${availability}` }), this.availabilityText(availability));
        }
        if (this.stateBadge) {
            this.stateBadge.className = `mashiro-state is-${progress.phase}`;
            this.stateBadge.textContent = this.stateText(progress, availability);
        }
        const running = this.host.crawler.isRunning();
        if (this.startButton) this.startButton.disabled = running || page.kind !== "search";
        if (this.stopButton) this.stopButton.disabled = !running;

        const ratio = progress.phase === "done" ? 1 : progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
        if (this.progressBar) this.progressBar.style.width = `${Math.round(ratio * 100)}%`;
        if (this.progressLabel) {
            this.progressLabel.textContent = progress.bucketsTotal
                ? `${Math.min(progress.bucketsDone, progress.bucketsTotal)} / ${progress.bucketsTotal}`
                : "—";
        }
        if (this.statFound) this.statFound.textContent = String(progress.found);
        if (this.statFiltered) this.statFiltered.textContent = String(progress.filtered);
        if (this.statRequests) this.statRequests.textContent = String(progress.requests);
        if (this.perSection) {
            clear(this.perSection);
            for (const section of SECTION_ORDER) {
                const n = progress.perSection[section as Section];
                if (!n) continue;
                this.perSection.append(h("span", { class: `mashiro-bucket-pill ${section === "alt" ? "is-alt" : ""}` },
                    section === "alt" ? "★" : bucketLabel(section), h("b", null, String(n))));
            }
        }
    }

    // ---- building ----------------------------------------------------------

    private build(): void {
        const nav = h("nav", { class: "mashiro-panel-nav" });
        const items: Array<[PanelView, string, string]> = [
            ["home", ICONS.home, t("navHome")],
            ["crawl", ICONS.search, t("navCrawl")],
            ["filters", ICONS.filter, t("navFilters")],
            ["display", ICONS.display, t("navDisplay")],
            ["general", ICONS.general, t("navGeneral")],
            ["help", ICONS.help, t("navHelp")]
        ];
        for (const [view, iconPath, label] of items) {
            const btn = h("button", { type: "button", class: "mashiro-nav-item", dataset: { view }, on: { click: () => this.show(view) } }, icon(iconPath, 20), h("span", null, label));
            this.navButtons.set(view, btn);
            nav.appendChild(btn);
        }
        nav.appendChild(h("div", { class: "mashiro-panel-nav-foot" }, `v${this.host.version}`));

        this.content = h("div", { class: "mashiro-panel-content" });

        const logoSrc = assetUrl("images/mashiro.png");

        const windowEl = h("div", { class: "mashiro-panel-window", attrs: { role: "dialog", "aria-modal": "true", "aria-label": t("panelTitle") } },
            h("header", { class: "mashiro-panel-head" },
                logoSrc ? h("img", { class: "mashiro-panel-logo", src: logoSrc, alt: "" }) : icon(ICONS.flame, 28, "mashiro-panel-logo"),
                h("div", { class: "mashiro-panel-titles" },
                    h("h2", null, t("panelTitle")),
                    h("p", null, t("panelSubtitle"))
                ),
                h("a", { class: "mashiro-icon-button", href: this.host.repoUrl, target: "_blank", rel: "noopener", title: t("helpProject") }, icon(ICONS.external, 18)),
                h("button", { type: "button", class: "mashiro-icon-button mashiro-panel-close", title: t("close"), attrs: { "aria-label": t("close") }, on: { click: () => this.close() } }, icon(ICONS.close, 20))
            ),
            h("div", { class: "mashiro-panel-body" }, nav, this.content)
        );

        this.root = h("div", { id: PANEL_ID, class: "mashiro-root mashiro-panel" },
            h("div", { class: "mashiro-panel-scrim", on: { click: () => this.close() } }),
            windowEl
        );

        this.unsubscribe.push(
            this.host.settings.on("change", ({ key, value }) => {
                const control = this.controls.get(key) as Control<unknown> | undefined;
                control?.set(value);
            }),
            this.host.crawler.on("progress", () => this.refreshHome()),
            this.host.crawler.on("availability", () => this.refreshHome()),
            log.on("entry", (entry) => this.renderLogEntry(entry)),
            log.on("clear", () => this.logList && clear(this.logList))
        );
    }

    private show(view: PanelView): void {
        this.view = view;
        for (const [name, btn] of this.navButtons) btn.classList.toggle("is-active", name === view);
        if (!this.content) return;
        clear(this.content);
        switch (view) {
            case "home": this.content.appendChild(this.homeView()); this.refreshHome(); break;
            case "crawl": this.content.appendChild(this.crawlView()); break;
            case "filters": this.content.appendChild(this.filtersView()); break;
            case "display": this.content.appendChild(this.displayView()); break;
            case "general": this.content.appendChild(this.generalView()); break;
            case "help": this.content.appendChild(this.helpView()); break;
        }
        this.content.scrollTop = 0;
    }

    // ---- views -------------------------------------------------------------

    private homeView(): HTMLElement {
        this.stateBadge = h("span", { class: "mashiro-state" });
        this.searchLine = h("span", { class: "mashiro-kv-value" });
        this.availLine = h("span", { class: "mashiro-kv-value" });
        this.startButton = button(t("startCrawl"), () => this.host.start(), "primary", icon(ICONS.play));
        this.stopButton = button(t("stopCrawl"), () => this.host.stop(), "danger", icon(ICONS.stop));
        const clearButton = button(t("clearResults"), () => this.host.clearResults(), "outline", icon(ICONS.trash));

        this.progressBar = h("span", { class: "mashiro-progress-fill" });
        this.progressLabel = h("span", { class: "mashiro-progress-label" });
        this.statFound = h("b", null, "0");
        this.statFiltered = h("b", null, "0");
        this.statRequests = h("b", null, "0");
        this.perSection = h("div", { class: "mashiro-pills" });

        this.logList = h("ul", { class: "mashiro-log" });
        for (const entry of log.entries) this.renderLogEntry(entry);

        return h("div", { class: "mashiro-view" },
            h("div", { class: "mashiro-tip" }, h("span", { class: "mashiro-card-icon" }, icon(ICONS.bulb, 18)), h("p", null, t("tipSafe"))),
            card(t("statusTitle"), icon(ICONS.flame, 18),
                h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("statusTitle")), this.stateBadge),
                h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("currentSearch")), this.searchLine),
                h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("availability")), this.availLine),
                h("div", { class: "mashiro-button-row" }, this.startButton, this.stopButton, clearButton)
            ),
            card(t("progress"), icon(ICONS.download, 18),
                h("div", { class: "mashiro-progress" }, h("span", { class: "mashiro-progress-track" }, this.progressBar), this.progressLabel),
                h("div", { class: "mashiro-stats" },
                    h("span", null, t("found"), " ", this.statFound),
                    h("span", null, t("filteredOut", { n: "" }).replace(/^\s*/, ""), " ", this.statFiltered),
                    h("span", null, t("requests"), " ", this.statRequests)
                ),
                h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("perBucket")), this.perSection)
            ),
            card(t("logTitle"), icon(ICONS.general, 18),
                this.logList,
                h("div", { class: "mashiro-button-row" }, button(t("clearLog"), () => log.clear(), "ghost", icon(ICONS.trash)))
            )
        );
    }

    private crawlView(): HTMLElement {
        const s = this.host.settings;
        return h("div", { class: "mashiro-view" },
            card(t("secCrawl"), icon(ICONS.search, 18),
                this.bind("minBucket", selectRow({ label: t("minBucket"), help: t("minBucketHelp") }, s.get("minBucket"),
                    BUCKETS.map((b) => ({ value: b, label: `${b} users入り` })), (v) => s.set("minBucket", v))),
                this.bind("resultLimit", numberRow({ label: t("resultLimit") }, s.get("resultLimit"), { min: 50, max: 5000, step: 50 }, (v) => s.set("resultLimit", v))),
                this.bind("maxPagesPerBucket", numberRow({ label: t("maxPages") }, s.get("maxPagesPerBucket"), { min: 1, max: 20 }, (v) => s.set("maxPagesPerBucket", v))),
                this.bind("orderInBucket", selectRow({ label: t("orderInBucket") }, s.get("orderInBucket"),
                    [{ value: "date_d", label: t("newestFirst") }, { value: "date", label: t("oldestFirst") }], (v) => s.set("orderInBucket", v))),
                this.bind("inheritPageFilters", toggleRow({ label: t("inheritPageFilters") }, s.get("inheritPageFilters"), (v) => s.set("inheritPageFilters", v))),
                this.bind("probeOnLoad", toggleRow({ label: t("probeOnLoad"), help: t("probeOnLoadHelp") }, s.get("probeOnLoad"), (v) => s.set("probeOnLoad", v)))
            ),
            card(t("altMode"), icon(ICONS.pixiv, 18),
                this.bind("altMode", selectRow({ label: t("altMode") }, s.get("altMode"),
                    [{ value: "auto", label: t("altAuto") }, { value: "always", label: t("altAlways") }, { value: "off", label: t("altOff") }], (v) => s.set("altMode", v))),
                this.bind("altThreshold", numberRow({ label: t("altThreshold") }, s.get("altThreshold"), { min: 0, max: 1000, step: 5 }, (v) => s.set("altThreshold", v))),
                this.bind("recoDepth", numberRow({ label: t("recoDepth") }, s.get("recoDepth"), { min: 0, max: 2 }, (v) => s.set("recoDepth", v)))
            ),
            card(t("requests"), icon(ICONS.refresh, 18),
                this.bind("requestGapMs", numberRow({ label: t("requestGap") }, s.get("requestGapMs"), { min: 200, max: 5000, step: 50 }, (v) => s.set("requestGapMs", v))),
                this.bind("retryAfter429Seconds", numberRow({ label: t("retryAfter429") }, s.get("retryAfter429Seconds"), { min: 10, max: 600, step: 5 }, (v) => s.set("retryAfter429Seconds", v)))
            )
        );
    }

    private filtersView(): HTMLElement {
        const s = this.host.settings;
        return h("div", { class: "mashiro-view" },
            card(t("secFilters"), icon(ICONS.filter, 18),
                this.bind("hideR18", toggleRow({ label: t("hideR18") }, s.get("hideR18"), (v) => s.set("hideR18", v))),
                this.bind("hideR18G", toggleRow({ label: t("hideR18G") }, s.get("hideR18G"), (v) => s.set("hideR18G", v))),
                this.bind("hideAI", toggleRow({ label: t("hideAI") }, s.get("hideAI"), (v) => s.set("hideAI", v))),
                this.bind("hideUgoira", toggleRow({ label: t("hideUgoira") }, s.get("hideUgoira"), (v) => s.set("hideUgoira", v))),
                this.bind("minPageCount", numberRow({ label: t("minPageCount") }, s.get("minPageCount"), { min: 0, max: 200 }, (v) => s.set("minPageCount", v))),
                this.bind("dateFrom", textRow({ label: t("dateFrom") }, s.get("dateFrom"), (v) => s.set("dateFrom", v), "date")),
                this.bind("dateTo", textRow({ label: t("dateTo") }, s.get("dateTo"), (v) => s.set("dateTo", v), "date")),
                this.bind("excludeTags", textareaRow({ label: t("excludeTags"), help: t("excludeTagsHelp") }, s.get("excludeTags"), (v) => s.set("excludeTags", v), "R-18G, 腐向け, …"))
            )
        );
    }

    private displayView(): HTMLElement {
        const s = this.host.settings;
        return h("div", { class: "mashiro-view" },
            card(t("secDisplay"), icon(ICONS.display, 18),
                this.bind("cardSize", selectRow({ label: t("cardSize") }, s.get("cardSize"),
                    [{ value: "compact", label: t("sizeCompact") }, { value: "regular", label: t("sizeRegular") }, { value: "large", label: t("sizeLarge") }], (v) => s.set("cardSize", v))),
                this.bind("showBucketHeaders", toggleRow({ label: t("showBucketHeaders") }, s.get("showBucketHeaders"), (v) => s.set("showBucketHeaders", v))),
                this.bind("showBucketBadge", toggleRow({ label: t("showBucketBadge") }, s.get("showBucketBadge"), (v) => s.set("showBucketBadge", v))),
                this.bind("showAuthor", toggleRow({ label: t("showAuthor") }, s.get("showAuthor"), (v) => s.set("showAuthor", v))),
                this.bind("openInNewTab", toggleRow({ label: t("openInNewTab") }, s.get("openInNewTab"), (v) => s.set("openInNewTab", v))),
                this.bind("autoStart", toggleRow({ label: t("autoStart") }, s.get("autoStart"), (v) => s.set("autoStart", v))),
                this.bind("showPanelButton", toggleRow({ label: t("showPanelButton") }, s.get("showPanelButton"), (v) => s.set("showPanelButton", v)))
            )
        );
    }

    private generalView(): HTMLElement {
        const s = this.host.settings;
        const fileInput = h("input", { type: "file", accept: "application/json,.json", hidden: true });
        fileInput.addEventListener("change", async () => {
            const file = fileInput.files?.[0];
            fileInput.value = "";
            if (!file) return;
            try {
                const parsed = JSON.parse(await file.text()) as Record<string, unknown>;
                const known = Object.keys(DEFAULT_SETTINGS).filter((key) => key in parsed);
                if (!parsed || typeof parsed !== "object" || !known.length) throw new Error("not a settings file");
                await s.replace(parsed);
                toast(t("importDone"), "success");
            } catch {
                toast(t("importFailed"), "error");
            }
        });

        return h("div", { class: "mashiro-view" },
            card(t("secGeneral"), icon(ICONS.general, 18),
                this.bind("language", selectRow({ label: t("language") }, s.get("language"),
                    [{ value: "auto", label: t("followPixiv") }, { value: "en", label: "English" }, { value: "ja", label: "日本語" }, { value: "zh-CN", label: "简体中文" }], (v) => s.set("language", v))),
                this.bind("theme", selectRow({ label: t("theme") }, s.get("theme"),
                    [{ value: "auto", label: t("followPixiv") }, { value: "light", label: t("themeLight") }, { value: "dark", label: t("themeDark") }], (v) => s.set("theme", v)))
            ),
            card(t("exportSettings"), icon(ICONS.download, 18),
                h("div", { class: "mashiro-button-row" },
                    button(t("exportSettings"), () => this.exportSettings(), "outline", icon(ICONS.download)),
                    button(t("importSettings"), () => fileInput.click(), "outline", icon(ICONS.upload)),
                    button(t("resetSettings"), async () => {
                        if (!confirm(t("resetConfirm"))) return;
                        await s.reset();
                        toast(t("settingsReset"), "success");
                    }, "danger", icon(ICONS.trash)),
                    fileInput
                )
            )
        );
    }

    private helpView(): HTMLElement {
        return h("div", { class: "mashiro-view" },
            card(t("helpHowTitle"), icon(ICONS.help, 18), h("p", { class: "mashiro-prose" }, t("helpHow"))),
            card(t("helpColorsTitle"), icon(ICONS.flame, 18),
                h("p", { class: "mashiro-prose" },
                    h("span", { class: "mashiro-dot is-orange" }), " ", h("span", { class: "mashiro-dot is-blue" }), " ", h("span", { class: "mashiro-dot is-grey" }), " ",
                    t("helpColors"))
            ),
            card(t("helpTipsTitle"), icon(ICONS.bulb, 18), h("p", { class: "mashiro-prose" }, t("helpTips"))),
            card(t("secHelp"), icon(ICONS.external, 18),
                h("p", { class: "mashiro-prose" }, t("helpVersion", { v: this.host.version }), " · ",
                    h("a", { href: this.host.repoUrl, target: "_blank", rel: "noopener" }, t("helpProject"))),
                h("p", { class: "mashiro-prose mashiro-muted" }, t("helpCredits"))
            )
        );
    }

    // ---- helpers -----------------------------------------------------------

    private bind<K extends SettingKey>(key: K, control: Control<Settings[K]>): HTMLElement {
        this.controls.set(key, control as Control<never>);
        control.el.dataset.setting = key;
        return control.el;
    }

    private renderLogEntry(entry: LogEntry): void {
        if (!this.logList) return;
        const time = new Date(entry.time).toLocaleTimeString();
        const escape = (value: string) => (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, "\\$&"));
        let li = entry.key ? this.logList.querySelector<HTMLElement>(`li[data-key="${escape(entry.key)}"]`) : null;
        if (!li) {
            li = h("li", entry.key ? { dataset: { key: entry.key } } : null);
            this.logList.appendChild(li);
            while (this.logList.childElementCount > 200) this.logList.firstElementChild?.remove();
        }
        li.className = `is-${entry.level}`;
        clear(li);
        li.append(h("time", null, time), " ", entry.text);
        this.logList.scrollTop = this.logList.scrollHeight;
    }

    private exportSettings(): void {
        const blob = new Blob([this.host.settings.export()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = h("a", { href: url, download: `mashiro-settings-${new Date().toISOString().slice(0, 10)}.json` });
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    private availabilityText(availability: Availability): string {
        switch (availability) {
            case "orange": return t("availOrange");
            case "blue": return t("availBlue");
            case "grey": return t("availGrey");
            case "probing": return t("stateProbing");
            default: return t("availUnknown");
        }
    }

    private stateText(progress: CrawlProgress, availability: Availability): string {
        switch (progress.phase) {
            case "buckets":
            case "alt": return t("stateRunning");
            case "paused": return t("statePaused");
            case "done": return t("stateDone");
            case "stopped": return t("stateStopped");
            case "error": return t("stateError");
            default: return availability === "probing" ? t("stateProbing") : t("stateIdle");
        }
    }
}
