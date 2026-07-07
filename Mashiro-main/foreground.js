var SUFFIXES = ["100000", "50000", "30000", "10000", "5000", "1000", "500", "100", "50"];

var JQUERY_SCRIPT_ID = "inj-script";
var JQUERY_PATH = "jquery-3.6.0.min.js";

var TAG_FAKE = "虚偽users入りタグ";

var MODE_ILLUST = "illust";
var MODE_MANGA = "manga";

var COLOR_ORANGE = "rgb(253 158 22)";
var COLOR_BLUE = "rgb(0 150 250)";

var RESULTS_MAX = 1000;

var canvasIds = [];
var popClickCallbacks = [];

var currModeGlobal;
var liTitleClassGlobal;

// TODO: Pull these from the app automatically - as they arent constant
var INJ_POP_ID = "inj-pop";
var INJ_LI_CLASS = "inj-li";

// STABLE SELECTORS using data attributes and semantic classes (resistant to Pixiv updates)
var SEARCHBOX_SELECTOR = 'input[type="search"], [data-gtm-search-input]';
var THUMBS_UL_SELECTOR = 'ul[role="list"], [class*="sc-l7cibp-1"]';
var LI_TITLE_LOGGEDOUT_CLASS = "sc-d98f2c-0 sc-iasfms-4 hFGeeG";
var LI_TITLE_LOGGEDIN_CLASS = "sc-d98f2c-0 sc-iasfms-4 cTvdTb bZOnOL";
var COUNT_DIV_SELECTOR = '[data-gtm-search-result-count], [class*="sc-7zddlj-2"] span';
var PAGE_NAV_SELECTOR = 'nav[aria-label="Pagination"], [class*="sc-xhhh7v-0"]';
var BANNER_ICON_SELECTOR = '[data-gtm-premium-banner], [class*="sc-jn70pf-2"]';
var SORT_BUTTON_SELECTOR = 'button[aria-label*="sort"], [data-gtm-sort], [class*="sc-1xl12os-0"][class*="sc-rkvk44-0"]';
var LOGIN_BANNER_SELECTOR = '[data-gtm-login-banner], [class*="sc-oh3a2p-4"]';

// Perform regex matching to find suffix
function suffixRegex(query) {
    const queryReg = /(((10|30|5)0+)users入り)$/;
    let queryMatch = query.match(queryReg);
    // queryMatch[0/1]: 100users入り
    // queryMatch[2]: 100
    return queryMatch;
}

// Get current search query without suffix
function getSearchQuery() {
    // Get current value in search box
    let searchBox = $(SEARCHBOX_SELECTOR);
    if (searchBox.length === 0) {
        console.error("Mashiro: Search box not found");
        return "";
    }
    let query = searchBox.attr("value") || searchBox.val();

    // Remove suffix if exists
    let queryMatch = suffixRegex(query);
    if (queryMatch) query = query.slice(0, 0 - queryMatch[0].length);
    return query;
}

let postElement = undefined;

// Wait for a stable thumbnail element to use as template
function findTemplateElement() {
    // Try multiple selectors in order of stability
    const selectors = [
        'li[data-gtm-id]',
        'li[class*="sc-l7cibp"]',
        'ul[role="list"] li:first-child',
        '[class*="thumbnail"]'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            console.log("Mashiro: Found template element with selector:", selector);
            return element;
        }
    }
    return null;
}

// Initialize postElement when available
function initPostElement() {
    const templateEl = findTemplateElement();
    if (templateEl) {
        console.log("Mashiro: Got post element!");
        postElement = templateEl.cloneNode(true);
    } else {
        // Retry after delay if not found
        setTimeout(initPostElement, 500);
    }
}

initPostElement();

// Generate search api url with given query, defaults to page 1
function genSearchUrl(query, page = 1) {
    // Urlencode characters in query
    let queryEncoded = encodeURIComponent(query);
    return `https://www.pixiv.net/ajax/search/artworks/${queryEncoded}?word=${queryEncoded}&order=date&mode=all&p=${page}&s_mode=s_tag&type=all&lang=en`;
}

// Generate suffixed search api url with given query and suffix
function genSearchUrlSuffixed(query, suffix, page) {
    let querySuffixed = `${query}${suffix}users入り`;
    return genSearchUrl(querySuffixed, page);
}

// Generate thumbnail li element
// TODO: sometimes, the posts wont load at all, and require a second click.
function generateLi(i, popType) {
    if (!postElement) {
        console.error("Mashiro: postElement not ready yet");
        return null;
    }

    let illust_id = i.id;
    let artist_id = i.userId;
    let illust_thumb_url = i.url;
    let illust_alt = i.alt;
    let illust_title = i.title;
    let illust_user_name = i.userName;
    let illust_user_profile_picture = i.profileImageUrl;

    let post = postElement.cloneNode(true);
    post.classList.add(INJ_LI_CLASS);
    post.id = illust_id;

    // Use stable attribute-based selectors with fallbacks
    const titleEl = post.querySelector('[data-gtm-title], [class*="title"], h3, .sc-d98f2c-0.sc-iasfms-6');
    const authorNameEl = post.querySelector('[data-gtm-user-name], [class*="user-name"], .sc-d98f2c-0.sc-1rx6dmq-2');
    const authorPfpEl = post.querySelector('img[data-gtm-user-profile-picture], img[alt*="profile"], .sc-1asno00-0 > img');
    const illustLinkEl = post.querySelector('a[data-gtm-id], a[href*="/artworks/"], .sc-d98f2c-0.sc-rp5asc-16');
    const illustImgEl = post.querySelector('img[data-gtm-preview], img[class*="thumbnail"], .sc-d98f2c-0.sc-rp5asc-16 .sc-rp5asc-9 img, .sc-d98f2c-0.sc-rp5asc-16 > .sc-rp5asc-9 > img');

    // Safe DOM updates with null checks
    if (authorPfpEl && illust_user_profile_picture) {
        authorPfpEl.src = illust_user_profile_picture;
    }

    if (illustLinkEl) {
        illustLinkEl.href = `/en/artworks/${illust_id}`;
        illustLinkEl.setAttribute("data-gtm-user-id", artist_id);
    }

    if (illustImgEl) {
        illustImgEl.alt = illust_alt || '';
        illustImgEl.src = illust_thumb_url;
    }

    if (authorNameEl) {
        authorNameEl.textContent = illust_user_name || '';
    }

    if (titleEl) {
        titleEl.textContent = illust_title || '';
    }

    return post;
}

// Main thumbnail injecting function
function injectLi(i, suffix) {
    // Skip repeats
    let illust_id = i.id;
    if (canvasIds.includes(illust_id)) return false;

    // Filter by mode
    let illust_type = i.illustType;
    if (currModeGlobal == MODE_ILLUST && illust_type == 1) return false;
    if (currModeGlobal == MODE_MANGA && illust_type == 0) return false;

    // Skip fakes and tagless
    let illust_tags = i.tags;
    if (!illust_tags) return false;
    if (illust_tags.includes(TAG_FAKE)) return false;

    // Differentiate from alt pop
    let popType = "pop-alt";
    if (suffix) popType = "pop-suf";

    // Get suffix from tags
    if (!suffix) {
        illust_tags.forEach(tag => {
            let suffixReg = suffixRegex(tag);
            if (suffixReg) {
                suffix = suffixReg[2];
                return;
            }
        });
    }

    // Skip if not popular (tentative)
    if (!suffix) return false;

    // Generate li element
    let thumbLi = generateLi(i, popType);
    if (!thumbLi) return false;

    // Inject li to appropriate section
    $(`#inj-${suffix}`).append(thumbLi);

    // Add to and update canvas arr
    canvasIds.push(illust_id);
    updateCountDisplay();
    return true;
}

function updateCountDisplay() {
    $(COUNT_DIV_SELECTOR).first().text(canvasIds.length);
}

// Recursively search for and inject results via given suffix
function handleSuffix(suffix, page = 1) {
    let illustSearchUrl = genSearchUrlSuffixed(getSearchQuery(), suffix, page);
    $.getJSON(illustSearchUrl, function (data) {
        // Safe API response handling with null checks
        if (!data || !data.body || !data.body.illustManga || !data.body.illustManga.data) {
            console.error("Mashiro: Invalid API response structure for suffix", suffix);
            return;
        }
        
        let illustsArr = data.body.illustManga.data;
        illustsArr.forEach(i => {
            try {
                injectLi(i, suffix);
            } catch (e) {
                console.error("Mashiro: Error injecting item", i.id, e);
            }
        });

        // Kill switch to prevent searching the next page
        if (canvasIds.length > RESULTS_MAX) return;

        // Recursively get more popular illusts if available
        if (illustsArr.length == 60 && SUFFIXES.slice(0, 5).includes(suffix))
            handleSuffix(suffix, page + 1);
    }).fail(function(xhr, status, error) {
        console.error("Mashiro: Failed to fetch suffix", suffix, "Error:", error);
    });
}

// Remove all thumbnail elements and clear illust id array
function removeAllLi() {
    // Use stable selector for injected items
    $(`.${INJ_LI_CLASS}`).remove();
    // Also remove original thumbnails using multiple selectors
    $('li[data-gtm-id], li[class*="sc-l7cibp"]').not(`.${INJ_LI_CLASS}`).remove();

    // Reset count
    canvasIds = [];
    updateCountDisplay();
}

// Remove the page navigation bar
function removePageNav() {
    $(PAGE_NAV_SELECTOR).remove();
}

// Get the current URL
function getCurrUrl() {
    return window.location.toString();
}

// Get the current mode (illust/manga)
function getCurrMode() {
    let currUrl = getCurrUrl();

    // Default mode to illust
    currModeGlobal = MODE_ILLUST;
    if (currUrl.includes(`/${MODE_MANGA}`)) {
        currModeGlobal = MODE_MANGA;
    }
}

// Define appropriate global li class name
function getLiTitleClass() {
    liTitleClassGlobal = LI_TITLE_LOGGEDIN_CLASS;
    if ($(LOGIN_BANNER_SELECTOR).length) liTitleClassGlobal = LI_TITLE_LOGGEDOUT_CLASS;
}

// To be run before every retrieval
function prepFetch() {
    // Clear canvas
    removeAllLi();
    removePageNav();

    // Retrieve global configs
    getCurrMode();
    getLiTitleClass();

    // Execute available callbacks
    popClickCallbacks.forEach(function (callbackFunc) {
        callbackFunc();
    });
}

// Callback to retrieve popular via suffix
function popCallback() {
    // console.log("Pop running!")

    // Search all possible popular suffixes
    SUFFIXES.forEach(suffix => {
        handleSuffix(suffix);
    });
}

// Generate recommended api url, default limit at 180 (max)
function genRecoUrl(illust_id, limit = 180) {
    return `https://www.pixiv.net/ajax/illust/${illust_id}/recommend/init?limit=${limit}&lang=en`;
}

// Handle recommendations from alt pop
function handleRecos(illust_id, query) {
    if (canvasIds.length > RESULTS_MAX) return;
    $.getJSON(genRecoUrl(illust_id), function (data) {
        // Safe API response handling
        if (!data || !data.body || !data.body.illusts) {
            console.error("Mashiro: Invalid recommendations response");
            return;
        }
        
        data.body.illusts.forEach(i => {
            // Skip unrelated (might move to injectLi)
            if (i.tags && !i.tags.includes(query)) return;
            let injectResult = injectLi(i);

            // Recursive search optimised for efficiency
            // Not exhaustive, but fast
            if (i.id && injectResult) handleRecos(i.id, query);
        });
    }).fail(function(xhr, status, error) {
        console.error("Mashiro: Failed to fetch recommendations", error);
    });
}

// Function to fetch and inject alt pop
function altPopCallback() {
    // console.log("Alt pop running!");

    let query = getSearchQuery();
    let querySearchUrl = genSearchUrl(query);

    $.getJSON(querySearchUrl, function (data) {
        // Safe API response handling
        if (!data || !data.body || !data.body.popular) {
            console.error("Mashiro: Invalid popular response structure");
            return;
        }

        // Inject permanent illusts
        if (data.body.popular.permanent && Array.isArray(data.body.popular.permanent)) {
            data.body.popular.permanent.forEach(i => {
                injectLi(i);
                handleRecos(i.id, query);
            });
        }

        // Inject recent illusts
        if (data.body.popular.recent && Array.isArray(data.body.popular.recent)) {
            data.body.popular.recent.forEach(i => {
                injectLi(i);
                handleRecos(i.id, query);
            });
        }
    }).fail(function(xhr, status, error) {
        console.error("Mashiro: Failed to fetch alt pop", error);
    });
}

// Remove premium banner
function removeBanner() {
    $(BANNER_ICON_SELECTOR).parent().remove();
}

// Remove all injected thumbs
function removeInjectedLi() {
    $(`.${INJ_LI_CLASS}`).remove();
}

// Test for pop/alt availability and add callbacks accordingly
function addClickCallbacks() {
    // Flag to prioritise pop suffix color
    let popAvail;

    let injPop = $(`#${INJ_POP_ID}`);

    let query = getSearchQuery();

    // Perform temp search for 100users
    let tempSearchUrlSuffixed = genSearchUrlSuffixed(query, 100);
    $.getJSON(tempSearchUrlSuffixed, function (data) {
        if (data && data.body && data.body.illustManga && data.body.illustManga.data && data.body.illustManga.data.length) {
            // Results exist for popular suffixed
            popAvail = true;
            injPop.css("color", COLOR_ORANGE);
            popClickCallbacks.push(popCallback);
        }
    }).fail(function(xhr, status, error) {
        console.error("Mashiro: Failed temp suffix search", error);
    });

    // Temp alt pop search
    let tempSearchUrl = genSearchUrl(query);
    $.getJSON(tempSearchUrl, function (data) {
        if (data && data.body && data.body.popular && data.body.popular.permanent && data.body.popular.permanent.length) {
            // Results exist for alt pop
            if (!popAvail) injPop.css("color", COLOR_BLUE);
            popClickCallbacks.push(altPopCallback);
        }
    }).fail(function(xhr, status, error) {
        console.error("Mashiro: Failed temp alt pop search", error);
    });
}

// Called whenever there is an update to the page
function handleStateChange() {
    // removeBanner(); // Optional

    // Remove previously injected li
    removeInjectedLi();

    // Reset popular button
    let injPop = $(`#${INJ_POP_ID}`);

    // Reset color
    injPop.css("color", "");
    injPop.off();

    // Clear callbacks arr
    popClickCallbacks = [];

    // Could be sequential to ensure consistency
    addClickCallbacks();

    // Re-set callback
    injPop.on("click", prepFetch);
}

// Inject jQuery into document head
function injectJQuery() {
    let isJQueryInjected = document.getElementById(JQUERY_SCRIPT_ID);
    // Return if already exists
    if (isJQueryInjected) return;
    let script = document.createElement("script");
    script.id = JQUERY_SCRIPT_ID;
    script.src = chrome.runtime.getURL(JQUERY_PATH);
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
}


// Inject Popular button
function injectPopular() {
    // Return if already exists
    if ($(`#${INJ_POP_ID}`).length) return;
    
    // Try multiple selectors to find the sort button
    let ogPopSort = $(SORT_BUTTON_SELECTOR).first().parent();
    if (ogPopSort.length === 0) {
        console.error("Mashiro: Could not find sort button for Popular injection");
        return;
    }
    
    let injPop = ogPopSort.clone();
    injPop.text("Popular");
    injPop.attr("id", INJ_POP_ID);
    injPop.css("cursor", "pointer");
    ogPopSort.after(injPop);
}

// Inject sections dynamically
function injectSections() {
    if ($(".inj-sect").length) return;
    
    // Find the thumbnail container using stable selector
    let thumbsContainer = $(THUMBS_UL_SELECTOR).first();
    if (thumbsContainer.length === 0) {
        console.error("Mashiro: Could not find thumbnail container");
        return;
    }
    
    SUFFIXES.forEach(suffix => {
        thumbsContainer.append($(`<div id="inj-${suffix}" class="inj-sect"></div>`))
    });
}

// Vars are removed when page is refreshed
// jQuery is removed when page is refreshed

// Popular button is removed when illust->manga tab switch/page refreshed
// Sections are removed when illust->manga tab switch/page refreshed

// jQuery gets removed only when page is refreshed
// Always check just to be safe
injectJQuery();

// Determine type of change
if (document.getElementById(INJ_POP_ID)) {
    // On tag change/old->new tab switch
    // console.log("Already added button!");

    handleStateChange();

} else {
    // On refresh/illust->manga tab switch
    // console.log("Adding button");

    injectPopular();
    injectSections();

    handleStateChange();
}
