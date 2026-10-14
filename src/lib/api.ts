// Pixiv ajax API: response types, URL builders and a single `fetchJson`.
// All requests go through RequestQueue (see requestQueue.ts) so they are
// serialized, paced and abortable. Modeled on PixivBatchDownloader's API.ts
// (fetch + same-origin credentials, explicit status handling) — re-implemented.

import type { ApiPath } from "./pageType";

/** One work as returned inside search / popular / recommend lists. */
export interface WorkItem {
    id: string;
    title: string;
    /** 0 illustration, 1 manga, 2 ugoira */
    illustType: 0 | 1 | 2;
    /** 0 all ages, 1 R-18, 2 R-18G */
    xRestrict: 0 | 1 | 2;
    /** 0 unknown, 1 human, 2 AI-generated */
    aiType?: 0 | 1 | 2;
    url: string;
    tags: string[];
    userId: string;
    userName: string;
    pageCount: number;
    alt?: string;
    createDate?: string;
    profileImageUrl?: string;
    isAdContainer?: boolean;
    isMasked?: boolean;
    width?: number;
    height?: number;
}

interface ListEnvelope {
    data: WorkItem[];
    total: number;
}

export interface SearchResponse {
    error: boolean;
    message?: string;
    body?: {
        illustManga?: ListEnvelope;
        illust?: ListEnvelope;
        manga?: ListEnvelope;
        popular?: {
            permanent?: WorkItem[];
            recent?: WorkItem[];
        };
    };
}

export interface RecommendResponse {
    error: boolean;
    body?: {
        illusts?: WorkItem[];
    };
}

export class ApiError extends Error {
    constructor(public readonly status: number, public readonly url: string, message?: string) {
        super(message || `Pixiv returned HTTP ${status}`);
        this.name = "ApiError";
    }
}

export const ORIGIN = "https://www.pixiv.net";

export interface SearchParams {
    word: string;
    apiPath: ApiPath;
    type: "all" | "illust_and_ugoira" | "manga";
    page?: number;
    order?: "date_d" | "date" | "popular_d";
    /** Extra query parameters (mode, scd, ecd, ratio, …). Empty values are skipped. */
    extra?: Record<string, string | undefined>;
}

export function searchUrl(p: SearchParams): string {
    const url = new URL(`${ORIGIN}/ajax/search/${p.apiPath}/${encodeURIComponent(p.word)}`);
    url.searchParams.set("word", p.word);
    url.searchParams.set("order", p.order || "date_d");
    url.searchParams.set("mode", "all");
    url.searchParams.set("p", String(p.page || 1));
    url.searchParams.set("s_mode", "s_tag");
    url.searchParams.set("type", p.type);
    for (const [key, value] of Object.entries(p.extra || {})) {
        if (value) url.searchParams.set(key, value);
    }
    url.searchParams.set("lang", "en");
    return url.toString();
}

export function recommendUrl(illustId: string, limit = 18): string {
    return `${ORIGIN}/ajax/illust/${encodeURIComponent(illustId)}/recommend/init?limit=${limit}&lang=en`;
}

/** The work list of a search response, whichever key Pixiv used for this apiPath. */
export function readWorkList(data: SearchResponse | undefined): WorkItem[] {
    const body = data && !data.error ? data.body : undefined;
    const list = body?.illust?.data ?? body?.illustManga?.data ?? body?.manga?.data;
    return Array.isArray(list) ? list : [];
}

export function readPopular(data: SearchResponse | undefined): { permanent: WorkItem[]; recent: WorkItem[] } {
    const popular = data && !data.error ? data.body?.popular : undefined;
    return {
        permanent: Array.isArray(popular?.permanent) ? popular.permanent : [],
        recent: Array.isArray(popular?.recent) ? popular.recent : []
    };
}

export function readRecommended(data: RecommendResponse | undefined): WorkItem[] {
    const list = data && !data.error ? data.body?.illusts : undefined;
    return Array.isArray(list) ? list : [];
}

const THUMB_RE = /^(https:\/\/i\.pximg\.net)\/c\/[^/]+\/(?:img-master|custom-thumb)\/img\/(\d{4}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/\d+(?:_p\d+)?)_(?:square|custom|master)1200\.(jpg|png|gif)$/;

/**
 * Larger thumbnail for a work. Pixiv's lists hand out
 * `/c/250x250_80_a2/img-master/img/<date>/<id>_p0_square1200.jpg` (or the
 * `custom-thumb/..._custom1200` variant when the author picked a crop).
 * The 540 px master variant exists for every work, so — like
 * PixivBatchDownloader's convertThumbURLTo540px — rebuild the URL as
 * `/c/540x540_70/img-master/img/<date>/<id>_master1200.jpg`.
 * Unknown shapes are returned unchanged.
 */
export function thumbnailAt(url: string, size: 360 | 540 = 540): string {
    const match = THUMB_RE.exec(url);
    if (!match) return url;
    return `${match[1]}/c/${size}x${size}_70/img-master/img/${match[2]}_master1200.${match[3]}`;
}

/**
 * GET JSON from Pixiv with the page's cookies. Throws ApiError for non-2xx
 * (including Pixiv's `{ error: true }` envelope), TypeError for network failure.
 */
export async function fetchJson<T extends { error?: boolean; message?: string }>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal
    });
    if (!response.ok) {
        throw new ApiError(response.status, url);
    }
    const data = (await response.json()) as T;
    if (data && data.error) {
        throw new ApiError(response.status, url, data.message || "Pixiv returned error: true");
    }
    return data;
}
