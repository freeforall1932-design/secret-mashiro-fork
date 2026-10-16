// Ties everything together on a Pixiv page: watches navigation, keeps the
// button/grid attached while Pixiv re-renders, runs probes and crawls, and
// reacts to settings changes.

import { setLanguage } from "../lib/i18n";
import { log } from "../lib/log";
import { illustrationsTabHref, parsePage, type PageInfo, type SearchPage } from "../lib/pageType";
import { pageSwitch } from "../lib/pageSwitch";
import { settings, type SettingChange } from "../lib/settings";
import { ext } from "../lib/ext";
import { theme } from "../lib/theme";
import { toast } from "../lib/toast";
import { SettingsPanel } from "../panel/panel";
import { PopularButton } from "./button";
import { crawler } from "./crawler";
import { ResultsGrid } from "./grid";

declare const __MASHIRO_VERSION__: string;

export const VERSION = typeof __MASHIRO_VERSION__ === "string" ? __MASHIRO_VERSION__ : "0.0.0";
export const REPO_URL = "https://github.com/freeforall1932-design/secret-mashiro-fork";

const AUTOSTART_HASH = "#mashiro-start";

export class PageController {
    private page: PageInfo = { kind: "other", key: "" };
    private readonly button: PopularButton;
    private readonly grid: ResultsGrid;
    private readonly panel: SettingsPanel;
    private uiObserver: MutationObserver | null = null;
    private uiTimer: number | null = null;
    private autoStartedKey = "";

    constructor() {
        this.button = new PopularButton({
            onPopular: () => this.onPopularClick(),
            onSettings: () => this.panel.toggle()
        });
        this.grid = new ResultsGrid({
            onStop: () => crawler.stop(),
            onRefresh: () => this.start(true),
            onClose: () => this.showPixivList()
        });
        this.panel = new SettingsPanel({
            settings,
            crawler,
            version: VERSION,
            repoUrl: REPO_URL,
            getPage: () => this.page,
            start: () => this.start(true),
            stop: () => crawler.stop(),
            clearResults: () => this.clearResults()
        });
    }

    async boot(): Promise<void> {
        await settings.load();
        setLanguage(settings.get("language"));
        theme.start(settings.get("theme"));
        settings.on("change", (change) => this.onSettingChange(change));

        crawler.on("work", ({ item, section }) => {
            this.grid.addWork(item, section);
            this.button.setCount(this.grid.count);
        });
        crawler.on("progress", (progress) => {
            this.grid.setProgress(progress);
            this.button.setBusy(crawler.isRunning());
            if (progress.phase === "error" && progress.errorStatus === 403) toast(progress.error || "403", "error", 6000);
        });
        crawler.on("availability", (availability) => this.button.setAvailability(availability));

        pageSwitch.on("switch", () => this.onNavigate());
        pageSwitch.start();

        ext()?.runtime?.onMessage?.addListener((message: { type?: string }) => {
            if (message?.type === "mashiro:togglePanel") this.panel.toggle();
        });

        this.watchUi();
        this.onNavigate();
    }

    // ---- page lifecycle ----------------------------------------------------

    private onNavigate(): void {
        const next = parsePage();
        const changed = next.key !== this.page.key;
        this.page = next;
        if (!changed) {
            this.ensureUi();
            return;
        }

        crawler.reset();
        this.grid.clear();
        this.grid.setActive(false);
        this.button.setCount(0);
        this.button.setActive(false);
        this.button.setTopTab(next.kind === "search" && next.tab === "top");
        this.panel.refreshHome();

        if (next.kind !== "search") {
            this.button.remove();
            return;
        }

        this.ensureUi();
        const wantsAutoStart = location.hash === AUTOSTART_HASH || settings.get("autoStart");
        if (next.tab === "top") return;

        if (settings.get("probeOnLoad") || wantsAutoStart) {
            void crawler.probe(next, settings.value).then((availability) => {
                if (this.page.key !== next.key) return;
                if (wantsAutoStart && availability !== "grey" && this.autoStartedKey !== next.key) {
                    this.autoStartedKey = next.key;
                    if (location.hash === AUTOSTART_HASH) history.replaceState(history.state, "", location.pathname + location.search);
                    void this.start(false);
                }
            });
        }
    }

    private ensureUi(): void {
        if (this.page.kind !== "search") return;
        this.button.ensure(settings.get("showPanelButton"));
        this.grid.mount(this.page, settings.value);
    }

    /** Pixiv re-renders its toolbar on filter changes; keep our nodes attached. */
    private watchUi(): void {
        this.uiObserver = new MutationObserver(() => {
            if (this.uiTimer !== null) return;
            this.uiTimer = window.setTimeout(() => {
                this.uiTimer = null;
                if (this.page.kind === "search") {
                    this.button.ensure(settings.get("showPanelButton"));
                    this.grid.ensurePlaced();
                }
            }, 150);
        });
        this.uiObserver.observe(document.body, { childList: true, subtree: true });
    }

    // ---- actions -----------------------------------------------------------

    private onPopularClick(): void {
        if (this.page.kind !== "search") return;
        if (this.page.tab === "top") {
            location.assign(illustrationsTabHref(this.page) + AUTOSTART_HASH);
            return;
        }
        if (this.grid.isActive()) {
            this.showPixivList();
            return;
        }
        if (this.grid.count > 0 && !crawler.isRunning()) {
            this.showMashiroList();
            return;
        }
        void this.start(false);
    }

    private async start(force: boolean): Promise<void> {
        if (this.page.kind !== "search") {
            toast(this.panelHint(), "warning");
            return;
        }
        if (this.page.tab === "top") {
            location.assign(illustrationsTabHref(this.page) + AUTOSTART_HASH);
            return;
        }
        if (crawler.isRunning() && !force) return;
        const page: SearchPage = this.page;
        this.grid.clear();
        this.grid.mount(page, settings.value);
        this.showMashiroList();
        await crawler.start(page, settings.value);
    }

    private showMashiroList(): void {
        this.grid.setActive(true);
        this.button.setActive(true);
    }

    private showPixivList(): void {
        this.grid.setActive(false);
        this.button.setActive(false);
    }

    private clearResults(): void {
        crawler.stop();
        this.grid.clear();
        this.showPixivList();
        this.button.setCount(0);
        if (this.page.kind === "search") crawler.reset();
        this.panel.refreshHome();
        if (this.page.kind === "search" && settings.get("probeOnLoad")) void crawler.probe(this.page, settings.value);
    }

    private panelHint(): string {
        return "Mashiro: open a Pixiv tag search first";
    }

    // ---- settings ----------------------------------------------------------

    private onSettingChange({ key, settings: next }: SettingChange): void {
        switch (key) {
            case "language":
                setLanguage(next.language);
                this.button.retranslate();
                this.grid.retranslate();
                this.panel.rebuild();
                break;
            case "theme":
                theme.setSetting(next.theme);
                break;
            case "cardSize":
            case "showBucketHeaders":
            case "showBucketBadge":
            case "showAuthor":
                this.grid.applyDisplaySettings(next);
                break;
            case "showPanelButton":
                this.ensureUi();
                break;
            case "probeOnLoad":
                if (next.probeOnLoad && this.page.kind === "search" && this.page.tab !== "top" && crawler.availability === "unknown") {
                    void crawler.probe(this.page, settings.value);
                }
                break;
            default:
                break;
        }
        log.info(`Setting changed: ${key}`, "setting");
    }
}
