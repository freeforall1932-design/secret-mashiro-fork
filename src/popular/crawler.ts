// The Popular-mode crawl: probe availability, walk the users入り buckets
// (highest first, paginated), then optionally fall back to Pixiv's own
// popular list + recommendations. Emits works and progress; renders nothing.

import {
    ApiError,
    readPopular,
    readRecommended,
    readWorkList,
    recommendUrl,
    searchUrl,
    type RecommendResponse,
    type SearchResponse,
    type WorkItem
} from "../lib/api";
import { Emitter } from "../lib/events";
import { log } from "../lib/log";
import type { SearchPage } from "../lib/pageType";
import { QueueAbortedError, queue } from "../lib/requestQueue";
import { parseTagList, type Settings } from "../lib/settings";
import { BUCKETS, SUFFIX, bucketValue, bucketsFrom, highestBucket, type Bucket } from "./buckets";
import { checkWork, type FilterOptions } from "./filter";

export type Availability = "unknown" | "probing" | "orange" | "blue" | "grey";
export type CrawlPhase = "idle" | "buckets" | "alt" | "paused" | "done" | "stopped" | "error";
export type Section = Bucket | "alt";

export interface CrawlProgress {
    phase: CrawlPhase;
    bucketsTotal: number;
    bucketsDone: number;
    currentBucket: Bucket | null;
    found: number;
    filtered: number;
    requests: number;
    perSection: Partial<Record<Section, number>>;
    error: string | null;
    errorStatus: number | null;
    retryInMs: number | null;
}

export interface CrawlerEvents {
    progress: CrawlProgress;
    work: { item: WorkItem; section: Section };
    availability: Availability;
    reset: undefined;
}

const PRIORITY_BUCKET = 0;
const PRIORITY_POPULAR = 1;
const PRIORITY_RECOMMEND = 2;
const PAGE_SIZE = 60;

function freshProgress(): CrawlProgress {
    return {
        phase: "idle",
        bucketsTotal: 0,
        bucketsDone: 0,
        currentBucket: null,
        found: 0,
        filtered: 0,
        requests: 0,
        perSection: {},
        error: null,
        errorStatus: null,
        retryInMs: null
    };
}

export class PopularCrawler extends Emitter<CrawlerEvents> {
    progress: CrawlProgress = freshProgress();
    availability: Availability = "unknown";

    private generation = 0;
    private seen = new Set<string>();
    private settings: Settings | null = null;
    private filterOptions: FilterOptions | null = null;

    constructor() {
        super();
        queue.on("request", () => {
            if (this.progress.phase === "buckets" || this.progress.phase === "alt" || this.progress.phase === "paused") {
                this.progress.requests++;
                this.emitProgress();
            }
        });
        queue.on("rateLimited", ({ status, retryInMs }) => {
            if (!this.isRunning()) return;
            this.progress.phase = "paused";
            this.progress.retryInMs = retryInMs;
            log.warning(`Pixiv returned ${status}; waiting ${Math.round(retryInMs / 1000)}s before retrying`, "ratelimit");
            this.emitProgress();
        });
        queue.on("retryTick", ({ remainingMs }) => {
            if (this.progress.phase !== "paused") return;
            this.progress.retryInMs = remainingMs;
            this.emitProgress();
        });
    }

    get results(): number {
        return this.seen.size;
    }

    isRunning(): boolean {
        return this.progress.phase === "buckets" || this.progress.phase === "alt" || this.progress.phase === "paused";
    }

    /** Forget everything (page changed). Aborts any running work. */
    reset(): void {
        this.generation++;
        queue.clear();
        queue.resetCounters();
        this.seen.clear();
        this.settings = null;
        this.filterOptions = null;
        this.progress = freshProgress();
        this.availability = "unknown";
        this.emit("reset", undefined);
        this.emit("availability", this.availability);
        this.emitProgress();
    }

    /** Stop the current crawl but keep the results. */
    stop(): void {
        if (!this.isRunning()) return;
        this.generation++;
        queue.clear();
        this.progress.phase = "stopped";
        this.progress.retryInMs = null;
        log.info(`Stopped with ${this.seen.size} works`);
        this.emitProgress();
    }

    /**
     * One cheap request tells us whether any "<N>users入り" work exists for the
     * query (partial tag match on "users入り" hits every bucket at once). A
     * second one checks Pixiv's own popular list. Sets `availability`.
     */
    async probe(page: SearchPage, settings: Settings): Promise<Availability> {
        const generation = ++this.generation;
        this.settings = settings;
        this.setAvailability("probing");
        this.applyQueueSettings(settings);

        try {
            const bucketData = await queue.enqueue<SearchResponse>(
                searchUrl({ ...this.searchBase(page, settings), word: `${page.word} ${SUFFIX}`, page: 1 }),
                PRIORITY_BUCKET
            );
            if (generation !== this.generation) return this.availability;
            const hasBuckets = readWorkList(bucketData).some((item) => highestBucket(item.tags || []) !== null);
            if (hasBuckets) {
                this.setAvailability("orange");
                return "orange";
            }

            if (settings.altMode === "off") {
                this.setAvailability("grey");
                return "grey";
            }
            const popularData = await queue.enqueue<SearchResponse>(
                searchUrl({ ...this.searchBase(page, settings), page: 1 }),
                PRIORITY_POPULAR
            );
            if (generation !== this.generation) return this.availability;
            const popular = readPopular(popularData);
            const available = popular.permanent.length + popular.recent.length > 0 ? "blue" : "grey";
            this.setAvailability(available);
            return available;
        } catch (err) {
            if (generation !== this.generation || err instanceof QueueAbortedError) return this.availability;
            this.reportError(err, "probe");
            this.setAvailability("unknown");
            return "unknown";
        }
    }

    /** Run the full crawl for `page`. Resolves when finished, stopped or failed. */
    async start(page: SearchPage, settings: Settings): Promise<void> {
        if (this.isRunning()) this.stop();
        const generation = ++this.generation;
        const alive = () => generation === this.generation;
        if (this.availability === "probing") this.setAvailability("unknown");

        this.settings = settings;
        this.seen.clear();
        this.filterOptions = {
            tab: page.tab,
            hideR18: settings.hideR18,
            hideR18G: settings.hideR18G,
            hideAI: settings.hideAI,
            hideUgoira: settings.hideUgoira,
            excludeTags: parseTagList(settings.excludeTags),
            minPageCount: settings.minPageCount,
            dateFrom: settings.dateFrom,
            dateTo: settings.dateTo
        };
        this.applyQueueSettings(settings);
        queue.resetCounters();

        // The probe already searched "<word> users入り" (partial match hits every
        // bucket at once). If it found nothing, the per-bucket searches cannot
        // find anything either — skip straight to Pixiv's popular list.
        const probeSaysNoBuckets = this.availability === "blue" || this.availability === "grey";
        const buckets = probeSaysNoBuckets ? [] : bucketsFrom(settings.minBucket);
        this.progress = { ...freshProgress(), phase: "buckets", bucketsTotal: buckets.length };
        this.emitProgress();
        if (buckets.length) {
            log.info(`Popular mode: "${page.word}" (${page.tab}), buckets ${buckets[0]} → ${buckets[buckets.length - 1]}`);
        } else {
            log.info(`Popular mode: "${page.word}" (${page.tab}), no users入り works — using Pixiv's popular list`);
        }

        try {
            let bucketFound = 0;
            for (const bucket of buckets) {
                if (!alive() || this.limitReached()) break;
                this.progress.currentBucket = bucket;
                this.emitProgress();
                bucketFound += await this.crawlBucket(page, settings, bucket, alive);
                if (!alive()) return;
                this.progress.bucketsDone++;
                this.emitProgress();
            }
            if (!alive()) return;

            const wantAlt = settings.altMode === "always"
                || (settings.altMode === "auto" && bucketFound < settings.altThreshold);
            if (wantAlt && !this.limitReached()) {
                this.progress.phase = "alt";
                this.progress.currentBucket = null;
                this.emitProgress();
                await this.crawlAlt(page, settings, alive);
                if (!alive()) return;
            }

            this.progress.phase = "done";
            this.progress.currentBucket = null;
            this.progress.retryInMs = null;
            log.success(`Done: ${this.seen.size} works (${this.progress.filtered} hidden by filters, ${this.progress.requests} requests)`);
            this.emitProgress();
        } catch (err) {
            if (!alive() || err instanceof QueueAbortedError) return;
            this.reportError(err, "crawl");
            this.progress.phase = "error";
            this.progress.retryInMs = null;
            this.emitProgress();
        }
    }

    // ---- phases ------------------------------------------------------------

    private async crawlBucket(page: SearchPage, settings: Settings, bucket: Bucket, alive: () => boolean): Promise<number> {
        let found = 0;
        for (let p = 1; p <= settings.maxPagesPerBucket; p++) {
            if (!alive() || this.limitReached()) break;
            const data = await queue.enqueue<SearchResponse>(
                searchUrl({ ...this.searchBase(page, settings), word: `${page.word} ${bucket}${SUFFIX}`, page: p }),
                PRIORITY_BUCKET
            );
            if (!alive()) break;
            const list = readWorkList(data);
            for (const item of list) {
                if (this.admit(item, bucket)) found++;
            }
            log.info(`${bucket}${SUFFIX} page ${p}: ${list.length} works, ${this.seen.size} total`, `bucket-${bucket}`);
            if (list.length < PAGE_SIZE) break;
        }
        return found;
    }

    private async crawlAlt(page: SearchPage, settings: Settings, alive: () => boolean): Promise<void> {
        const data = await queue.enqueue<SearchResponse>(
            searchUrl({ ...this.searchBase(page, settings), page: 1 }),
            PRIORITY_POPULAR
        );
        if (!alive()) return;
        const popular = readPopular(data);
        const seeds: string[] = [];
        for (const item of [...popular.permanent, ...popular.recent]) {
            if (this.admit(item, "alt")) seeds.push(item.id);
        }
        log.info(`Pixiv popular list: ${popular.permanent.length + popular.recent.length} works, ${seeds.length} new`);

        if (settings.recoDepth <= 0) return;
        const word = page.word.toLowerCase();
        const pending: Array<{ id: string; depth: number }> = seeds.map((id) => ({ id, depth: 1 }));
        const visited = new Set<string>();
        const recoLimit = 60;
        let recoRequests = 0;

        while (pending.length && alive() && !this.limitReached() && recoRequests < recoLimit) {
            const { id, depth } = pending.shift()!;
            if (visited.has(id)) continue;
            visited.add(id);
            recoRequests++;
            const reco = await queue.enqueue<RecommendResponse>(recommendUrl(id), PRIORITY_RECOMMEND);
            if (!alive()) return;
            for (const item of readRecommended(reco)) {
                if (!Array.isArray(item.tags) || !item.tags.some((tag) => tag.toLowerCase() === word)) continue;
                if (this.admit(item, "alt") && depth < settings.recoDepth) {
                    pending.push({ id: item.id, depth: depth + 1 });
                }
            }
            log.info(`Recommendations: ${recoRequests} requests, ${this.seen.size} works total`, "reco");
        }
    }

    // ---- helpers -----------------------------------------------------------

    /** Filter + dedupe. Emits `work` when admitted. */
    private admit(item: WorkItem, fallback: Section): boolean {
        if (!this.filterOptions || this.limitReached()) return false;
        const reason = checkWork(item, this.filterOptions);
        if (reason) {
            if (reason !== "invalid" && reason !== "ad") this.progress.filtered++;
            return false;
        }
        if (this.seen.has(item.id)) return false;
        this.seen.add(item.id);

        // Place by the highest users入り tag the work carries; the bucket we
        // searched is the floor (Pixiv's partial match can return higher tags).
        const tagged = highestBucket(item.tags);
        let section: Section = fallback;
        if (tagged && (fallback === "alt" || bucketValue(tagged) > bucketValue(fallback))) section = tagged;
        if (section !== "alt" && this.settings && bucketValue(section) < bucketValue(this.settings.minBucket)) {
            section = fallback;
        }

        this.progress.found = this.seen.size;
        this.progress.perSection[section] = (this.progress.perSection[section] || 0) + 1;
        this.emit("work", { item, section });
        return true;
    }

    private limitReached(): boolean {
        return !!this.settings && this.seen.size >= this.settings.resultLimit;
    }

    private searchBase(page: SearchPage, settings: Settings) {
        const extra: Record<string, string | undefined> = settings.inheritPageFilters ? { ...page.pageFilters } : {};
        if (settings.dateFrom) extra.scd = settings.dateFrom;
        if (settings.dateTo) extra.ecd = settings.dateTo;
        if (settings.hideAI) extra.ai_type = "1";
        return {
            word: page.word,
            apiPath: page.apiPath,
            type: page.type,
            order: settings.orderInBucket,
            extra
        };
    }

    private applyQueueSettings(settings: Settings): void {
        queue.gapMs = settings.requestGapMs;
        queue.retryAfterMs = settings.retryAfter429Seconds * 1000;
    }

    private setAvailability(value: Availability): void {
        this.availability = value;
        this.emit("availability", value);
    }

    private reportError(err: unknown, where: string): void {
        if (err instanceof ApiError) {
            this.progress.error = err.message;
            this.progress.errorStatus = err.status;
            log.error(`${where}: HTTP ${err.status} for ${err.url.replace(/^https:\/\/www\.pixiv\.net/, "")}`);
        } else {
            this.progress.error = err instanceof Error ? err.message : String(err);
            this.progress.errorStatus = null;
            log.error(`${where}: ${this.progress.error}`);
        }
    }

    private emitProgress(): void {
        this.emit("progress", { ...this.progress, perSection: { ...this.progress.perSection } });
    }
}

export const SECTION_ORDER: readonly Section[] = [...BUCKETS, "alt"];
export const crawler = new PopularCrawler();
