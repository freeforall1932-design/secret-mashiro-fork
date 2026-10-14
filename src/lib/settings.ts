// User settings: typed defaults, validation, persistence in chrome.storage
// (sync when available, local otherwise) and change notifications.

import { Emitter } from "./events";
import { BUCKETS, type Bucket } from "../popular/buckets";

export type Language = "auto" | "en" | "ja" | "zh-CN";
export type ThemeSetting = "auto" | "light" | "dark";
export type CardSize = "compact" | "regular" | "large";
export type AltMode = "auto" | "always" | "off";
export type BucketOrder = "date_d" | "date";

export interface Settings {
    // Crawl
    minBucket: Bucket;
    resultLimit: number;
    maxPagesPerBucket: number;
    requestGapMs: number;
    orderInBucket: BucketOrder;
    probeOnLoad: boolean;
    altMode: AltMode;
    altThreshold: number;
    recoDepth: number;
    inheritPageFilters: boolean;
    retryAfter429Seconds: number;
    // Filters
    hideR18: boolean;
    hideR18G: boolean;
    hideAI: boolean;
    hideUgoira: boolean;
    excludeTags: string;
    minPageCount: number;
    dateFrom: string;
    dateTo: string;
    // Display
    cardSize: CardSize;
    showBucketHeaders: boolean;
    showBucketBadge: boolean;
    showAuthor: boolean;
    openInNewTab: boolean;
    autoStart: boolean;
    showPanelButton: boolean;
    // General
    language: Language;
    theme: ThemeSetting;
}

export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
    minBucket: "50",
    resultLimit: 1000,
    maxPagesPerBucket: 3,
    requestGapMs: 500,
    orderInBucket: "date_d",
    probeOnLoad: true,
    altMode: "auto",
    altThreshold: 30,
    recoDepth: 1,
    inheritPageFilters: true,
    retryAfter429Seconds: 60,

    hideR18: false,
    hideR18G: false,
    hideAI: false,
    hideUgoira: false,
    excludeTags: "",
    minPageCount: 0,
    dateFrom: "",
    dateTo: "",

    cardSize: "regular",
    showBucketHeaders: true,
    showBucketBadge: true,
    showAuthor: true,
    openInNewTab: false,
    autoStart: false,
    showPanelButton: true,

    language: "auto",
    theme: "auto"
});

export type SettingKey = keyof Settings;

export interface SettingChange {
    key: SettingKey;
    value: Settings[SettingKey];
    settings: Settings;
}

const STORAGE_KEY = "mashiroSettings";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
    const n = typeof value === "number" ? value : parseInt(String(value), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Coerce any stored/imported value into a valid Settings object. */
export function normalizeSettings(raw: unknown): Settings {
    const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<SettingKey, unknown>>;
    const d = DEFAULT_SETTINGS;
    const bool = (key: SettingKey) => (typeof r[key] === "boolean" ? (r[key] as boolean) : (d[key] as boolean));
    const text = (key: SettingKey) => (typeof r[key] === "string" ? (r[key] as string) : (d[key] as string));
    const date = (key: SettingKey) => (DATE_RE.test(String(r[key] ?? "")) ? String(r[key]) : "");

    return {
        minBucket: oneOf(r.minBucket, BUCKETS, d.minBucket),
        resultLimit: clampInt(r.resultLimit, 50, 5000, d.resultLimit),
        maxPagesPerBucket: clampInt(r.maxPagesPerBucket, 1, 20, d.maxPagesPerBucket),
        requestGapMs: clampInt(r.requestGapMs, 200, 5000, d.requestGapMs),
        orderInBucket: oneOf(r.orderInBucket, ["date_d", "date"] as const, d.orderInBucket),
        probeOnLoad: bool("probeOnLoad"),
        altMode: oneOf(r.altMode, ["auto", "always", "off"] as const, d.altMode),
        altThreshold: clampInt(r.altThreshold, 0, 1000, d.altThreshold),
        recoDepth: clampInt(r.recoDepth, 0, 2, d.recoDepth),
        inheritPageFilters: bool("inheritPageFilters"),
        retryAfter429Seconds: clampInt(r.retryAfter429Seconds, 10, 600, d.retryAfter429Seconds),

        hideR18: bool("hideR18"),
        hideR18G: bool("hideR18G"),
        hideAI: bool("hideAI"),
        hideUgoira: bool("hideUgoira"),
        excludeTags: text("excludeTags"),
        minPageCount: clampInt(r.minPageCount, 0, 200, d.minPageCount),
        dateFrom: date("dateFrom"),
        dateTo: date("dateTo"),

        cardSize: oneOf(r.cardSize, ["compact", "regular", "large"] as const, d.cardSize),
        showBucketHeaders: bool("showBucketHeaders"),
        showBucketBadge: bool("showBucketBadge"),
        showAuthor: bool("showAuthor"),
        openInNewTab: bool("openInNewTab"),
        autoStart: bool("autoStart"),
        showPanelButton: bool("showPanelButton"),

        language: oneOf(r.language, ["auto", "en", "ja", "zh-CN"] as const, d.language),
        theme: oneOf(r.theme, ["auto", "light", "dark"] as const, d.theme)
    };
}

/** Split the free-text exclude list ("a, b\nc") into unique lower-cased tags. */
export function parseTagList(text: string): string[] {
    const out = new Set<string>();
    for (const part of text.split(/[,\n、]/)) {
        const tag = part.trim().replace(/^#/, "").toLowerCase();
        if (tag) out.add(tag);
    }
    return [...out];
}

type StorageArea = chrome.storage.StorageArea;

function pickArea(): StorageArea | null {
    try {
        const storage = globalThis.chrome?.storage;
        if (!storage) return null;
        return storage.sync || storage.local || null;
    } catch {
        return null;
    }
}

export class SettingsStore extends Emitter<{ change: SettingChange; load: Settings }> {
    private current: Settings = { ...DEFAULT_SETTINGS };
    private area: StorageArea | null = pickArea();
    private loaded = false;

    get value(): Readonly<Settings> {
        return this.current;
    }

    get<K extends SettingKey>(key: K): Settings[K] {
        return this.current[key];
    }

    async load(): Promise<Settings> {
        if (this.area) {
            try {
                const stored = await this.area.get(STORAGE_KEY);
                this.current = normalizeSettings(stored?.[STORAGE_KEY]);
            } catch (err) {
                console.warn("Mashiro: could not read settings, using defaults", err);
            }
            this.listenForExternalChanges();
        }
        this.loaded = true;
        this.emit("load", this.current);
        return this.current;
    }

    async set<K extends SettingKey>(key: K, value: Settings[K]): Promise<void> {
        const next = normalizeSettings({ ...this.current, [key]: value });
        if (next[key] === this.current[key]) return;
        this.current = next;
        this.emit("change", { key, value: next[key], settings: next });
        await this.persist();
    }

    async replace(raw: unknown): Promise<void> {
        const next = normalizeSettings(raw);
        const previous = this.current;
        this.current = next;
        for (const key of Object.keys(next) as SettingKey[]) {
            if (next[key] !== previous[key]) {
                this.emit("change", { key, value: next[key], settings: next });
            }
        }
        await this.persist();
    }

    reset(): Promise<void> {
        return this.replace({});
    }

    export(): string {
        return JSON.stringify(this.current, null, 2);
    }

    private async persist(): Promise<void> {
        if (!this.area || !this.loaded) return;
        try {
            await this.area.set({ [STORAGE_KEY]: this.current });
        } catch (err) {
            console.warn("Mashiro: could not save settings", err);
        }
    }

    private listenForExternalChanges(): void {
        try {
            chrome.storage.onChanged.addListener((changes, areaName) => {
                const isOurArea = (areaName === "sync" && this.area === chrome.storage.sync)
                    || (areaName === "local" && this.area === chrome.storage.local);
                if (!isOurArea || !changes[STORAGE_KEY]) return;
                const incoming = normalizeSettings(changes[STORAGE_KEY].newValue);
                if (JSON.stringify(incoming) === JSON.stringify(this.current)) return;
                const previous = this.current;
                this.current = incoming;
                for (const key of Object.keys(incoming) as SettingKey[]) {
                    if (incoming[key] !== previous[key]) {
                        this.emit("change", { key, value: incoming[key], settings: incoming });
                    }
                }
            });
        } catch {
            /* storage.onChanged unavailable (e.g. demo harness) */
        }
    }
}

export const settings = new SettingsStore();
