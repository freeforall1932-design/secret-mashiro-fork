// Demo harness glue (NOT part of the extension).
//
// 1. Stubs the tiny slice of `chrome.*` that foreground.js touches.
// 2. Rewrites jQuery ajax calls from https://www.pixiv.net/ajax/... to this
//    mock server, so the real foreground.js runs unmodified.
// 3. Renders a mock Pixiv search page from the current URL and supports
//    SPA-style navigation (pushState) like Pixiv's React router does.

(function () {
    "use strict";

    // ---- 1. chrome stub ------------------------------------------------------
    var chromeObj = window.chrome || (window.chrome = {});
    if (!chromeObj.runtime || typeof chromeObj.runtime.getManifest !== "function") {
        chromeObj.runtime = Object.assign({}, chromeObj.runtime, {
            getManifest: function () { return { version: window.__harnessVersion || "0.0.0-demo" }; }
        });
    }

    var logEl = null;
    var logLines = [];
    function log(text) {
        logLines.push(text);
        if (logLines.length > 3) logLines.shift();
        if (!logEl) logEl = document.getElementById("harness-log");
        if (logEl) logEl.textContent = logLines.join("   |   ");
    }

    function currentTag() {
        var match = location.pathname.match(/\/tags\/([^/]+)/);
        if (match) {
            try { return decodeURIComponent(match[1]); } catch (err) { return match[1]; }
        }
        return new URLSearchParams(location.search).get("q") || "";
    }

    // ---- 2. ajax rewrite -----------------------------------------------------
    window.__harnessPatchJquery = function () {
        if (!window.jQuery) return;
        var origAjax = jQuery.ajax;
        jQuery.ajax = function (options) {
            if (typeof options === "string") options = { url: options };
            if (options && typeof options.url === "string" && /^https:\/\/www\.pixiv\.net\//.test(options.url)) {
                var rewritten = new URL(options.url.replace(/^https:\/\/www\.pixiv\.net\//, location.origin + "/"));
                rewritten.searchParams.set("mashiroTag", currentTag());
                options = Object.assign({}, options, { url: rewritten.toString() });
                var label = decodeURIComponent(rewritten.pathname) +
                    (rewritten.searchParams.get("word") ? "?word=" + rewritten.searchParams.get("word") : "");
                var started = Date.now();
                log("→ " + label);
                return origAjax.call(jQuery, options).done(function (data) {
                    var n = 0;
                    if (data && data.body) {
                        if (data.body.illustManga) n = data.body.illustManga.data.length;
                        else if (data.body.illusts) n = data.body.illusts.length;
                    }
                    log("✓ " + label + " → " + n + " items (" + (Date.now() - started) + " ms)");
                });
            }
            return origAjax.call(jQuery, options);
        };
    };

    // ---- 3. mock page rendering ---------------------------------------------
    var TITLES = ["夏の終わり", "おはよう", "詰め合わせ", "落書きまとめ", "制服", "ランチタイム", "星空", "雨宿り",
        "お祭り", "放課後", "うどん", "桜"];
    var USERS = ["mikan_draws", "sora", "yuki.p", "aoi", "ren", "Kuro", "hiro_art", "mochi", "Yui", "nanoha_"];

    function hash(str) {
        var h = 2166136261;
        for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
        return h >>> 0;
    }

    function currentTab() {
        if (/\/manga\/?$/.test(location.pathname)) return "manga";
        if (/\/artworks\/?$/.test(location.pathname)) return "top";
        return "illustrations";
    }

    function nativeCard(tag, i) {
        var seed = hash(tag + "|native|" + i);
        var id = String(130000000 + (seed % 9000000));
        var title = TITLES[seed % TITLES.length];
        var user = USERS[(seed >>> 3) % USERS.length];
        var pages = (seed % 3 === 0) ? 2 + (seed % 7) : 1;
        var userId = String(1300001 + ((seed >>> 5) % 10));
        return '<div class="px-card">' +
            '<a class="px-card-thumb" href="/artworks/' + id + '">' +
            '<img src="/thumb/' + id + '.svg" alt="" loading="lazy">' +
            (pages > 1 ? '<span class="px-card-pages">' + pages + '</span>' : '') +
            '<svg class="px-card-heart" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 5 6.4 5c1.9 0 3.3 1 4.1 2.2h3C14.3 6 15.7 5 17.6 5 21 5 23.1 8.3 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg>' +
            '</a>' +
            '<a class="px-card-title" href="/artworks/' + id + '">' + title + '</a>' +
            '<a class="px-card-user" href="/users/' + userId + '"><img src="/pfp/' + userId + '.svg" alt=""><span>' + user + '</span></a>' +
            '</div>';
    }

    function render() {
        var tag = currentTag();
        var tab = currentTab();
        var params = new URLSearchParams(location.search);
        var page = parseInt(params.get("p") || "1", 10) || 1;
        var total = 1000 + (hash(tag) % 90000);

        document.title = "#" + tag + " - " + (tab === "manga" ? "Manga" : "Illustrations") + " | Mashiro demo";
        document.getElementById("px-tag-name").textContent = tag;
        document.getElementById("px-tag-total").textContent = total.toLocaleString("en-US");
        document.getElementById("px-works-count").textContent = total.toLocaleString("en-US");
        var box = document.querySelector("input.charcoal-text-field-input");
        if (box) box.value = tag;

        // Tabs keep the current tag.
        document.querySelectorAll(".px-tabs a[data-tab]").forEach(function (link) {
            var kind = link.getAttribute("data-tab");
            link.classList.toggle("px-tab-active", kind === tab);
            if (kind === "top") link.href = "/tags/" + encodeURIComponent(tag) + "/artworks";
            if (kind === "illustrations") link.href = "/tags/" + encodeURIComponent(tag) + "/illustrations";
            if (kind === "manga") link.href = "/tags/" + encodeURIComponent(tag) + "/manga";
        });

        // Optional scenario: Pixiv removed the sort chip -> Mashiro falls back to a floating button.
        if (params.get("nochip") === "1") {
            var chip = document.querySelector('[data-ga4-label="order_filter_chip"]');
            if (chip) chip.remove();
        }

        var cards = "";
        for (var i = 0; i < 18; i++) cards += nativeCard(tag + "|" + tab + "|" + page, i);
        document.getElementById("px-native-grid").innerHTML = cards;

        var pager = "";
        for (var p = 1; p <= 6; p++) {
            var href = location.pathname + "?p=" + p;
            pager += '<a href="' + href + '"' + (p === page ? ' class="px-page-current"' : "") + ">" + p + "</a>";
        }
        document.getElementById("px-pager").innerHTML = pager;

        document.querySelectorAll("#harness a[data-spa]").forEach(function (link) {
            var linkTag = decodeURIComponent(link.getAttribute("href").match(/\/tags\/([^/]+)/)[1]);
            link.classList.toggle("harness-current", linkTag === tag);
        });
    }

    function navigate(href) {
        history.pushState(null, "", href); // Pixiv's router does the same; Mashiro must follow it.
        render();
        log("SPA navigation → " + decodeURIComponent(href));
    }

    document.addEventListener("click", function (event) {
        var link = event.target.closest("a[data-spa]");
        if (!link) return;
        event.preventDefault();
        navigate(link.getAttribute("href"));
    });
    window.addEventListener("popstate", render);

    // This script sits at the end of <body>, so the mock DOM already exists.
    // Render synchronously so foreground.js (loaded next) sees the finished page,
    // exactly like a content script injected after Pixiv has rendered.
    render();
    var theme = document.getElementById("harness-theme");
    theme.addEventListener("change", function () {
        document.body.classList.toggle("px-dark", theme.checked);
    });
    if (typeof fetch === "function") {
        fetch("/ext/manifest.json").then(function (r) { return r.json(); }).then(function (m) {
            window.__harnessVersion = m.version;
            document.getElementById("harness-version").textContent = m.version;
        }).catch(function () { /* ignore */ });
    }
})();
