#!/usr/bin/env node
// Mashiro UI demo harness — a zero-dependency mock of a Pixiv search page.
//
// It serves a page that imitates Pixiv's 2026 search layout and loads the REAL
// built extension (dist/js/content.js, dist/style/content.css, dist/js/pageHook.js)
// against mock Pixiv ajax endpoints, so the extension UI can be previewed and
// tested without Pixiv. Run `npm run build` first.
//
// Usage:  node demo/server.js [port]     (default 3000, binds 0.0.0.0)
//
// This folder is NOT part of the extension.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEMO = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DEMO, "..");
const DIST = path.join(ROOT, "dist");
export const DEFAULT_TAG = "ゆるゆり";

const BUCKETS = ["100000", "50000", "30000", "10000", "5000", "1000", "500", "100", "50"];
// Works per bucket page. 1000 returns two full pages so pagination is exercised.
const BUCKET_COUNTS = {
    "100000": [2], "50000": [3], "30000": [4], "10000": [8], "5000": [12],
    "1000": [60, 14], "500": [18], "100": [18], "50": [12]
};

const TITLES = [
    "夏の終わり", "おはよう", "詰め合わせ", "落書きまとめ", "制服", "ランチタイム", "星空",
    "雨宿り", "お祭り", "放課後", "うどん", "桜", "ひなたぼっこ", "図書室", "冬服", "お花見",
    "おやすみ", "屋上", "通学路", "海", "Sketch", "Daily", "practice", "cafe", "snow day"
];
const USERS = [
    { id: "1300001", name: "mikan_draws" }, { id: "1300002", name: "sora" },
    { id: "1300003", name: "yuki.p" }, { id: "1300004", name: "aoi" },
    { id: "1300005", name: "ren" }, { id: "1300006", name: "Kuro" },
    { id: "1300007", name: "hiro_art" }, { id: "1300008", name: "mochi" },
    { id: "1300009", name: "Yui" }, { id: "1300010", name: "nanoha_" }
];

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

// ---------- deterministic pseudo-randomness ----------

function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const pick = (rnd, list) => list[Math.floor(rnd() * list.length)];

// ---------- scenarios ----------
// The tag decides which Mashiro state the page demonstrates:
//   default  -> users入り buckets available (orange)
//   blue     -> only Pixiv's popular list + recommendations (blue)
//   grey     -> nothing (grey)
//   slow     -> like default, but every response takes 1.5 s
//   ratelimit-> the third bucket request answers 429 once (tests the pause/retry)

export function scenarioFor(tag) {
    if (/御坂美琴|blue/i.test(tag)) return { users: false, popular: true };
    if (/zzz|none|grey|gray|nothing/i.test(tag)) return { users: false, popular: false };
    if (/slow/i.test(tag)) return { users: true, popular: true, delayMs: 1500 };
    if (/ratelimit|429/i.test(tag)) return { users: true, popular: true, rateLimitOnce: true };
    if (/forbidden|403/i.test(tag)) return { users: true, popular: true, forbidden: true };
    return { users: true, popular: true };
}

// ---------- mock Pixiv data ----------

export function makeItem(base, key, index, bucket) {
    const seed = `${base}|${key}|${index}`;
    const rnd = mulberry32(hash(seed));
    const id = String(100000000 + (hash(seed + "#id") % 30000000));
    const user = pick(rnd, USERS);
    const title = pick(rnd, TITLES);
    const illustType = rnd() < 0.2 ? 1 : rnd() < 0.08 ? 2 : 0; // ~20% manga, a few ugoira
    const pageCount = rnd() < 0.35 ? 2 + Math.floor(rnd() * 10) : 1;
    const xRestrict = rnd() < 0.12 ? 1 : 0;
    const aiType = rnd() < 0.1 ? 2 : 1;
    const tags = [base, pick(rnd, ["女の子", "オリジナル", "百合", "風景", "制服", "落書き"])];
    if (bucket) tags.push(bucket + "users入り");
    if (illustType === 1) tags.push("漫画");
    if (xRestrict) tags.push("R-18");
    if (aiType === 2) tags.push("AIイラスト");
    const year = 2019 + Math.floor(rnd() * 8);
    const month = 1 + Math.floor(rnd() * 12);

    return {
        id,
        title,
        illustType,
        xRestrict,
        restrict: 0,
        sl: xRestrict ? 6 : 2,
        url: `/thumb/${id}.svg`,
        description: "",
        tags,
        userId: user.id,
        userName: user.name,
        width: 1200,
        height: 1600,
        pageCount,
        isBookmarkable: true,
        bookmarkData: null,
        alt: `#${base} ${title} - ${user.name}`,
        isMasked: false,
        isAdContainer: false,
        aiType,
        createDate: `${year}-${String(month).padStart(2, "0")}-15T12:00:00+09:00`,
        updateDate: `${year}-${String(month).padStart(2, "0")}-15T12:00:00+09:00`,
        isUnlisted: false,
        profileImageUrl: `/pfp/${user.id}.svg`
    };
}

function bucketPage(base, bucket, page) {
    const counts = BUCKET_COUNTS[bucket] || [];
    const count = counts[page - 1] || 0;
    const offset = counts.slice(0, page - 1).reduce((a, b) => a + b, 0);
    const items = [];
    for (let i = 0; i < count; i++) items.push(makeItem(base, "bucket" + bucket, offset + i, bucket));
    return items;
}

function weightedBucket(rnd) {
    return pick(rnd, ["50", "100", "100", "500", "500", "1000", "1000", "5000", "10000", "30000"]);
}

function popularItems(base, key, count) {
    const hasBuckets = scenarioFor(base).users;
    const items = [];
    for (let i = 0; i < count; i++) {
        const rnd = mulberry32(hash(`${base}|${key}|${i}|sfx`));
        items.push(makeItem(base, key, i, hasBuckets ? weightedBucket(rnd) : null));
    }
    return items;
}

const RECO_POOL_SIZE = 15;
function recoItems(base, illustId) {
    const hasBuckets = scenarioFor(base).users;
    const rnd = mulberry32(hash("reco|" + illustId));
    const items = [];
    for (let n = 0; n < 3; n++) {
        const k = Math.floor(rnd() * RECO_POOL_SIZE);
        const srnd = mulberry32(hash(`${base}|reco|${k}|sfx`));
        items.push(makeItem(base, "reco", k, hasBuckets ? weightedBucket(srnd) : null));
    }
    return items;
}

/** Key Pixiv uses for the list depending on the API path. */
function listKey(apiPath) {
    return apiPath === "illustrations" ? "illust" : apiPath === "manga" ? "manga" : "illustManga";
}

function filterByPath(items, apiPath) {
    if (apiPath === "illustrations") return items.filter((i) => i.illustType !== 1);
    if (apiPath === "manga") return items.filter((i) => i.illustType === 1);
    return items;
}

export function searchResponse(apiPath, word, page) {
    const match = String(word).match(/^(.*?)\s*(\d*)users入り$/);
    const base = (match ? match[1] : word).trim();
    const bucket = match ? match[2] : null;
    const scenario = scenarioFor(base);
    const key = listKey(apiPath);
    const envelope = (data, total) => ({
        error: false,
        body: {
            [key]: { data, total },
            popular: { permanent: [], recent: [] },
            relatedTags: [], tagTranslation: {}, zoneConfig: {}, extraData: {}
        }
    });

    if (bucket === "") {
        // Probe: partial match on "users入り" -> a sample from several buckets.
        const sample = scenario.users
            ? ["10000", "1000", "500", "100", "50"].flatMap((b) => bucketPage(base, b, 1).slice(0, 2))
            : [];
        return envelope(filterByPath(sample, apiPath), sample.length);
    }
    if (bucket) {
        const items = scenario.users ? bucketPage(base, bucket, page) : [];
        // Pixiv does not filter the bucket search by illustType for us; the per-type
        // endpoint does. Manga endpoint still returns full pages so pagination logic runs.
        const list = apiPath === "manga" ? items.map((i) => ({ ...i, illustType: 1 })) : filterByPath(items, apiPath);
        return envelope(list, list.length);
    }

    const response = envelope(filterByPath(popularItems(base, "newest", 20), apiPath), 12345);
    response.body.popular = {
        permanent: scenario.popular ? popularItems(base, "permanent", 12) : [],
        recent: scenario.popular ? popularItems(base, "recent", 6) : []
    };
    return response;
}

// ---------- generated artwork ----------

function svgThumb(id) {
    const rnd = mulberry32(hash("art|" + id));
    const h1 = Math.floor(rnd() * 360);
    const h2 = (h1 + 40 + Math.floor(rnd() * 90)) % 360;
    const h3 = (h1 + 180 + Math.floor(rnd() * 60)) % 360;
    let shapes = "";
    for (let i = 0; i < 7; i++) {
        const cx = Math.floor(rnd() * 360), cy = Math.floor(rnd() * 360);
        const r = 30 + Math.floor(rnd() * 110);
        const hue = pick(rnd, [h1, h2, h3]);
        const light = 55 + Math.floor(rnd() * 35);
        const op = (0.25 + rnd() * 0.5).toFixed(2);
        if (rnd() < 0.5) {
            shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${hue} 80% ${light}%)" opacity="${op}"/>`;
        } else {
            const w = r * 2, hgt = Math.floor(r * (0.6 + rnd()));
            const rot = Math.floor(rnd() * 90 - 45);
            shapes += `<rect x="${cx - r}" y="${cy - hgt / 2}" width="${w}" height="${hgt}" rx="${Math.floor(r / 3)}" fill="hsl(${hue} 75% ${light}%)" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})"/>`;
        }
    }
    const skin = `hsl(${20 + Math.floor(rnd() * 15)} 70% 88%)`;
    const hair = `hsl(${Math.floor(rnd() * 360)} 55% ${30 + Math.floor(rnd() * 40)}%)`;
    const figure =
        `<g transform="translate(180 215)">` +
        `<ellipse cx="0" cy="150" rx="95" ry="60" fill="hsl(${h2} 50% 40%)" opacity="0.85"/>` +
        `<rect x="-60" y="30" width="120" height="130" rx="40" fill="hsl(${h3} 45% 55%)"/>` +
        `<circle cx="0" cy="-10" r="62" fill="${hair}"/>` +
        `<circle cx="0" cy="5" r="50" fill="${skin}"/>` +
        `<path d="M-62 -10 Q-70 60 -30 70 L-30 0 Z" fill="${hair}"/>` +
        `<path d="M62 -10 Q70 60 30 70 L30 0 Z" fill="${hair}"/>` +
        `<circle cx="-18" cy="10" r="6" fill="#333"/><circle cx="18" cy="10" r="6" fill="#333"/>` +
        `</g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="hsl(${h1} 70% 85%)"/><stop offset="1" stop-color="hsl(${h2} 70% 70%)"/></linearGradient></defs>` +
        `<rect width="360" height="360" fill="url(#g)"/>${shapes}${figure}` +
        `<text x="8" y="350" font-family="sans-serif" font-size="12" fill="rgba(0,0,0,0.45)">mock #${id}</text></svg>`;
}

function svgAvatar(userId) {
    const rnd = mulberry32(hash("pfp|" + userId));
    const hue = Math.floor(rnd() * 360);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">` +
        `<rect width="80" height="80" fill="hsl(${hue} 60% 70%)"/>` +
        `<circle cx="40" cy="32" r="16" fill="hsl(${hue} 30% 95%)"/>` +
        `<ellipse cx="40" cy="78" rx="28" ry="24" fill="hsl(${hue} 30% 95%)"/></svg>`;
}

// ---------- http ----------

function send(res, status, type, body, extraHeaders) {
    res.writeHead(status, Object.assign({
        "Content-Type": type,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
    }, extraHeaders || {}));
    res.end(body);
}

function sendFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) return send(res, 404, "text/plain; charset=utf-8", "Not found: " + path.relative(ROOT, filePath) + " (did you run `npm run build`?)");
        send(res, 200, MIME[path.extname(filePath)] || "application/octet-stream", data);
    });
}

function stubPage(title, body) {
    return `<!doctype html><meta charset=utf-8><title>${title}</title>` +
        `<body style="font:16px/1.5 sans-serif;padding:40px;max-width:640px;margin:auto">` +
        `<h1 style="color:#0096fa">Mashiro demo</h1><p>${body}</p><p><a href="javascript:history.back()">&larr; Back</a></p></body>`;
}

const rateLimited = new Set();

export function createServer() {
    return http.createServer((req, res) => {
        const url = new URL(req.url, "http://localhost");
        let pathname;
        try {
            pathname = decodeURIComponent(url.pathname);
        } catch {
            return send(res, 400, "text/plain", "Bad path");
        }

        if (pathname === "/") {
            res.writeHead(302, { Location: "/tags/" + encodeURIComponent(DEFAULT_TAG) + "/illustrations" });
            return res.end();
        }

        if (/^\/(?:[a-z]{2}\/)?tags\/[^/]+(?:\/(?:illustrations|manga|artworks|novels|top))?\/?$/.test(pathname)
            || /^\/(?:[a-z]{2}\/)?search\/?$/.test(pathname)) {
            return sendFile(res, path.join(DEMO, "pixiv-mock.html"));
        }

        let m;
        if ((m = pathname.match(/^\/ajax\/search\/(artworks|illustrations|manga)\/(.+)$/))) {
            const word = url.searchParams.get("word") || m[2];
            const page = parseInt(url.searchParams.get("p") || "1", 10) || 1;
            const scenario = scenarioFor(word);
            const respond = () => {
                if (scenario.forbidden) return send(res, 403, MIME[".json"], JSON.stringify({ error: true, message: "forbidden" }));
                if (scenario.rateLimitOnce && /30000users入り/.test(word) && !rateLimited.has(word)) {
                    rateLimited.add(word);
                    return send(res, 429, MIME[".json"], JSON.stringify({ error: true, message: "Rate Limit" }));
                }
                send(res, 200, MIME[".json"], JSON.stringify(searchResponse(m[1], word, page)));
            };
            return scenario.delayMs ? setTimeout(respond, scenario.delayMs) : respond();
        }
        if ((m = pathname.match(/^\/ajax\/illust\/(\d+)\/recommend\/init$/))) {
            const base = url.searchParams.get("mashiroTag") || DEFAULT_TAG;
            return send(res, 200, MIME[".json"], JSON.stringify({
                error: false,
                body: { illusts: recoItems(base, m[1]), nextIds: [], details: {} }
            }));
        }
        if ((m = pathname.match(/^\/thumb\/(\d+)\.svg$/))) {
            return send(res, 200, MIME[".svg"], svgThumb(m[1]), { "Cache-Control": "public, max-age=86400" });
        }
        if ((m = pathname.match(/^\/pfp\/(\d+)\.svg$/))) {
            return send(res, 200, MIME[".svg"], svgAvatar(m[1]), { "Cache-Control": "public, max-age=86400" });
        }
        if ((m = pathname.match(/^\/(?:[a-z]{2}\/)?artworks\/(\d+)$/))) {
            return send(res, 200, MIME[".html"], stubPage("artwork " + m[1], `On Pixiv this card would open <code>/artworks/${m[1]}</code>.`));
        }
        if ((m = pathname.match(/^\/(?:[a-z]{2}\/)?users\/(\d+)$/))) {
            return send(res, 200, MIME[".html"], stubPage("user " + m[1], `On Pixiv this link would open the author page <code>/users/${m[1]}</code>.`));
        }
        if (/^\/ext\/(js|style|images)\/[\w.-]+$/.test(pathname) || pathname === "/ext/manifest.json") {
            return sendFile(res, path.join(DIST, pathname.slice("/ext/".length)));
        }
        if (/^\/demo\/[\w.-]+$/.test(pathname)) {
            return sendFile(res, path.join(DEMO, pathname.slice("/demo/".length)));
        }
        send(res, 404, "text/plain; charset=utf-8", "Not found: " + pathname);
    });
}

/** Start listening; resolves with the bound port (pass 0 for an ephemeral one). */
export function start(port = 3000, host = "0.0.0.0") {
    return new Promise((resolve) => {
        const server = createServer();
        server.listen(port, host, () => resolve({ server, port: server.address().port }));
    });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const port = Number(process.argv[2] || process.env.PORT || 3000);
    start(port).then(({ port: bound }) => {
        console.log(`Mashiro demo harness listening on http://0.0.0.0:${bound}`);
        console.log(`Open /tags/${DEFAULT_TAG}/illustrations  (serving dist/ — run \`npm run build\` after source changes)`);
    });
}
