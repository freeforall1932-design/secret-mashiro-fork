// Pure-logic unit tests. Bundled by `node scripts/build.mjs --test` into
// test/build/unit.test.mjs and executed with Node's built-in test runner.

import { test } from "node:test";
import assert from "node:assert/strict";

import { BUCKETS, bucketLabel, bucketOfTag, bucketsFrom, highestBucket, stripBucketKeyword } from "../src/popular/buckets";
import { checkWork, type FilterOptions } from "../src/popular/filter";
import { illustrationsTabHref, parsePage, type SearchPage } from "../src/lib/pageType";
import { DEFAULT_SETTINGS, normalizeSettings, parseTagList } from "../src/lib/settings";
import { ApiError, readPopular, readRecommended, readWorkList, searchUrl, thumbnailAt, type WorkItem } from "../src/lib/api";
import { setLanguage, t } from "../src/lib/i18n";
import { LANG_TEXT } from "../src/lib/langText";
import { RequestQueue, QueueAbortedError } from "../src/lib/requestQueue";

function loc(pathname: string, search = ""): { pathname: string; search: string } {
    return { pathname, search };
}

function search(pathname: string, search = ""): SearchPage {
    const page = parsePage(loc(pathname, search));
    assert.equal(page.kind, "search", `${pathname}${search} should be a search page`);
    return page as SearchPage;
}

function work(overrides: Partial<WorkItem> = {}): WorkItem {
    return {
        id: "1",
        title: "t",
        illustType: 0,
        xRestrict: 0,
        aiType: 1,
        url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2024/01/01/00/00/00/1_p0_square1200.jpg",
        tags: ["tag"],
        userId: "9",
        userName: "u",
        pageCount: 1,
        createDate: "2024-05-01T00:00:00+09:00",
        ...overrides
    };
}

const FILTER: FilterOptions = {
    tab: "illustrations",
    hideR18: false,
    hideR18G: false,
    hideAI: false,
    hideUgoira: false,
    excludeTags: [],
    minPageCount: 0,
    dateFrom: "",
    dateTo: ""
};

// ---------------------------------------------------------------- buckets

test("buckets: ordered highest first and well-formed", () => {
    const values = BUCKETS.map(Number);
    assert.deepEqual([...values].sort((a, b) => b - a), values);
    assert.equal(bucketsFrom("50").length, BUCKETS.length);
    assert.deepEqual(bucketsFrom("10000"), ["100000", "50000", "30000", "10000"]);
});

test("buckets: tag parsing", () => {
    assert.equal(bucketOfTag("1000users入り"), "1000");
    assert.equal(bucketOfTag(" 50users入り "), "50");
    assert.equal(bucketOfTag("777users入り"), null, "unknown bucket values are ignored");
    assert.equal(bucketOfTag("users入り"), null);
    assert.equal(highestBucket(["a", "500users入り", "30000users入り", "100users入り"]), "30000");
    assert.equal(highestBucket([]), null);
});

test("buckets: query keyword stripping and labels", () => {
    assert.equal(stripBucketKeyword("ゆるゆり 1000users入り"), "ゆるゆり");
    assert.equal(stripBucketKeyword("ゆるゆり"), "ゆるゆり");
    assert.equal(stripBucketKeyword("1000users入り ゆるゆり"), "1000users入り ゆるゆり", "only a trailing keyword is removed");
    assert.equal(bucketLabel("10000"), "10k+");
    assert.equal(bucketLabel("500"), "500+");
});

// ---------------------------------------------------------------- page type

test("pageType: /tags/<word>/<tab> variants", () => {
    const top = search("/tags/%E3%82%86%E3%82%8B%E3%82%86%E3%82%8A");
    assert.equal(top.word, "ゆるゆり");
    assert.equal(top.tab, "top");
    assert.equal(top.apiPath, "artworks");
    assert.equal(top.type, "all");

    const artworks = search("/tags/x/artworks");
    assert.equal(artworks.tab, "artworks");
    assert.equal(artworks.apiPath, "artworks");

    const illustrations = search("/en/tags/x/illustrations/");
    assert.equal(illustrations.tab, "illustrations");
    assert.equal(illustrations.apiPath, "illustrations");
    assert.equal(illustrations.type, "illust_and_ugoira");
    assert.equal(illustrations.localePrefix, "/en");

    const manga = search("/tags/x/manga");
    assert.equal(manga.apiPath, "manga");
    assert.equal(manga.type, "manga");

    assert.equal(parsePage(loc("/tags/x/novels")).kind, "other");
    assert.equal(parsePage(loc("/artworks/123")).kind, "other");
    assert.equal(parsePage(loc("/")).kind, "other");
});

test("pageType: legacy /search?q= and bucket keyword in word", () => {
    const legacy = search("/search", "?q=%E3%82%A8%E3%83%B4%E3%82%A1&type=illust_and_ugoira&s_mode=s_tag");
    assert.equal(legacy.word, "エヴァ");
    assert.equal(legacy.tab, "illustrations");
    assert.equal(legacy.pageFilters.s_mode, "s_tag");

    assert.equal(search("/search", "?q=x&type=manga").apiPath, "manga");
    assert.equal(search("/search", "?q=x&type=all").tab, "artworks");
    assert.equal(parsePage(loc("/search", "?q=x&type=novel")).kind, "other");

    const stripped = search("/tags/%E3%82%86%E3%82%8B%E3%82%86%E3%82%8A%2010000users%E5%85%A5%E3%82%8A/illustrations");
    assert.equal(stripped.word, "ゆるゆり", "trailing users入り keyword is removed from the word");
});

test("pageType: page filters are forwarded, key changes with them", () => {
    const a = search("/tags/x/illustrations", "?mode=safe&scd=2024-01-01&order=popular_d&p=3");
    assert.deepEqual(a.pageFilters, { mode: "safe", scd: "2024-01-01" });
    const b = search("/tags/x/illustrations", "?p=4");
    assert.notEqual(a.key, b.key);
    assert.equal(b.key, search("/tags/x/illustrations").key, "pagination does not change identity");
    assert.equal(illustrationsTabHref(a), "/tags/x/illustrations?mode=safe&scd=2024-01-01");
    assert.equal(illustrationsTabHref(search("/en/tags/%E6%A1%9C")), "/en/tags/%E6%A1%9C/illustrations");
});

// ---------------------------------------------------------------- api helpers

test("api: searchUrl shape", () => {
    const url = new URL(searchUrl({ word: "ゆるゆり 1000users入り", apiPath: "illustrations", type: "illust_and_ugoira", page: 2, extra: { mode: "safe", empty: "" } }));
    assert.equal(url.origin, "https://www.pixiv.net");
    assert.equal(url.pathname, "/ajax/search/illustrations/" + encodeURIComponent("ゆるゆり 1000users入り"));
    assert.equal(url.searchParams.get("word"), "ゆるゆり 1000users入り");
    assert.equal(url.searchParams.get("p"), "2");
    assert.equal(url.searchParams.get("order"), "date_d");
    assert.equal(url.searchParams.get("s_mode"), "s_tag");
    assert.equal(url.searchParams.get("type"), "illust_and_ugoira");
    assert.equal(url.searchParams.get("mode"), "safe");
    assert.equal(url.searchParams.has("empty"), false);
});

test("api: response readers tolerate every list key and bad input", () => {
    const item = work();
    assert.deepEqual(readWorkList({ error: false, body: { illust: { data: [item], total: 1 } } }), [item]);
    assert.deepEqual(readWorkList({ error: false, body: { illustManga: { data: [item], total: 1 } } }), [item]);
    assert.deepEqual(readWorkList({ error: false, body: { manga: { data: [item], total: 1 } } }), [item]);
    assert.deepEqual(readWorkList({ error: true }), []);
    assert.deepEqual(readWorkList(undefined), []);
    assert.deepEqual(readPopular({ error: false, body: { popular: { permanent: [item] } } }), { permanent: [item], recent: [] });
    assert.deepEqual(readRecommended({ error: false, body: { illusts: [item] } }), [item]);
    assert.deepEqual(readRecommended({ error: false, body: {} }), []);
    assert.equal(thumbnailAt(item.url, 540), item.url.replace("/c/250x250_80_a2/", "/c/540x540_70/"));
});

// ---------------------------------------------------------------- filter

test("filter: tab/type rules", () => {
    assert.equal(checkWork(work(), FILTER), null);
    assert.equal(checkWork(work({ illustType: 1 }), FILTER), "type", "manga is hidden on the illustrations tab");
    assert.equal(checkWork(work({ illustType: 1 }), { ...FILTER, tab: "manga" }), null);
    assert.equal(checkWork(work(), { ...FILTER, tab: "manga" }), "type");
    assert.equal(checkWork(work({ illustType: 1 }), { ...FILTER, tab: "artworks" }), null);
    assert.equal(checkWork(work({ illustType: 2 }), { ...FILTER, tab: "top" }), null);
});

test("filter: user filters", () => {
    assert.equal(checkWork(work({ xRestrict: 1 }), { ...FILTER, hideR18: true }), "r18");
    assert.equal(checkWork(work({ xRestrict: 2 }), { ...FILTER, hideR18G: true }), "r18g");
    assert.equal(checkWork(work({ xRestrict: 2 }), { ...FILTER, hideR18: true }), "r18", "R-18G counts as R-18");
    assert.equal(checkWork(work({ aiType: 2 }), { ...FILTER, hideAI: true }), "ai");
    assert.equal(checkWork(work({ illustType: 2 }), { ...FILTER, hideUgoira: true }), "ugoira");
    assert.equal(checkWork(work({ tags: ["Foo"] }), { ...FILTER, excludeTags: ["foo"] }), "tag");
    assert.equal(checkWork(work({ pageCount: 2 }), { ...FILTER, minPageCount: 3 }), "pages");
    assert.equal(checkWork(work(), { ...FILTER, dateFrom: "2024-06-01" }), "date");
    assert.equal(checkWork(work(), { ...FILTER, dateTo: "2024-04-30" }), "date");
    assert.equal(checkWork(work(), { ...FILTER, dateFrom: "2024-05-01", dateTo: "2024-05-01" }), null);
});

test("filter: Pixiv junk is always rejected", () => {
    assert.equal(checkWork(null, FILTER), "invalid");
    assert.equal(checkWork({ id: "1" } as unknown as WorkItem, FILTER), "invalid");
    assert.equal(checkWork(work({ isAdContainer: true }), FILTER), "ad");
    assert.equal(checkWork(work({ isMasked: true }), FILTER), "masked");
    assert.equal(checkWork(work({ tags: ["虚偽users入りタグ"] }), FILTER), "fake");
});

// ---------------------------------------------------------------- settings

test("settings: normalize clamps and falls back", () => {
    assert.deepEqual(normalizeSettings(undefined), DEFAULT_SETTINGS);
    assert.deepEqual(normalizeSettings("garbage"), DEFAULT_SETTINGS);
    const s = normalizeSettings({
        resultLimit: 999999,
        maxPagesPerBucket: 0,
        requestGapMs: "350",
        minBucket: "777",
        altMode: "sometimes",
        hideR18: "yes",
        dateFrom: "2024-1-1",
        dateTo: "2024-12-31",
        cardSize: "large",
        language: "ja",
        theme: "dark",
        excludeTags: "a, b"
    });
    assert.equal(s.resultLimit, 5000);
    assert.equal(s.maxPagesPerBucket, 1);
    assert.equal(s.requestGapMs, 350);
    assert.equal(s.minBucket, DEFAULT_SETTINGS.minBucket);
    assert.equal(s.altMode, DEFAULT_SETTINGS.altMode);
    assert.equal(s.hideR18, DEFAULT_SETTINGS.hideR18);
    assert.equal(s.dateFrom, "");
    assert.equal(s.dateTo, "2024-12-31");
    assert.equal(s.cardSize, "large");
    assert.equal(s.language, "ja");
    assert.equal(s.theme, "dark");
    assert.equal(s.excludeTags, "a, b");
});

test("settings: parseTagList", () => {
    assert.deepEqual(parseTagList(" #Foo, bar\nBAR、baz ,,"), ["foo", "bar", "baz"]);
    assert.deepEqual(parseTagList(""), []);
});

// ---------------------------------------------------------------- i18n

test("i18n: every key has three columns, placeholders substitute", () => {
    for (const [key, row] of Object.entries(LANG_TEXT)) {
        assert.equal(row.length, 3, `${key} should have en/ja/zh-CN`);
        assert.ok(row[0], `${key} needs an English text`);
    }
    setLanguage("ja");
    assert.equal(t("popular"), "人気順");
    setLanguage("zh-CN");
    assert.equal(t("popular"), "热门");
    setLanguage("en");
    assert.equal(t("popular"), "Popular");
    assert.equal(t("statusDone", { found: 42 }), "Done — 42 works");
    assert.equal(t("statusFetchingBucket", { bucket: "1000", done: 1, total: 3, found: 7 }), "Fetching 1000users入り (1/3) — 7 works");
});

// ---------------------------------------------------------------- request queue

test("requestQueue: priority order, 429 retry, errors and clear", async () => {
    const g = globalThis as unknown as Record<string, unknown>;
    if (!g.window) g.window = globalThis;
    const order: string[] = [];
    let limitedCalls = 0;
    g.fetch = async (url: string, init?: RequestInit): Promise<Response> => {
        const name = new URL(url).searchParams.get("name") || url;
        if (name === "slow") {
            await new Promise<void>((resolve, reject) => {
                const timer = setTimeout(resolve, 60);
                init?.signal?.addEventListener("abort", () => {
                    clearTimeout(timer);
                    reject(new DOMException("Aborted", "AbortError"));
                });
            });
        }
        if (name === "limited" && limitedCalls++ === 0) return new Response("", { status: 429 });
        if (name === "broken") return new Response("", { status: 403 });
        if (name === "envelope") return new Response(JSON.stringify({ error: true, message: "nope" }), { status: 200 });
        order.push(name);
        return new Response(JSON.stringify({ error: false, name }), { status: 200, headers: { "content-type": "application/json" } });
    };

    const q = new RequestQueue();
    q.gapMs = 5;
    q.retryAfterMs = 30;
    const u = (name: string) => `https://www.pixiv.net/ajax/test?name=${name}`;

    // The first job starts immediately; the rest are ordered by priority while it is in flight.
    const first = q.enqueue(u("first"), 2);
    const low = q.enqueue(u("low"), 2);
    const high = q.enqueue(u("high"), 0);
    const mid = q.enqueue(u("mid"), 1);
    await Promise.all([first, low, high, mid]);
    assert.deepEqual(order, ["first", "high", "mid", "low"]);
    assert.equal(q.completed, 4);
    assert.equal(q.pending, 0);

    // 429 pauses the queue and retries the same request after retryAfterMs.
    let rateLimitedEvents = 0;
    q.on("rateLimited", () => rateLimitedEvents++);
    const result = await q.enqueue<{ error: boolean; name: string }>(u("limited"), 0);
    assert.equal(result.name, "limited");
    assert.equal(rateLimitedEvents, 1);
    assert.equal(limitedCalls, 2);
    assert.equal(q.isPaused, false);

    // Other errors reject with ApiError carrying the status.
    await assert.rejects(q.enqueue(u("broken"), 0), (err: unknown) => err instanceof ApiError && err.status === 403);
    await assert.rejects(q.enqueue(u("envelope"), 0), (err: unknown) => err instanceof ApiError && /nope/.test(err.message));

    // clear() aborts the in-flight request and drops queued jobs.
    const slow = q.enqueue(u("slow"), 0);
    const pending = q.enqueue(u("pending"), 1);
    q.clear();
    await assert.rejects(pending, QueueAbortedError);
    await assert.rejects(slow, QueueAbortedError);
    assert.equal(q.pending, 0);
    assert.equal(order.includes("pending"), false);
});
