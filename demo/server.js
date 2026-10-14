#!/usr/bin/env node
// Mashiro UI demo harness — a zero-dependency mock of a Pixiv search page.
//
// It serves a page that imitates Pixiv's 2026 search layout and loads the REAL
// extension files (foreground.js, foreground_styles.css, jquery) against mock
// Pixiv ajax endpoints, so the extension UI can be previewed without Pixiv.
//
// Usage:  node demo/server.js [port]     (default 3000, binds 0.0.0.0)
//
// This folder is NOT part of the extension. Chrome ignores it when the repo
// root is loaded unpacked.

"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");

var PORT = Number(process.argv[2] || process.env.PORT || 3000);
var ROOT = path.resolve(__dirname, "..");
var DEMO = __dirname;
var DEFAULT_TAG = "ゆるゆり";

var SUFFIXES = ["100000", "50000", "30000", "10000", "5000", "1000", "500", "100", "50"];
// How many works each popularity bucket returns (all < 60 so Mashiro does not paginate).
var BUCKET_COUNTS = {
    "100000": 2, "50000": 3, "30000": 4, "10000": 8, "5000": 12,
    "1000": 18, "500": 18, "100": 18, "50": 12
};

var TITLES = [
    "夏の終わり", "おはよう", "詰め合わせ", "落書きまとめ", "制服", "ランチタイム", "星空",
    "雨宿り", "お祭り", "放課後", "うどん", "桜", "ひなたぼっこ", "図書室", "冬服", "お花見",
    "おやすみ", "屋上", "通学路", "海", "Sketch", "Daily", "practice", "cafe", "snow day"
];
var USERS = [
    { id: "1300001", name: "mikan_draws" }, { id: "1300002", name: "sora" },
    { id: "1300003", name: "yuki.p" }, { id: "1300004", name: "aoi" },
    { id: "1300005", name: "ren" }, { id: "1300006", name: "Kuro" },
    { id: "1300007", name: "hiro_art" }, { id: "1300008", name: "mochi" },
    { id: "1300009", name: "Yui" }, { id: "1300010", name: "nanoha_" }
];

var EXT_FILES = {
    "/ext/foreground.js": "foreground.js",
    "/ext/foreground_styles.css": "foreground_styles.css",
    "/ext/jquery-3.6.0.min.js": "jquery-3.6.0.min.js",
    "/ext/manifest.json": "manifest.json",
    "/ext/images/mashiro.png": "images/mashiro.png"
};
var MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

// ---------- deterministic pseudo-randomness ----------

function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick(rnd, list) {
    return list[Math.floor(rnd() * list.length)];
}

// ---------- scenarios ----------
// The tag decides which Mashiro state the page demonstrates:
//   default  -> `users入り` buckets available (orange) + popular/alt (blue)
//   blue     -> only popular/alt results                        (blue)
//   grey     -> nothing                                         (grey)

function scenarioFor(tag) {
    if (/御坂美琴|blue/i.test(tag)) return { users: false, popular: true };
    if (/zzz|none|grey|gray|nothing/i.test(tag)) return { users: false, popular: false };
    return { users: true, popular: true };
}

// ---------- mock Pixiv data ----------

function makeItem(base, key, index, suffix) {
    var seed = base + "|" + key + "|" + index;
    var rnd = mulberry32(hash(seed));
    var id = String(100000000 + (hash(seed + "#id") % 30000000));
    var user = pick(rnd, USERS);
    var title = pick(rnd, TITLES);
    var illustType = rnd() < 0.2 ? 1 : 0; // 20% manga, so the Manga tab filters visibly
    var pageCount = rnd() < 0.35 ? 2 + Math.floor(rnd() * 10) : 1;
    var tags = [base, pick(rnd, ["女の子", "オリジナル", "百合", "風景", "制服", "落書き"])];
    if (suffix) tags.push(suffix + "users入り");
    if (illustType === 1) tags.push("漫画");

    return {
        id: id,
        title: title,
        illustType: illustType,
        xRestrict: 0,
        restrict: 0,
        sl: 2,
        url: "/thumb/" + id + ".svg",
        description: "",
        tags: tags,
        userId: user.id,
        userName: user.name,
        width: 1200,
        height: 1600,
        pageCount: pageCount,
        isBookmarkable: true,
        bookmarkData: null,
        alt: "#" + base + " " + title + " - " + user.name,
        isMasked: false,
        isAdContainer: false,
        aiType: 1,
        createDate: "2026-09-01T00:00:00+09:00",
        updateDate: "2026-09-01T00:00:00+09:00",
        isUnlisted: false,
        profileImageUrl: "/pfp/" + user.id + ".svg"
    };
}

function bucketItems(base, suffix, count) {
    var items = [];
    for (var i = 0; i < count; i++) items.push(makeItem(base, "bucket" + suffix, i, suffix));
    return items;
}

function weightedSuffix(rnd) {
    // Popular / recommended works skew toward the lower buckets, like on Pixiv.
    var pool = ["50", "100", "100", "500", "500", "1000", "1000", "5000", "10000", "30000"];
    return pick(rnd, pool);
}

function popularItems(base, key, count) {
    var items = [];
    for (var i = 0; i < count; i++) {
        var rnd = mulberry32(hash(base + "|" + key + "|" + i + "|sfx"));
        items.push(makeItem(base, key, i, weightedSuffix(rnd)));
    }
    return items;
}

var RECO_POOL_SIZE = 15;
function recoItems(base, illustId) {
    var rnd = mulberry32(hash("reco|" + illustId));
    var items = [];
    for (var n = 0; n < 3; n++) {
        var k = Math.floor(rnd() * RECO_POOL_SIZE);
        var srnd = mulberry32(hash(base + "|reco|" + k + "|sfx"));
        items.push(makeItem(base, "reco", k, weightedSuffix(srnd)));
    }
    return items;
}

function searchResponse(word, page) {
    var match = String(word).match(/^(.*?)\s*(\d+)users入り$/);
    var base = (match ? match[1] : word).trim();
    var suffix = match ? match[2] : null;
    var scenario = scenarioFor(base);

    if (suffix) {
        var count = scenario.users && page === 1 ? (BUCKET_COUNTS[suffix] || 0) : 0;
        return {
            error: false,
            body: {
                illustManga: { data: bucketItems(base, suffix, count), total: count },
                popular: { permanent: [], recent: [] },
                relatedTags: [], tagTranslation: {}, zoneConfig: {}, extraData: {}
            }
        };
    }

    return {
        error: false,
        body: {
            illustManga: { data: popularItems(base, "newest", 20), total: 12345 },
            popular: {
                permanent: scenario.popular ? popularItems(base, "permanent", 12) : [],
                recent: scenario.popular ? popularItems(base, "recent", 6) : []
            },
            relatedTags: [], tagTranslation: {}, zoneConfig: {}, extraData: {}
        }
    };
}

// ---------- generated artwork ----------

function svgThumb(id) {
    var rnd = mulberry32(hash("art|" + id));
    var h1 = Math.floor(rnd() * 360);
    var h2 = (h1 + 40 + Math.floor(rnd() * 90)) % 360;
    var h3 = (h1 + 180 + Math.floor(rnd() * 60)) % 360;
    var shapes = "";
    for (var i = 0; i < 7; i++) {
        var cx = Math.floor(rnd() * 360), cy = Math.floor(rnd() * 360);
        var r = 30 + Math.floor(rnd() * 110);
        var hue = pick(rnd, [h1, h2, h3]);
        var light = 55 + Math.floor(rnd() * 35);
        var op = (0.25 + rnd() * 0.5).toFixed(2);
        if (rnd() < 0.5) {
            shapes += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="hsl(' + hue + ' 80% ' + light + '%)" opacity="' + op + '"/>';
        } else {
            var w = r * 2, hgt = Math.floor(r * (0.6 + rnd()));
            var rot = Math.floor(rnd() * 90 - 45);
            shapes += '<rect x="' + (cx - r) + '" y="' + (cy - hgt / 2) + '" width="' + w + '" height="' + hgt +
                '" rx="' + Math.floor(r / 3) + '" fill="hsl(' + hue + ' 75% ' + light + '%)" opacity="' + op +
                '" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"/>';
        }
    }
    // A simple "character" silhouette so it reads as an illustration thumbnail.
    var skin = "hsl(" + (20 + Math.floor(rnd() * 15)) + " 70% 88%)";
    var hair = "hsl(" + Math.floor(rnd() * 360) + " 55% " + (30 + Math.floor(rnd() * 40)) + "%)";
    var figure =
        '<g transform="translate(180 215)">' +
        '<ellipse cx="0" cy="150" rx="95" ry="60" fill="hsl(' + h2 + ' 50% 40%)" opacity="0.85"/>' +
        '<rect x="-60" y="30" width="120" height="130" rx="40" fill="hsl(' + h3 + ' 45% 55%)"/>' +
        '<circle cx="0" cy="-10" r="62" fill="' + hair + '"/>' +
        '<circle cx="0" cy="5" r="50" fill="' + skin + '"/>' +
        '<path d="M-62 -10 Q-70 60 -30 70 L-30 0 Z" fill="' + hair + '"/>' +
        '<path d="M62 -10 Q70 60 30 70 L30 0 Z" fill="' + hair + '"/>' +
        '<circle cx="-18" cy="10" r="6" fill="#333"/><circle cx="18" cy="10" r="6" fill="#333"/>' +
        '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="hsl(' + h1 + ' 70% 85%)"/>' +
        '<stop offset="1" stop-color="hsl(' + h2 + ' 70% 70%)"/></linearGradient></defs>' +
        '<rect width="360" height="360" fill="url(#g)"/>' + shapes + figure +
        '<text x="8" y="350" font-family="sans-serif" font-size="12" fill="rgba(0,0,0,0.45)">mock #' + id + '</text>' +
        '</svg>';
}

function svgAvatar(userId) {
    var rnd = mulberry32(hash("pfp|" + userId));
    var hue = Math.floor(rnd() * 360);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">' +
        '<rect width="80" height="80" fill="hsl(' + hue + ' 60% 70%)"/>' +
        '<circle cx="40" cy="32" r="16" fill="hsl(' + hue + ' 30% 95%)"/>' +
        '<ellipse cx="40" cy="78" rx="28" ry="24" fill="hsl(' + hue + ' 30% 95%)"/>' +
        '</svg>';
}

// ---------- http ----------

function send(res, status, type, body, extraHeaders) {
    var headers = Object.assign({
        "Content-Type": type,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
    }, extraHeaders || {});
    res.writeHead(status, headers);
    res.end(body);
}

function sendFile(res, filePath) {
    fs.readFile(filePath, function (err, data) {
        if (err) return send(res, 404, "text/plain; charset=utf-8", "Not found: " + path.basename(filePath));
        send(res, 200, MIME[path.extname(filePath)] || "application/octet-stream", data);
    });
}

function stubPage(title, body) {
    return "<!doctype html><meta charset=utf-8><title>" + title + "</title>" +
        "<body style=\"font:16px/1.5 sans-serif;padding:40px;max-width:640px;margin:auto\">" +
        "<h1 style=\"color:#0096fa\">Mashiro demo</h1><p>" + body + "</p>" +
        "<p><a href=\"javascript:history.back()\">&larr; Back</a></p></body>";
}

var server = http.createServer(function (req, res) {
    var url = new URL(req.url, "http://localhost");
    var pathname;
    try {
        pathname = decodeURIComponent(url.pathname);
    } catch (err) {
        return send(res, 400, "text/plain", "Bad path");
    }

    if (pathname === "/") {
        res.writeHead(302, { Location: "/tags/" + encodeURIComponent(DEFAULT_TAG) + "/illustrations" });
        return res.end();
    }

    // Pixiv-like pages (bare /tags/X is served too: Mashiro redirects it to /illustrations itself).
    if (/^\/(?:[a-z]{2}\/)?tags\/[^/]+(?:\/(?:illustrations|manga|artworks|novels|top))?\/?$/.test(pathname)
        || /^\/(?:[a-z]{2}\/)?search$/.test(pathname)) {
        return sendFile(res, path.join(DEMO, "pixiv-mock.html"));
    }

    var m;
    if ((m = pathname.match(/^\/ajax\/search\/artworks\/(.+)$/))) {
        var word = url.searchParams.get("word") || m[1];
        var page = parseInt(url.searchParams.get("p") || "1", 10) || 1;
        return send(res, 200, MIME[".json"], JSON.stringify(searchResponse(word, page)));
    }
    if ((m = pathname.match(/^\/ajax\/illust\/(\d+)\/recommend\/init$/))) {
        var base = url.searchParams.get("mashiroTag") || DEFAULT_TAG;
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
        return send(res, 200, MIME[".html"], stubPage("artwork " + m[1],
            "On Pixiv this card would open <code>/artworks/" + m[1] + "</code>."));
    }
    if ((m = pathname.match(/^\/(?:[a-z]{2}\/)?users\/(\d+)$/))) {
        return send(res, 200, MIME[".html"], stubPage("user " + m[1],
            "On Pixiv this link would open the author page <code>/users/" + m[1] + "</code>."));
    }
    if (EXT_FILES[pathname]) {
        return sendFile(res, path.join(ROOT, EXT_FILES[pathname]));
    }
    if (/^\/demo\/[\w.-]+$/.test(pathname)) {
        return sendFile(res, path.join(DEMO, pathname.slice("/demo/".length)));
    }
    send(res, 404, "text/plain; charset=utf-8", "Not found: " + pathname);
});

server.listen(PORT, "0.0.0.0", function () {
    console.log("Mashiro demo harness listening on http://0.0.0.0:" + PORT);
    console.log("Open /tags/" + DEFAULT_TAG + "/illustrations");
});
