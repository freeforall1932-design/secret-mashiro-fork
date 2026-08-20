// Mashiro content script.
//
// Cards are built by us (never cloned from Pixiv's React tree). The Popular
// button is attached to Pixiv's current analytics anchors, with a floating
// fallback if those disappear. Requests are serialized so Pixiv does not 403.

(function () {
    "use strict";

    var VERSION = (chrome.runtime && chrome.runtime.getManifest)
        ? chrome.runtime.getManifest().version
        : "0";

    if (window.__mashiroRuntimeVersion === VERSION && window.__mashiroPageObserver) {
        if (typeof window.__mashiroSync === "function") window.__mashiroSync();
        return;
    }

    var SUFFIXES = ["100000", "50000", "30000", "10000", "5000", "1000", "500", "100", "50"];
    var TAG_FAKE = "虚偽users入りタグ";
    var MODE_ILLUST = "illust";
    var MODE_MANGA = "manga";
    var COLOR_ORANGE = "rgb(253 158 22)";
    var COLOR_BLUE = "rgb(0 150 250)";
    var RESULTS_MAX = 1000;
    var RECO_MAX_DEPTH = 2;
    var REQ_GAP_MS = 500;

    var INJ_POP_ID = "inj-pop";
    var INJ_COUNT_ID = "inj-count";
    var INJ_CONTAINER_ID = "inj-container";
    var INJ_LI_CLASS = "inj-li";
    var ACTIVE_BODY_CLASS = "mashiro-active";
    var NATIVE_PAGE_NAV_CLASS = "mashiro-native-pagination";

    // 2026 Pixiv analytics anchors, then semantic fallbacks.
    var SORT_CHIP_SELECTORS = [
        '[data-ga4-label="order_filter_chip"]',
        'button[aria-label*="sort" i]',
        'button[aria-label*="並び"]',
        '[class*="sc-1xl12os-0"][class*="sc-rkvk44-0"]'
    ];
    var WORKS_CONTENT_SELECTORS = [
        '[data-ga4-label="works_content"]',
        'ul[role="list"]'
    ];
    var SEARCHBOX_SELECTOR = 'input.charcoal-text-field-input, input[type="search"], [data-gtm-search-input]';

    var canvasIds = [];
    var popClickCallbacks = [];
    var popAvailColor = null;
    var currModeGlobal = MODE_ILLUST;
    var probeGeneration = 0;

    var reqQueue = [];
    var reqActive = 0;
    var reqInFlight = [];
    var reqPaused = false;
    var reqTimer = null;
    var syncTimer = null;

    function firstMatch(selectors, root) {
        root = root || document;
        for (var i = 0; i < selectors.length; i++) {
            var el = root.querySelector(selectors[i]);
            if (el) return el;
        }
        return null;
    }

    function localePrefix() {
        var match = location.pathname.match(/^\/([a-z]{2})(?=\/)/);
        return match ? "/" + match[1] : "";
    }

    function isSearchResultsPage() {
        return /\/tags\/[^/]+\/(illustrations|manga|artworks)/.test(location.pathname)
            || /\/(?:[a-z]{2}\/)?search$/.test(location.pathname);
    }

    function maybeRedirectToIllustTab() {
        var match = location.pathname.match(/^(\/(?:[a-z]{2})\/)?tags\/([^/]+)\/?$/);
        if (!match) return false;
        var prefix = match[1] || "/";
        location.replace(prefix + "tags/" + match[2] + "/illustrations" + location.search + location.hash);
        return true;
    }

    function suffixRegex(query) {
        return String(query || "").match(/(((10|30|5)0+)users入り)$/);
    }

    function getUrlSearchQuery() {
        if (/^\/(?:[a-z]{2}\/)?search$/.test(location.pathname)) {
            return new URLSearchParams(location.search).get("q") || "";
        }
        var match = location.pathname.match(/\/tags\/([^/]+)/);
        if (!match) return "";
        try {
            return decodeURIComponent(match[1]);
        } catch (err) {
            return match[1];
        }
    }

    function getSearchQuery() {
        // Prefer the URL — the charcoal box lags behind Pixiv SPA navigations.
        var query = getUrlSearchQuery();
        if (!query) {
            var box = document.querySelector(SEARCHBOX_SELECTOR);
            if (box) query = box.value || box.getAttribute("value") || "";
        }
        var match = suffixRegex(query);
        if (match) query = query.slice(0, -match[0].length);
        return String(query).trim();
    }

    function genSearchUrl(query, page) {
        page = page || 1;
        var encoded = encodeURIComponent(query);
        var params = new URLSearchParams({
            word: query,
            order: "date",
            mode: "all",
            p: String(page),
            s_mode: "s_tag",
            type: "all",
            lang: "en"
        });
        return "https://www.pixiv.net/ajax/search/artworks/" + encoded + "?" + params.toString();
    }

    function genSearchUrlSuffixed(query, suffix, page) {
        return genSearchUrl(query + " " + suffix + "users入り", page);
    }

    function genRecoUrl(illustId, limit) {
        limit = limit || 180;
        return "https://www.pixiv.net/ajax/illust/" + encodeURIComponent(illustId)
            + "/recommend/init?limit=" + limit + "&lang=en";
    }

    function resetQueue() {
        reqQueue = [];
        reqInFlight.forEach(function (xhr) {
            try { xhr.abort(); } catch (err) { /* ignore */ }
        });
        reqInFlight = [];
        reqActive = 0;
        if (reqTimer) {
            clearTimeout(reqTimer);
            reqTimer = null;
        }
    }

    function hardPauseQueue() {
        reqPaused = true;
        resetQueue();
    }

    function onRateLimited(status) {
        console.error("Mashiro: Pixiv returned", status, "— stopping this run");
        hardPauseQueue();
    }

    function pumpQueue() {
        if (reqPaused || reqActive > 0 || !reqQueue.length) return;
        if (canvasIds.length >= RESULTS_MAX) {
            reqQueue = [];
            return;
        }

        var job = reqQueue.shift();
        reqActive++;
        var xhr = $.ajax({ url: job.url, dataType: "json" })
            .done(function (data) {
                if (!reqPaused && job.onDone) job.onDone(data);
            })
            .fail(function (failedXhr, status) {
                if (status === "abort") return;
                var httpStatus = failedXhr && failedXhr.status;
                if (httpStatus === 403 || httpStatus === 429) {
                    onRateLimited(httpStatus);
                    return;
                }
                if (job.onFail) job.onFail(httpStatus);
            })
            .always(function () {
                reqActive--;
                reqInFlight = reqInFlight.filter(function (item) { return item !== xhr; });
                if (reqPaused) return;
                reqTimer = setTimeout(function () {
                    reqTimer = null;
                    pumpQueue();
                }, REQ_GAP_MS);
            });
        reqInFlight.push(xhr);
    }

    function enqueueJson(url, onDone, onFail) {
        if (reqPaused) return;
        reqQueue.push({ url: url, onDone: onDone, onFail: onFail });
        pumpQueue();
    }

    function artworkHref(id) {
        return localePrefix() + "/artworks/" + id;
    }

    function userHref(userId) {
        return localePrefix() + "/users/" + userId;
    }

    function generateLi(item) {
        var cell = document.createElement("div");
        cell.className = INJ_LI_CLASS;
        cell.id = item.id;
        cell.setAttribute("data-mashiro-id", item.id);

        var thumbLink = document.createElement("a");
        thumbLink.className = "inj-thumb-link";
        thumbLink.href = artworkHref(item.id);
        if (item.userId) thumbLink.setAttribute("data-gtm-user-id", item.userId);

        var img = document.createElement("img");
        img.className = "inj-thumb-img";
        img.src = item.url || "";
        img.alt = item.alt || item.title || "";
        img.loading = "lazy";
        thumbLink.appendChild(img);

        if (item.pageCount > 1) {
            var badge = document.createElement("span");
            badge.className = "inj-page-count";
            badge.textContent = String(item.pageCount);
            thumbLink.appendChild(badge);
        }
        cell.appendChild(thumbLink);

        var titleLink = document.createElement("a");
        titleLink.className = "inj-title";
        titleLink.href = artworkHref(item.id);
        titleLink.textContent = item.title || "";
        titleLink.title = item.title || "";
        cell.appendChild(titleLink);

        var author = document.createElement("a");
        author.className = "inj-author";
        author.href = userHref(item.userId || "");
        if (item.profileImageUrl) {
            var pfp = document.createElement("img");
            pfp.className = "inj-author-pfp";
            pfp.src = item.profileImageUrl;
            pfp.alt = "";
            author.appendChild(pfp);
        }
        var authorName = document.createElement("span");
        authorName.textContent = item.userName || "";
        author.appendChild(authorName);
        cell.appendChild(author);

        return cell;
    }

    function updateCount() {
        var badge = document.getElementById(INJ_COUNT_ID);
        if (!badge) return;
        badge.textContent = canvasIds.length ? String(canvasIds.length) : "";
    }

    function injectLi(item, suffix) {
        if (!item || !item.id) return false;
        if (canvasIds.length >= RESULTS_MAX) return false;
        if (canvasIds.indexOf(item.id) !== -1) return false;

        if (currModeGlobal === MODE_ILLUST && item.illustType == 1) return false;
        if (currModeGlobal === MODE_MANGA && item.illustType == 0) return false;

        var tags = item.tags;
        if (!tags || tags.indexOf(TAG_FAKE) !== -1) return false;

        var bestSuffix = suffix || null;
        var bestValue = bestSuffix ? parseInt(bestSuffix, 10) : -1;
        tags.forEach(function (tag) {
            var match = suffixRegex(tag);
            if (!match) return;
            var value = parseInt(match[2], 10);
            if (value > bestValue) {
                bestValue = value;
                bestSuffix = match[2];
            }
        });
        suffix = bestSuffix;
        if (!suffix) return false;

        var section = document.getElementById("inj-" + suffix);
        if (!section) return false;

        section.appendChild(generateLi(item));
        canvasIds.push(item.id);
        updateCount();
        return true;
    }

    function readIllustList(data) {
        if (!data || data.error || !data.body || !data.body.illustManga) return [];
        var list = data.body.illustManga.data;
        return Array.isArray(list) ? list : [];
    }

    function handleSuffix(suffix, page, onComplete) {
        page = page || 1;
        if (canvasIds.length >= RESULTS_MAX) {
            if (onComplete) onComplete();
            return;
        }

        enqueueJson(genSearchUrlSuffixed(getSearchQuery(), suffix, page), function (data) {
            var illusts = readIllustList(data);
            illusts.forEach(function (item) {
                try {
                    injectLi(item, suffix);
                } catch (err) {
                    console.error("Mashiro: failed to inject", item && item.id, err);
                }
            });

            if (canvasIds.length < RESULTS_MAX
                && illusts.length === 60
                && SUFFIXES.slice(0, 5).indexOf(suffix) !== -1) {
                handleSuffix(suffix, page + 1, onComplete);
                return;
            }
            if (onComplete) onComplete();
        }, function () {
            if (onComplete) onComplete();
        });
    }

    function handleSuffixesSequentially(index) {
        index = index || 0;
        if (canvasIds.length >= RESULTS_MAX || index >= SUFFIXES.length) return;
        handleSuffix(SUFFIXES[index], 1, function () {
            handleSuffixesSequentially(index + 1);
        });
    }

    function handleRecos(illustId, query, depth) {
        depth = depth || 0;
        if (!illustId || depth >= RECO_MAX_DEPTH) return;
        if (canvasIds.length >= RESULTS_MAX) return;

        enqueueJson(genRecoUrl(illustId), function (data) {
            if (!data || !data.body || !Array.isArray(data.body.illusts)) return;
            data.body.illusts.forEach(function (item) {
                if (item.tags && item.tags.indexOf(query) === -1) return;
                var injected = injectLi(item);
                if (injected && item.id) handleRecos(item.id, query, depth + 1);
            });
        });
    }

    function altPopCallback() {
        var query = getSearchQuery();
        enqueueJson(genSearchUrl(query), function (data) {
            if (!data || !data.body || !data.body.popular) {
                console.error("Mashiro: invalid popular response");
                return;
            }
            var popular = data.body.popular;
            ["permanent", "recent"].forEach(function (key) {
                var list = popular[key];
                if (!Array.isArray(list)) return;
                list.forEach(function (item) {
                    injectLi(item);
                    if (item && item.id) handleRecos(item.id, query);
                });
            });
        });
    }

    function popCallback() {
        handleSuffixesSequentially(0);
    }

    function getCurrMode() {
        if (location.pathname.indexOf("/" + MODE_MANGA) !== -1) {
            currModeGlobal = MODE_MANGA;
        } else if (location.pathname.indexOf("/illustrations") !== -1) {
            currModeGlobal = MODE_ILLUST;
        } else {
            currModeGlobal = null;
        }
    }

    function removeInjectedLi() {
        document.querySelectorAll("." + INJ_LI_CLASS).forEach(function (node) {
            node.remove();
        });
        canvasIds = [];
        updateCount();
    }

    function ensureSections(container) {
        SUFFIXES.forEach(function (suffix) {
            if (document.getElementById("inj-" + suffix)) return;
            var section = document.createElement("div");
            section.id = "inj-" + suffix;
            section.className = "inj-sect";
            container.appendChild(section);
        });
    }

    function injectContainer() {
        var container = document.getElementById(INJ_CONTAINER_ID);
        if (!container) {
            container = document.createElement("div");
            container.id = INJ_CONTAINER_ID;
        }
        ensureSections(container);

        var works = firstMatch(WORKS_CONTENT_SELECTORS);
        if (works && works.parentNode) {
            // Own sibling node — do not mutate React-managed children.
            if (works.getAttribute("data-ga4-label") === "works_content") {
                if (container.previousElementSibling !== works) {
                    works.parentNode.insertBefore(container, works.nextSibling);
                }
            } else {
                works.classList.add("mashiro-native-grid");
                if (container.nextElementSibling !== works) {
                    works.parentNode.insertBefore(container, works);
                }
            }
        } else if (!container.parentNode && document.body) {
            document.body.appendChild(container);
        }
    }

    function buildPopularButton() {
        var button = document.createElement("button");
        button.type = "button";
        button.id = INJ_POP_ID;
        button.textContent = "Popular";
        button.className = "flex items-center gap-4 h-32 pr-8 pl-16 py-4 font-bold text-14 rounded-4 cursor-pointer whitespace-nowrap";
        var badge = document.createElement("span");
        badge.id = INJ_COUNT_ID;
        badge.className = "inj-count";
        button.appendChild(badge);
        return button;
    }

    function injectPopular() {
        var chip = firstMatch(SORT_CHIP_SELECTORS);
        var existing = document.getElementById(INJ_POP_ID);

        if (chip) {
            if (existing) {
                if (existing.classList.contains("mashiro-floating") || existing.previousElementSibling !== chip) {
                    chip.insertAdjacentElement("afterend", existing);
                    existing.classList.remove("mashiro-floating");
                }
                return true;
            }
            chip.insertAdjacentElement("afterend", buildPopularButton());
            return true;
        }

        if (existing) return true;
        if (!document.body || !isSearchResultsPage()) return false;

        var floating = buildPopularButton();
        floating.classList.add("mashiro-floating");
        floating.title = "Mashiro Popular (toolbar chip not found)";
        document.body.appendChild(floating);
        console.warn("Mashiro: sort chip missing; using floating Popular button");
        return true;
    }

    function markNativePagination() {
        if (document.querySelector("nav." + NATIVE_PAGE_NAV_CLASS)) return;
        var navs = document.querySelectorAll("nav");
        for (var i = 0; i < navs.length; i++) {
            var nav = navs[i];
            var pageLinks = Array.prototype.filter.call(nav.querySelectorAll("a[href]"), function (link) {
                try {
                    var url = new URL(link.href, location.href);
                    return url.origin === location.origin
                        && url.pathname === location.pathname
                        && /^\d+$/.test(url.searchParams.get("p") || "");
                } catch (err) {
                    return false;
                }
            });
            if (pageLinks.length < 2) continue;
            nav.classList.add(NATIVE_PAGE_NAV_CLASS);
            return;
        }
    }

    function applyPopColor() {
        var button = document.getElementById(INJ_POP_ID);
        if (!button) return;
        button.style.color = popAvailColor || "";
    }

    function addClickCallbacks() {
        var query = getSearchQuery();
        var button = document.getElementById(INJ_POP_ID);
        var generation = probeGeneration;
        if (!query) {
            console.warn("Mashiro: empty search query; Popular stays idle");
            return;
        }

        function stale() {
            return generation !== probeGeneration;
        }

        function addAltCallback() {
            if (stale()) return;
            $.getJSON(genSearchUrl(query), function (data) {
                if (stale() || !data || !data.body || !data.body.popular) return;
                var permanent = data.body.popular.permanent;
                if (Array.isArray(permanent) && permanent.length) {
                    if (!popAvailColor) popAvailColor = COLOR_BLUE;
                    if (popClickCallbacks.indexOf(altPopCallback) === -1) {
                        popClickCallbacks.push(altPopCallback);
                    }
                    applyPopColor();
                }
            }).fail(function (xhr, status, error) {
                if (!stale()) console.error("Mashiro: alt-pop probe failed", error || status);
            });
        }

        $.getJSON(genSearchUrlSuffixed(query, 100), function (data) {
            if (stale()) return;
            if (readIllustList(data).length) {
                popAvailColor = COLOR_ORANGE;
                if (popClickCallbacks.indexOf(popCallback) === -1) {
                    popClickCallbacks.push(popCallback);
                }
                applyPopColor();
            }
            addAltCallback();
        }).fail(function (xhr, status, error) {
            if (stale()) return;
            console.error("Mashiro: suffix probe failed", error || status);
            addAltCallback();
        });

        if (button) {
            button.onclick = onPopularClick;
        }
    }

    function onPopularClick(event) {
        if (event) event.preventDefault();
        if (!popClickCallbacks.length) {
            console.warn("Mashiro: Popular clicked but no results are available yet");
            return;
        }
        prepFetch();
    }

    function prepFetch() {
        reqPaused = false;
        resetQueue();
        removeInjectedLi();
        getCurrMode();
        document.body.classList.add(ACTIVE_BODY_CLASS);
        injectContainer();
        popClickCallbacks.forEach(function (fn) { fn(); });
    }

    function handleStateChange() {
        probeGeneration += 1;
        hardPauseQueue();
        removeInjectedLi();
        if (document.body) document.body.classList.remove(ACTIVE_BODY_CLASS);

        popClickCallbacks = [];
        popAvailColor = null;
        applyPopColor();
        addClickCallbacks();
    }

    function installNavAbort() {
        if (!window.__mashiroOrigPushState) {
            window.__mashiroOrigPushState = history.pushState;
            window.__mashiroOrigReplaceState = history.replaceState;
        }
        history.pushState = function () {
            hardPauseQueue();
            return window.__mashiroOrigPushState.apply(this, arguments);
        };
        history.replaceState = function () {
            hardPauseQueue();
            return window.__mashiroOrigReplaceState.apply(this, arguments);
        };
        window.__mashiroHardPause = hardPauseQueue;
        if (!window.__mashiroNavAbortInstalled) {
            window.addEventListener("popstate", function () {
                if (typeof window.__mashiroHardPause === "function") window.__mashiroHardPause();
            });
            window.addEventListener("beforeunload", function () {
                if (typeof window.__mashiroHardPause === "function") window.__mashiroHardPause();
            });
            window.__mashiroNavAbortInstalled = true;
        }
    }

    function syncPopular() {
        if (maybeRedirectToIllustTab()) return;
        if (!isSearchResultsPage()) return;

        markNativePagination();
        injectContainer();
        if (!injectPopular()) return;

        var button = document.getElementById(INJ_POP_ID);
        if (!button) return;

        var query = getSearchQuery();
        var pageKey = location.pathname + location.search + "|" + query;
        if (button.getAttribute("data-mashiro-page-key") === pageKey) return;
        button.setAttribute("data-mashiro-page-key", pageKey);
        handleStateChange();
    }

    function scheduleSync() {
        if (syncTimer) return;
        syncTimer = setTimeout(function () {
            syncTimer = null;
            syncPopular();
        }, 50);
    }

    function installPageObserver() {
        if (window.__mashiroPageObserver) {
            window.__mashiroPageObserver.disconnect();
        }
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", installPageObserver, { once: true });
            return;
        }
        var observer = new MutationObserver(scheduleSync);
        observer.observe(document.body, { childList: true, subtree: true });
        window.__mashiroPageObserver = observer;
        syncPopular();
    }

    if (typeof $ === "undefined") {
        console.error("Mashiro: jQuery is not available; cannot start");
        return;
    }

    installNavAbort();
    window.__mashiroRuntimeVersion = VERSION;
    window.__mashiroSync = syncPopular;
    installPageObserver();
})();
