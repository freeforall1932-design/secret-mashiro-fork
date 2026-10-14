// Which Pixiv page are we on, and what does its search look like?
// Pure function of a Location-like object so it is unit-testable.

import { stripBucketKeyword } from "../popular/buckets";

export type WorkTab = "top" | "artworks" | "illustrations" | "manga";
export type ApiPath = "artworks" | "illustrations" | "manga";

export interface SearchPage {
    kind: "search";
    /** Search word with any trailing "<N>users入り" removed. */
    word: string;
    tab: WorkTab;
    apiPath: ApiPath;
    /** `type` query parameter Pixiv's own request would send. */
    type: "all" | "illust_and_ugoira" | "manga";
    /** "/en" when Pixiv is served with a locale prefix, else "". */
    localePrefix: string;
    /** Filters from the page URL that can be forwarded to the ajax search. */
    pageFilters: Record<string, string>;
    /** Identity of this search view; changes when the user navigates. */
    key: string;
}

export interface OtherPage {
    kind: "other";
    key: string;
}

export type PageInfo = SearchPage | OtherPage;

/** Pixiv URL filters that are meaningful for an ajax search. `type`, `order`, `p` are handled separately. */
export const FORWARDABLE_FILTERS = ["mode", "s_mode", "scd", "ecd", "ratio", "tool", "wlt", "wgt", "hlt", "hgt", "blt", "bgt", "ai_type", "csw"] as const;

const TAGS_RE = /^(\/[a-z]{2}(?:-[a-z]{2})?)?\/tags\/([^/]+)(?:\/(artworks|illustrations|manga|novels|top))?\/?$/i;
const SEARCH_RE = /^(\/[a-z]{2}(?:-[a-z]{2})?)?\/search\/?$/i;

function decode(part: string): string {
    try {
        return decodeURIComponent(part);
    } catch {
        return part;
    }
}

function tabFor(segment: string | undefined, typeParam: string | null): WorkTab | null {
    const value = (segment || "").toLowerCase();
    if (value === "novels") return null;
    if (value === "illustrations") return "illustrations";
    if (value === "manga") return "manga";
    if (value === "artworks") return "artworks";
    if (value === "top" || value === "") {
        // Legacy /search?q= has no "Top"; its `type` picks the tab.
        if (typeParam !== null) {
            const type = typeParam.toLowerCase();
            if (type === "novel") return null;
            if (type === "manga") return "manga";
            if (type === "all") return "artworks";
            return "illustrations";
        }
        return "top";
    }
    return null;
}

export function parsePage(loc: Pick<Location, "pathname" | "search"> = location): PageInfo {
    const params = new URLSearchParams(loc.search);
    let localePrefix = "";
    let rawWord = "";
    let tab: WorkTab | null = null;

    const tags = TAGS_RE.exec(loc.pathname);
    const search = !tags && SEARCH_RE.exec(loc.pathname);
    if (tags) {
        localePrefix = tags[1] || "";
        rawWord = decode(tags[2]);
        tab = tabFor(tags[3], null);
    } else if (search) {
        localePrefix = search[1] || "";
        rawWord = params.get("q") || params.get("word") || "";
        tab = tabFor("", params.get("type"));
    }

    const word = stripBucketKeyword(rawWord.replace(/\+/g, " ")).trim();
    if (!tab || !word) {
        return { kind: "other", key: loc.pathname + loc.search };
    }

    const apiPath: ApiPath = tab === "illustrations" ? "illustrations" : tab === "manga" ? "manga" : "artworks";
    const type = apiPath === "illustrations" ? "illust_and_ugoira" : apiPath === "manga" ? "manga" : "all";

    const pageFilters: Record<string, string> = {};
    for (const name of FORWARDABLE_FILTERS) {
        const value = params.get(name);
        if (value) pageFilters[name] = value;
    }

    const filterKey = Object.entries(pageFilters).sort().map(([k, v]) => `${k}=${v}`).join("&");
    return {
        kind: "search",
        word,
        tab,
        apiPath,
        type,
        localePrefix,
        pageFilters,
        key: `${tab}|${word}|${filterKey}`
    };
}

export function artworkHref(page: SearchPage, id: string): string {
    return `${page.localePrefix}/artworks/${id}`;
}

export function userHref(page: SearchPage, userId: string): string {
    return `${page.localePrefix}/users/${userId}`;
}

/** URL of the Illustrations tab for the same search (used from the Top tab). */
export function illustrationsTabHref(page: SearchPage): string {
    const params = new URLSearchParams(page.pageFilters);
    const query = params.toString();
    return `${page.localePrefix}/tags/${encodeURIComponent(page.word)}/illustrations${query ? "?" + query : ""}`;
}
