// Decide whether a work from Pixiv should be shown. Pure function.

import type { WorkItem } from "../lib/api";
import type { WorkTab } from "../lib/pageType";
import { FAKE_TAG } from "./buckets";

export interface FilterOptions {
    tab: WorkTab;
    hideR18: boolean;
    hideR18G: boolean;
    hideAI: boolean;
    hideUgoira: boolean;
    /** Lower-cased tags to exclude. */
    excludeTags: readonly string[];
    minPageCount: number;
    /** YYYY-MM-DD or "" */
    dateFrom: string;
    dateTo: string;
}

export type RejectReason =
    | "invalid"
    | "ad"
    | "masked"
    | "fake"
    | "type"
    | "r18"
    | "r18g"
    | "ai"
    | "ugoira"
    | "tag"
    | "pages"
    | "date";

/** Returns null when the work passes, otherwise why it was rejected. */
export function checkWork(item: WorkItem | null | undefined, options: FilterOptions): RejectReason | null {
    if (!item || typeof item !== "object" || !item.id || !Array.isArray(item.tags)) return "invalid";
    if (item.isAdContainer) return "ad";
    if (item.isMasked) return "masked";
    if (item.tags.includes(FAKE_TAG)) return "fake";

    if (options.tab === "illustrations" && item.illustType === 1) return "type";
    if (options.tab === "manga" && item.illustType !== 1) return "type";

    if (options.hideR18G && item.xRestrict === 2) return "r18g";
    if (options.hideR18 && item.xRestrict >= 1) return "r18";
    if (options.hideAI && item.aiType === 2) return "ai";
    if (options.hideUgoira && item.illustType === 2) return "ugoira";

    if (options.excludeTags.length) {
        for (const tag of item.tags) {
            if (options.excludeTags.includes(tag.toLowerCase())) return "tag";
        }
    }

    if (options.minPageCount > 0 && (item.pageCount || 1) < options.minPageCount) return "pages";

    if ((options.dateFrom || options.dateTo) && item.createDate) {
        const day = item.createDate.slice(0, 10);
        if (options.dateFrom && day < options.dateFrom) return "date";
        if (options.dateTo && day > options.dateTo) return "date";
    }

    return null;
}
