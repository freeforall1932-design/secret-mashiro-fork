/* Mashiro 1.0.0 — https://github.com/freeforall1932-design/secret-mashiro-fork — The Unlicense */
"use strict";
(() => {
  // src/lib/langText.ts
  var LANG_TEXT = {
    // Popular button / results grid
    popular: ["Popular", "人気順", "热门"],
    popularTitleOrange: ["Popular works available via users入り tags — click to show", "users入りタグで人気作品が見つかりました — クリックで表示", "通过 users入り 标签找到了热门作品 — 点击显示"],
    popularTitleBlue: ["Only Pixiv's popular list and recommendations are available — click to show", "Pixivの人気作品リストとおすすめのみ利用可能 — クリックで表示", "仅有 Pixiv 的热门列表和推荐可用 — 点击显示"],
    popularTitleGrey: ["No popular works found for this search", "この検索では人気作品が見つかりません", "此搜索没有找到热门作品"],
    popularTitleIdle: ["Click to search popular works", "クリックで人気作品を検索", "点击搜索热门作品"],
    popularTitleProbing: ["Checking for popular works…", "人気作品を確認中…", "正在检查热门作品…"],
    popularTitleTop: ["Open the Illustrations tab in Popular mode", "イラストタブを人気順で開く", "以热门模式打开插画标签页"],
    popularTitleActive: ["Click to return to Pixiv's own list", "クリックでPixivの一覧に戻る", "点击返回 Pixiv 原始列表"],
    openSettings: ["Mashiro settings", "Mashiroの設定", "Mashiro 设置"],
    bucketHeader: ["{label} users入り", "{label} users入り", "{label} users入り"],
    bucketHeaderAlt: ["Pixiv popular & recommended", "Pixivの人気・おすすめ", "Pixiv 热门与推荐"],
    statusFetchingBucket: ["Fetching {bucket}users入り ({done}/{total}) — {found} works", "{bucket}users入りを取得中（{done}/{total}）— {found}件", "正在获取 {bucket}users入り（{done}/{total}）— {found} 个作品"],
    statusFetchingAlt: ["Fetching Pixiv's popular list and recommendations — {found} works", "Pixivの人気作品とおすすめを取得中 — {found}件", "正在获取 Pixiv 热门列表和推荐 — {found} 个作品"],
    statusDone: ["Done — {found} works", "完了 — {found}件", "完成 — {found} 个作品"],
    statusStopped: ["Stopped — {found} works", "停止 — {found}件", "已停止 — {found} 个作品"],
    statusEmpty: ["No popular works matched the current filters.", "条件に合う人気作品はありません。", "没有符合当前筛选条件的热门作品。"],
    statusRateLimited: ["Pixiv rate limit (429) — retrying in {s}s", "Pixivのレート制限（429）— {s}秒後に再試行", "Pixiv 限流（429）— {s} 秒后重试"],
    statusForbidden: ["Pixiv refused the request (403). Reload the page or sign in again.", "Pixivがリクエストを拒否しました（403）。再読み込みするか、再ログインしてください。", "Pixiv 拒绝了请求（403）。请刷新页面或重新登录。"],
    statusNetworkError: ["Network error — Pixiv did not answer.", "ネットワークエラー — Pixivから応答がありません。", "网络错误 — Pixiv 没有响应。"],
    stop: ["Stop", "停止", "停止"],
    refresh: ["Refresh", "更新", "刷新"],
    close: ["Close", "閉じる", "关闭"],
    filteredOut: ["{n} hidden by filters", "{n}件をフィルターで非表示", "{n} 个被筛选隐藏"],
    pages: ["{n} pages", "{n}ページ", "{n} 页"],
    // Panel chrome
    panelTitle: ["Mashiro", "Mashiro", "Mashiro"],
    panelSubtitle: ["Popular mode for Pixiv search", "Pixiv検索の人気順モード", "Pixiv 搜索热门模式"],
    navHome: ["Home", "ホーム", "主页"],
    navCrawl: ["Search", "検索", "搜索"],
    navFilters: ["Filters", "フィルター", "筛选"],
    navDisplay: ["Display", "表示", "显示"],
    navGeneral: ["General", "一般", "通用"],
    navHelp: ["Help", "ヘルプ", "帮助"],
    // Home
    statusTitle: ["Status", "状態", "状态"],
    stateIdle: ["Idle", "待機中", "空闲"],
    stateProbing: ["Checking availability…", "利用可否を確認中…", "正在检查可用性…"],
    stateRunning: ["Running", "実行中", "运行中"],
    statePaused: ["Paused — rate limited", "一時停止 — レート制限", "已暂停 — 限流"],
    stateDone: ["Done", "完了", "完成"],
    stateStopped: ["Stopped", "停止", "已停止"],
    stateError: ["Error", "エラー", "错误"],
    notSearchPage: ["This is not a Pixiv search page. Open a tag search (e.g. pixiv.net/tags/オリジナル/illustrations) to use Popular mode.", "Pixivの検索ページではありません。タグ検索（例: pixiv.net/tags/オリジナル/illustrations）を開いてください。", "当前不是 Pixiv 搜索页面。请打开标签搜索（例如 pixiv.net/tags/オリジナル/illustrations）。"],
    currentSearch: ["Current search", "現在の検索", "当前搜索"],
    availability: ["Availability", "利用可否", "可用性"],
    availOrange: ["users入り results available", "users入りの検索結果あり", "有 users入り 搜索结果"],
    availBlue: ["Only Pixiv's popular list available", "Pixivの人気作品リストのみ", "仅有 Pixiv 热门列表"],
    availGrey: ["No popular results for this search", "この検索には人気作品がありません", "此搜索没有热门作品"],
    availUnknown: ["Unknown — availability check is disabled", "不明 — 利用可否の確認が無効", "未知 — 已禁用可用性检查"],
    startCrawl: ["Start Popular mode", "人気順モードを開始", "开始热门模式"],
    stopCrawl: ["Stop", "停止", "停止"],
    clearResults: ["Clear results", "結果をクリア", "清除结果"],
    progress: ["Progress", "進捗", "进度"],
    found: ["Found", "取得数", "已找到"],
    requests: ["Requests", "リクエスト数", "请求数"],
    perBucket: ["Per bucket", "バケットごと", "各区间"],
    logTitle: ["Log", "ログ", "日志"],
    clearLog: ["Clear log", "ログを消去", "清除日志"],
    tipSafe: ["Mashiro sends one request at a time with a delay, so it cannot trigger Pixiv's rate limit the way parallel fetching does. Keep the delay at 500 ms or more.", "Mashiroは間隔を空けて1件ずつリクエストするため、並列取得のようにPixivのレート制限に掛かることはほとんどありません。間隔は500ms以上を推奨します。", "Mashiro 每次只发送一个请求并带有延迟，因此不会像并行抓取那样触发 Pixiv 的限流。建议延迟保持在 500 毫秒以上。"],
    // Crawl settings
    secCrawl: ["Search", "検索", "搜索"],
    minBucket: ["Lowest bucket to include", "含める最小バケット", "包含的最低区间"],
    minBucketHelp: ["Buckets are Pixiv's users入り tags. 50 includes everything; 1000 keeps only well-known works.", "バケットはPixivのusers入りタグです。50で全て、1000なら有名作品のみ。", "区间即 Pixiv 的 users入り 标签。50 包含全部；1000 仅保留知名作品。"],
    resultLimit: ["Maximum results", "最大取得数", "最大结果数"],
    maxPages: ["Pages per bucket (60 works each)", "バケットごとのページ数（1ページ60件）", "每个区间的页数（每页 60 个）"],
    requestGap: ["Delay between requests (ms)", "リクエスト間隔（ms）", "请求间隔（毫秒）"],
    orderInBucket: ["Order inside a bucket", "バケット内の並び順", "区间内排序"],
    newestFirst: ["Newest first", "新しい順", "最新优先"],
    oldestFirst: ["Oldest first", "古い順", "最早优先"],
    probeOnLoad: ["Check availability when a search page opens", "検索ページを開いたときに利用可否を確認する", "打开搜索页时检查可用性"],
    probeOnLoadHelp: ["Colours the button orange / blue / grey using one or two small requests.", "1〜2回の小さなリクエストでボタンをオレンジ／青／グレーに色分けします。", "通过一两个小请求将按钮标为橙色／蓝色／灰色。"],
    altMode: ["Fallback: Pixiv's popular list + recommendations", "フォールバック: Pixivの人気作品＋おすすめ", "回退：Pixiv 热门列表 + 推荐"],
    altAuto: ["Only when buckets return fewer works than the threshold", "バケットの結果がしきい値未満のときのみ", "仅当区间结果少于阈值时"],
    altAlways: ["Always, after the buckets", "常に（バケットの後）", "总是（在区间之后）"],
    altOff: ["Never", "使用しない", "从不"],
    altThreshold: ["Fallback threshold (works)", "フォールバックのしきい値（件）", "回退阈值（作品数）"],
    recoDepth: ["Recommendation depth", "おすすめの探索深さ", "推荐深度"],
    inheritPageFilters: ["Respect the filters in the Pixiv URL (safe/R-18, dates, ratio, tool, match type)", "PixivのURLのフィルター（全年齢/R-18、期間、比率、ツール、一致方法）を引き継ぐ", "沿用 Pixiv 网址中的筛选（全年龄/R-18、日期、比例、工具、匹配方式）"],
    retryAfter429: ["Wait after a 429 before retrying (seconds)", "429後の再試行までの待ち時間（秒）", "遇到 429 后重试前的等待时间（秒）"],
    // Filters
    secFilters: ["Filters", "フィルター", "筛选"],
    hideR18: ["Hide R-18", "R-18を隠す", "隐藏 R-18"],
    hideR18G: ["Hide R-18G", "R-18Gを隠す", "隐藏 R-18G"],
    hideAI: ["Hide AI-generated works", "AI生成作品を隠す", "隐藏 AI 生成作品"],
    hideUgoira: ["Hide ugoira (animations)", "うごイラを隠す", "隐藏动图"],
    excludeTags: ["Exclude works with these tags", "これらのタグを含む作品を除外", "排除含有这些标签的作品"],
    excludeTagsHelp: ["Comma or newline separated. Matching is case-insensitive.", "カンマまたは改行区切り。大文字小文字は区別しません。", "用逗号或换行分隔，不区分大小写。"],
    minPageCount: ["Minimum page count", "最小ページ数", "最少页数"],
    dateFrom: ["Posted from", "投稿日（開始）", "发布日期（起）"],
    dateTo: ["Posted until", "投稿日（終了）", "发布日期（止）"],
    // Display
    secDisplay: ["Display", "表示", "显示"],
    cardSize: ["Card size", "カードサイズ", "卡片大小"],
    sizeCompact: ["Compact", "コンパクト", "紧凑"],
    sizeRegular: ["Pixiv default", "Pixiv標準", "Pixiv 默认"],
    sizeLarge: ["Large", "大きめ", "大"],
    showBucketHeaders: ["Show a header for each bucket", "バケットごとに見出しを表示", "为每个区间显示标题"],
    showBucketBadge: ["Show the bucket badge on thumbnails", "サムネイルにバケットのバッジを表示", "在缩略图上显示区间徽章"],
    showAuthor: ["Show the author under each work", "作品の下に作者を表示", "在作品下方显示作者"],
    openInNewTab: ["Open works in a new tab", "作品を新しいタブで開く", "在新标签页打开作品"],
    autoStart: ["Start automatically when a search page has popular works", "人気作品がある検索ページでは自動的に開始", "搜索页存在热门作品时自动开始"],
    showPanelButton: ["Show the settings button next to Popular", "人気順ボタンの横に設定ボタンを表示", "在热门按钮旁显示设置按钮"],
    // General
    secGeneral: ["General", "一般", "通用"],
    language: ["Language", "言語", "语言"],
    followPixiv: ["Follow Pixiv", "Pixivに合わせる", "跟随 Pixiv"],
    theme: ["Theme", "テーマ", "主题"],
    themeLight: ["Light", "ライト", "浅色"],
    themeDark: ["Dark", "ダーク", "深色"],
    exportSettings: ["Export settings", "設定をエクスポート", "导出设置"],
    importSettings: ["Import settings", "設定をインポート", "导入设置"],
    resetSettings: ["Reset to defaults", "初期設定に戻す", "恢复默认"],
    resetConfirm: ["Reset all Mashiro settings to their defaults?", "Mashiroの設定をすべて初期化しますか？", "要将 Mashiro 的所有设置恢复为默认值吗？"],
    importFailed: ["Could not import: that is not a Mashiro settings file.", "インポートできません: Mashiroの設定ファイルではありません。", "无法导入：这不是 Mashiro 的设置文件。"],
    importDone: ["Settings imported", "設定をインポートしました", "设置已导入"],
    settingsReset: ["Settings reset", "設定を初期化しました", "设置已重置"],
    // Help
    secHelp: ["Help", "ヘルプ", "帮助"],
    helpHowTitle: ["How Popular mode works", "人気順モードの仕組み", "热门模式的原理"],
    helpHow: [`Pixiv tags every work that passes a bookmark milestone with "<N>users入り" (50, 100, 500, 1000, 5000, 10000, 30000, 50000, 100000). Mashiro searches your query together with each of those tags, highest first, and shows the results in its own grid. It never uses Premium's sort, so results are approximate.`, "Pixivはブックマーク数の節目を超えた作品に「<N>users入り」タグ（50, 100, 500, 1000, 5000, 10000, 30000, 50000, 100000）を自動付与します。Mashiroは検索語とこれらのタグを組み合わせて上位から順に検索し、独自のグリッドに表示します。プレミアムの並び替えは使わないため、結果は近似です。", "Pixiv 会为超过收藏数里程碑的作品自动添加「<N>users入り」标签（50、100、500、1000、5000、10000、30000、50000、100000）。Mashiro 将搜索词与这些标签组合、从高到低依次搜索，并在自己的网格中显示结果。它不使用会员排序，因此结果是近似的。"],
    helpColorsTitle: ["Button colours", "ボタンの色", "按钮颜色"],
    helpColors: ["Orange: users入り results exist. Blue: only Pixiv's own popular list and recommendations were found (common for character tags). Grey: nothing was found.", "オレンジ: users入りの結果あり。青: Pixivの人気作品リストとおすすめのみ（キャラクタータグでよくあります）。グレー: 何も見つかりません。", "橙色：存在 users入り 结果。蓝色：仅找到 Pixiv 自身的热门列表和推荐（角色标签常见）。灰色：什么都没找到。"],
    helpTipsTitle: ["Tips", "ヒント", "提示"],
    helpTips: ["Use the official series tag artists use (エヴァ rather than エヴァンゲリオン). Generic tags such as オリジナル or 風景 work well. Only illustrations and manga are supported.", "作者が使う公式の作品タグ（エヴァンゲリオンよりエヴァ）を使ってください。オリジナルや風景などの一般的なタグも有効です。対応はイラストと漫画のみです。", "请使用画师常用的官方系列标签（用 エヴァ 而不是 エヴァンゲリオン）。オリジナル、風景 等通用标签效果很好。目前仅支持插画和漫画。"],
    helpProject: ["Project page & issues", "プロジェクトページ・不具合報告", "项目主页与问题反馈"],
    helpVersion: ["Version {v}", "バージョン {v}", "版本 {v}"],
    helpCredits: ["Maintained fork of kokseen1/Mashiro. Architecture informed by PixivBatchDownloader. Public domain (The Unlicense).", "kokseen1/Mashiroのメンテナンス版フォーク。設計はPixivBatchDownloaderを参考にしました。パブリックドメイン（The Unlicense）。", "kokseen1/Mashiro 的维护分支。架构参考了 PixivBatchDownloader。公共领域（The Unlicense）。"]
  };

  // src/lib/i18n.ts
  var COLUMN = { en: 0, ja: 1, "zh-CN": 2 };
  var current = "en";
  function detectPixivLanguage() {
    const lang = (document.documentElement.lang || navigator.language || "en").toLowerCase();
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("zh")) return "zh-CN";
    return "en";
  }
  function setLanguage(setting) {
    current = setting === "auto" ? detectPixivLanguage() : setting;
    return current;
  }
  function t(key, vars) {
    const row = LANG_TEXT[key];
    let text = row ? row[COLUMN[current]] || row[0] : key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.split(`{${name}}`).join(String(value));
      }
    }
    return text;
  }

  // src/lib/events.ts
  var Emitter = class {
    handlers = /* @__PURE__ */ new Map();
    on(name, handler) {
      let set = this.handlers.get(name);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        this.handlers.set(name, set);
      }
      set.add(handler);
      return () => this.off(name, handler);
    }
    once(name, handler) {
      const off = this.on(name, (payload) => {
        off();
        handler(payload);
      });
      return off;
    }
    off(name, handler) {
      this.handlers.get(name)?.delete(handler);
    }
    emit(name, payload) {
      const set = this.handlers.get(name);
      if (!set) return;
      for (const handler of [...set]) {
        try {
          handler(payload);
        } catch (err) {
          console.error("Mashiro: event handler failed", name, err);
        }
      }
    }
  };

  // src/lib/log.ts
  var MAX_ENTRIES = 200;
  var Log = class extends Emitter {
    entries = [];
    nextId = 1;
    push(level, text, key) {
      const entry = { id: this.nextId++, level, text, key, time: Date.now() };
      if (key) {
        const index = this.entries.findIndex((e) => e.key === key);
        if (index !== -1) {
          entry.id = this.entries[index].id;
          this.entries[index] = entry;
          this.emit("entry", entry);
          return;
        }
      }
      this.entries.push(entry);
      if (this.entries.length > MAX_ENTRIES) this.entries.shift();
      this.emit("entry", entry);
    }
    info(text, key) {
      this.push("info", text, key);
    }
    success(text, key) {
      this.push("success", text, key);
    }
    warning(text, key) {
      console.warn("Mashiro:", text);
      this.push("warning", text, key);
    }
    error(text, key) {
      console.error("Mashiro:", text);
      this.push("error", text, key);
    }
    clear() {
      this.entries = [];
      this.emit("clear", void 0);
    }
  };
  var log = new Log();

  // src/popular/buckets.ts
  var BUCKETS = ["100000", "50000", "30000", "10000", "5000", "3000", "1000", "500", "300", "100", "50"];
  var SUFFIX = "users入り";
  var FAKE_TAG = "虚偽users入りタグ";
  var BUCKET_RE = /^(\d+)users入り$/;
  function bucketValue(bucket) {
    return parseInt(bucket, 10);
  }
  function isBucket(value) {
    return BUCKETS.includes(value);
  }
  function bucketOfTag(tag) {
    const match = BUCKET_RE.exec(tag.trim());
    if (!match) return null;
    return isBucket(match[1]) ? match[1] : null;
  }
  function highestBucket(tags) {
    let best = null;
    for (const tag of tags) {
      const bucket = bucketOfTag(tag);
      if (bucket && (!best || bucketValue(bucket) > bucketValue(best))) best = bucket;
    }
    return best;
  }
  function bucketsFrom(min) {
    const floor = bucketValue(min);
    return BUCKETS.filter((bucket) => bucketValue(bucket) >= floor);
  }
  function stripBucketKeyword(query) {
    return query.replace(/\s*\d+users入り\s*$/, "").trim();
  }
  function bucketLabel(bucket) {
    const value = bucketValue(bucket);
    return (value >= 1e3 ? `${value / 1e3}k` : String(value)) + "+";
  }

  // src/lib/pageType.ts
  var FORWARDABLE_FILTERS = ["mode", "s_mode", "scd", "ecd", "ratio", "tool", "wlt", "wgt", "hlt", "hgt", "blt", "bgt", "ai_type", "csw"];
  var TAGS_RE = /^(\/[a-z]{2}(?:-[a-z]{2})?)?\/tags\/([^/]+)(?:\/(artworks|illustrations|manga|novels|top))?\/?$/i;
  var SEARCH_RE = /^(\/[a-z]{2}(?:-[a-z]{2})?)?\/search\/?$/i;
  function decode(part) {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  }
  function tabFor(segment, typeParam) {
    const value = (segment || "").toLowerCase();
    if (value === "novels") return null;
    if (value === "illustrations") return "illustrations";
    if (value === "manga") return "manga";
    if (value === "artworks") return "artworks";
    if (value === "top" || value === "") {
      if (typeParam !== null) {
        const type = typeParam.toLowerCase();
        if (type === "novel") return null;
        if (type === "manga") return "manga";
        if (type === "all" || type === "artwork") return "artworks";
        return "illustrations";
      }
      return "top";
    }
    return null;
  }
  function parsePage(loc = location) {
    const params = new URLSearchParams(loc.search);
    let localePrefix = "";
    let rawWord = "";
    let tab = null;
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
    const apiPath = tab === "illustrations" ? "illustrations" : tab === "manga" ? "manga" : "artworks";
    const type = apiPath === "illustrations" ? "illust_and_ugoira" : apiPath === "manga" ? "manga" : "all";
    const pageFilters = {};
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
      key: `${localePrefix}|${tab}|${word}|${filterKey}`
    };
  }
  function artworkHref(page, id) {
    return `${page.localePrefix}/artworks/${id}`;
  }
  function userHref(page, userId) {
    return `${page.localePrefix}/users/${userId}`;
  }
  function illustrationsTabHref(page) {
    const params = new URLSearchParams(page.pageFilters);
    const query = params.toString();
    return `${page.localePrefix}/tags/${encodeURIComponent(page.word)}/illustrations${query ? "?" + query : ""}`;
  }

  // src/lib/pageSwitch.ts
  var PageSwitch = class extends Emitter {
    currentUrl = "";
    observer = null;
    debounce = null;
    start() {
      this.currentUrl = this.normalize(location.href);
      const check = () => this.check();
      window.addEventListener("mashiro:navigate", check);
      window.addEventListener("popstate", check);
      window.addEventListener("hashchange", check);
      this.observer = new MutationObserver(() => {
        if (this.debounce !== null) return;
        this.debounce = window.setTimeout(() => {
          this.debounce = null;
          this.check();
        }, 200);
      });
      this.observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    /** Ignore the hash: Pixiv's manga viewer toggles "#1" without changing the page. */
    normalize(url) {
      return url.split("#")[0];
    }
    check() {
      const url = this.normalize(location.href);
      if (url === this.currentUrl) return;
      const previous = this.currentUrl;
      this.currentUrl = url;
      this.emit("switch", { url, previous });
    }
  };
  var pageSwitch = new PageSwitch();

  // src/lib/ext.ts
  function ext() {
    const g = globalThis;
    try {
      return g.browser?.runtime ? g.browser : g.chrome;
    } catch {
      return void 0;
    }
  }
  function assetUrl(path) {
    try {
      return ext()?.runtime?.getURL(path) ?? "";
    } catch {
      return "";
    }
  }

  // src/lib/settings.ts
  var DEFAULT_SETTINGS = Object.freeze({
    minBucket: "50",
    resultLimit: 1e3,
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
  var STORAGE_KEY = "mashiroSettings";
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function clampInt(value, min, max, fallback) {
    const n = typeof value === "number" ? value : parseInt(String(value), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function oneOf(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
  }
  function normalizeSettings(raw) {
    const r = raw && typeof raw === "object" ? raw : {};
    const d = DEFAULT_SETTINGS;
    const bool = (key) => typeof r[key] === "boolean" ? r[key] : d[key];
    const text = (key) => typeof r[key] === "string" ? r[key] : d[key];
    const date = (key) => DATE_RE.test(String(r[key] ?? "")) ? String(r[key]) : "";
    return {
      minBucket: oneOf(r.minBucket, BUCKETS, d.minBucket),
      resultLimit: clampInt(r.resultLimit, 50, 5e3, d.resultLimit),
      maxPagesPerBucket: clampInt(r.maxPagesPerBucket, 1, 20, d.maxPagesPerBucket),
      requestGapMs: clampInt(r.requestGapMs, 200, 5e3, d.requestGapMs),
      orderInBucket: oneOf(r.orderInBucket, ["date_d", "date"], d.orderInBucket),
      probeOnLoad: bool("probeOnLoad"),
      altMode: oneOf(r.altMode, ["auto", "always", "off"], d.altMode),
      altThreshold: clampInt(r.altThreshold, 0, 1e3, d.altThreshold),
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
      cardSize: oneOf(r.cardSize, ["compact", "regular", "large"], d.cardSize),
      showBucketHeaders: bool("showBucketHeaders"),
      showBucketBadge: bool("showBucketBadge"),
      showAuthor: bool("showAuthor"),
      openInNewTab: bool("openInNewTab"),
      autoStart: bool("autoStart"),
      showPanelButton: bool("showPanelButton"),
      language: oneOf(r.language, ["auto", "en", "ja", "zh-CN"], d.language),
      theme: oneOf(r.theme, ["auto", "light", "dark"], d.theme)
    };
  }
  function parseTagList(text) {
    const out = /* @__PURE__ */ new Set();
    for (const part of text.split(/[,\n、]/)) {
      const tag = part.trim().replace(/^#/, "").toLowerCase();
      if (tag) out.add(tag);
    }
    return [...out];
  }
  function pickArea() {
    try {
      const storage = ext()?.storage;
      if (!storage) return null;
      return storage.sync || storage.local || null;
    } catch {
      return null;
    }
  }
  var SettingsStore = class extends Emitter {
    current = { ...DEFAULT_SETTINGS };
    area = pickArea();
    loaded = false;
    get value() {
      return this.current;
    }
    get(key) {
      return this.current[key];
    }
    async load() {
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
    async set(key, value) {
      const next = normalizeSettings({ ...this.current, [key]: value });
      if (next[key] === this.current[key]) return;
      this.current = next;
      this.emit("change", { key, value: next[key], settings: next });
      await this.persist();
    }
    async replace(raw) {
      const next = normalizeSettings(raw);
      const previous = this.current;
      this.current = next;
      for (const key of Object.keys(next)) {
        if (next[key] !== previous[key]) {
          this.emit("change", { key, value: next[key], settings: next });
        }
      }
      await this.persist();
    }
    reset() {
      return this.replace({});
    }
    export() {
      return JSON.stringify(this.current, null, 2);
    }
    async persist() {
      if (!this.area || !this.loaded) return;
      try {
        await this.area.set({ [STORAGE_KEY]: this.current });
      } catch (err) {
        console.warn("Mashiro: could not save settings", err);
      }
    }
    listenForExternalChanges() {
      try {
        const storage = ext()?.storage;
        if (!storage?.onChanged) return;
        storage.onChanged.addListener((changes, areaName) => {
          const isOurArea = areaName === "sync" && this.area === storage.sync || areaName === "local" && this.area === storage.local;
          if (!isOurArea || !changes[STORAGE_KEY]) return;
          const incoming = normalizeSettings(changes[STORAGE_KEY].newValue);
          if (JSON.stringify(incoming) === JSON.stringify(this.current)) return;
          const previous = this.current;
          this.current = incoming;
          for (const key of Object.keys(incoming)) {
            if (incoming[key] !== previous[key]) {
              this.emit("change", { key, value: incoming[key], settings: incoming });
            }
          }
        });
      } catch {
      }
    }
  };
  var settings = new SettingsStore();

  // src/lib/theme.ts
  var FLAG_SELECTOR = "#gtm-var-theme-kind";
  var DARK_CLASS = "mashiro-dark";
  function luminanceOf(color) {
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(color);
    if (!match) return null;
    if (match[4] !== void 0 && Number(match[4]) === 0) return null;
    return 0.299 * Number(match[1]) + 0.587 * Number(match[2]) + 0.114 * Number(match[3]);
  }
  var Theme = class extends Emitter {
    current = "light";
    setting = "auto";
    observer = null;
    media = null;
    start(setting) {
      this.setting = setting;
      this.apply(this.detect());
      this.observe();
    }
    setSetting(setting) {
      this.setting = setting;
      this.apply(this.detect());
    }
    detect() {
      if (this.setting !== "auto") return this.setting;
      const flag = document.querySelector(FLAG_SELECTOR)?.textContent?.trim().toLowerCase();
      if (flag === "dark") return "dark";
      if (flag === "default" || flag === "light") return "light";
      const htmlTheme = (document.documentElement.dataset.theme || "").toLowerCase();
      if (htmlTheme === "dark") return "dark";
      if (htmlTheme === "light") return "light";
      if (document.body) {
        const lum = luminanceOf(getComputedStyle(document.body).backgroundColor);
        if (lum !== null && lum <= 34) return "dark";
        if (lum !== null && lum >= 245) return "light";
      }
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    apply(theme2) {
      document.documentElement.classList.toggle(DARK_CLASS, theme2 === "dark");
      if (theme2 !== this.current) {
        this.current = theme2;
        this.emit("change", theme2);
      }
    }
    observe() {
      if (this.observer) return;
      const recheck = () => this.apply(this.detect());
      this.observer = new MutationObserver(recheck);
      this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
      if (document.body) {
        this.observer.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
      }
      let attempts = 0;
      const findFlag = () => {
        const flag = document.querySelector(FLAG_SELECTOR);
        if (flag) {
          this.observer?.observe(flag, { characterData: true, childList: true, subtree: true });
          recheck();
          return;
        }
        if (attempts++ < 30) window.setTimeout(findFlag, 1e3);
      };
      findFlag();
      this.media = window.matchMedia?.("(prefers-color-scheme: dark)") ?? null;
      this.media?.addEventListener?.("change", recheck);
    }
  };
  var theme = new Theme();

  // src/lib/dom.ts
  function h(tag, props = null, ...children) {
    const el = document.createElement(tag);
    if (props) {
      const { class: className, dataset, style, attrs, on, ...rest } = props;
      if (className) el.className = className;
      if (dataset) for (const [k, v] of Object.entries(dataset)) el.dataset[k] = v;
      if (style) Object.assign(el.style, style);
      if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      if (on) {
        for (const [type, handler] of Object.entries(on)) {
          el.addEventListener(type, handler);
        }
      }
      Object.assign(el, rest);
    }
    append(el, children);
    return el;
  }
  function append(parent, children) {
    for (const child of children) {
      if (child === null || child === void 0 || child === false) continue;
      parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
    }
  }
  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
  function firstMatch(selectors, root = document) {
    for (const selector of selectors) {
      try {
        const el = root.querySelector(selector);
        if (el) return el;
      } catch {
      }
    }
    return null;
  }
  function icon(path, size = 16, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");
    if (className) svg.setAttribute("class", className);
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("fill", "currentColor");
    p.setAttribute("d", path);
    svg.appendChild(p);
    return svg;
  }
  var ICONS = {
    flame: "M13.5 0.7c0.4 3.1-1 5-2.6 6.6C9.2 9 7.5 10.6 7.5 13.5A4.5 4.5 0 0 0 12 18c2.5 0 4.5-2 4.5-4.5 0-1-0.3-1.9-0.8-2.6-0.3 1-1 1.8-1.9 2.1 0.5-1.8 0.2-3.7-0.9-5.2C12.6 9.4 12 11 10.8 12c0.1-2 1.4-3 2.4-4.4C14.4 6 14.8 3.4 13.5 0.7zM12 20a6.5 6.5 0 0 1-6.5-6.5c0-2.8 1.3-4.6 2.8-6.2C9.7 5.8 11 4.6 11.3 2.3c2.3 2.9 2.1 6 0.7 8.5 1.1 0.4 2 1.3 2.4 2.4 1.3 1 2.1 2.6 2.1 4.3A6.5 6.5 0 0 1 12 20z",
    gear: "M19.4 13a7.9 7.9 0 0 0 0-2l2.1-1.6a0.5 0.5 0 0 0 0.1-0.6l-2-3.5a0.5 0.5 0 0 0-0.6-0.2l-2.5 1a7.3 7.3 0 0 0-1.7-1l-0.4-2.6A0.5 0.5 0 0 0 14 2h-4a0.5 0.5 0 0 0-0.5 0.4L9.1 5a7.3 7.3 0 0 0-1.7 1l-2.5-1a0.5 0.5 0 0 0-0.6 0.2l-2 3.5a0.5 0.5 0 0 0 0.1 0.6L4.6 11a7.9 7.9 0 0 0 0 2l-2.1 1.6a0.5 0.5 0 0 0-0.1 0.6l2 3.5c0.1 0.2 0.4 0.3 0.6 0.2l2.5-1a7.3 7.3 0 0 0 1.7 1l0.4 2.6c0 0.3 0.2 0.4 0.5 0.4h4c0.2 0 0.5-0.2 0.5-0.4l0.4-2.6a7.3 7.3 0 0 0 1.7-1l2.5 1c0.2 0.1 0.5 0 0.6-0.2l2-3.5a0.5 0.5 0 0 0-0.1-0.6L19.4 13zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z",
    close: "M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z",
    home: "M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z",
    search: "M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z",
    filter: "M3 5h18l-7 8v6l-4 2v-8L3 5z",
    display: "M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z",
    general: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z",
    help: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-5h2v2h-2zm1-9a3.5 3.5 0 0 0-3.5 3.5h2a1.5 1.5 0 1 1 2.6 1L12 11.6V14h2v-1.6l0.7-0.7A3.5 3.5 0 0 0 12 6z",
    play: "M8 5v14l11-7z",
    stop: "M6 6h12v12H6z",
    trash: "M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 11H7L6 9z",
    refresh: "M17.6 6.4A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.2L13 11h7V4l-2.4 2.4z",
    external: "M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z",
    download: "M12 3v10.6l3.3-3.3 1.4 1.4L12 17.4l-4.7-4.7 1.4-1.4 3.3 3.3V3h2zM4 19h16v2H4z",
    upload: "M12 21V10.4l-3.3 3.3-1.4-1.4L12 7.6l4.7 4.7-1.4 1.4-3.3-3.3V21h-2zM4 3h16v2H4z",
    bulb: "M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zm-3 17h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1z",
    check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z",
    pixiv: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1.2 5c2.8 0 4.8 1.7 4.8 4.3 0 2.5-2 4.3-4.8 4.3h-2.4V18H8.4V7h4.8zm-0.2 2.1h-2.2v4.4h2.2c1.6 0 2.6-0.9 2.6-2.2 0-1.4-1-2.2-2.6-2.2z"
  };

  // src/lib/toast.ts
  var CONTAINER_ID = "mashiro-toasts";
  function container() {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = h("div", { id: CONTAINER_ID, class: "mashiro-root", attrs: { role: "status", "aria-live": "polite" } });
      document.body.appendChild(el);
    }
    return el;
  }
  function toast(message, kind = "info", durationMs = 3200) {
    const el = h("div", { class: `mashiro-toast mashiro-toast-${kind}` }, message);
    container().appendChild(el);
    requestAnimationFrame(() => el.classList.add("mashiro-toast-in"));
    window.setTimeout(() => {
      el.classList.remove("mashiro-toast-in");
      window.setTimeout(() => el.remove(), 250);
    }, durationMs);
  }

  // src/lib/api.ts
  var ApiError = class extends Error {
    constructor(status, url, message) {
      super(message || `Pixiv returned HTTP ${status}`);
      this.status = status;
      this.url = url;
      this.name = "ApiError";
    }
  };
  var ORIGIN = "https://www.pixiv.net";
  function searchUrl(p) {
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
  function recommendUrl(illustId, limit = 18) {
    return `${ORIGIN}/ajax/illust/${encodeURIComponent(illustId)}/recommend/init?limit=${limit}&lang=en`;
  }
  function readWorkList(data) {
    const body = data && !data.error ? data.body : void 0;
    const list = body?.illust?.data ?? body?.illustManga?.data ?? body?.manga?.data;
    return Array.isArray(list) ? list : [];
  }
  function readPopular(data) {
    const popular = data && !data.error ? data.body?.popular : void 0;
    return {
      permanent: Array.isArray(popular?.permanent) ? popular.permanent : [],
      recent: Array.isArray(popular?.recent) ? popular.recent : []
    };
  }
  function readRecommended(data) {
    const list = data && !data.error ? data.body?.illusts : void 0;
    return Array.isArray(list) ? list : [];
  }
  var THUMB_RE = /^(https:\/\/i\.pximg\.net)\/c\/[^/]+\/(?:img-master|custom-thumb)\/img\/(\d{4}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/\d+(?:_p\d+)?)_(?:square|custom|master)1200\.(jpg|png|gif)$/;
  function thumbnailAt(url, size = 540) {
    const match = THUMB_RE.exec(url);
    if (!match) return url;
    return `${match[1]}/c/${size}x${size}_70/img-master/img/${match[2]}_master1200.${match[3]}`;
  }
  async function fetchJson(url, signal) {
    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal
    });
    if (!response.ok) {
      throw new ApiError(response.status, url);
    }
    const data = await response.json();
    if (data && data.error) {
      throw new ApiError(response.status, url, data.message || "Pixiv returned error: true");
    }
    return data;
  }

  // src/lib/requestQueue.ts
  var QueueAbortedError = class extends Error {
    constructor() {
      super("Mashiro queue was cleared");
      this.name = "QueueAbortedError";
    }
  };
  var RequestQueue = class extends Emitter {
    gapMs = 500;
    retryAfterMs = 6e4;
    maxRateLimitRetries = 3;
    jobs = [];
    seq = 0;
    active = false;
    activeJob = null;
    paused = false;
    gapTimer = null;
    retryTimer = null;
    tickTimer = null;
    controller = null;
    rateLimitRetries = 0;
    completedCount = 0;
    get pending() {
      return this.jobs.length + (this.active ? 1 : 0);
    }
    get completed() {
      return this.completedCount;
    }
    get isPaused() {
      return this.paused;
    }
    /** Lower `priority` runs first; FIFO within a priority. */
    enqueue(url, priority = 0) {
      return new Promise((resolve, reject) => {
        const job = { url, priority, seq: this.seq++, resolve, reject };
        const index = this.jobs.findIndex((other) => other.priority > priority);
        if (index === -1) this.jobs.push(job);
        else this.jobs.splice(index, 0, job);
        this.pump();
      });
    }
    /** Drop queued jobs, abort the in-flight request, cancel timers. */
    clear() {
      const dropped = this.jobs;
      this.jobs = [];
      for (const job of dropped) job.reject(new QueueAbortedError());
      const controller = this.controller;
      this.controller = null;
      this.active = false;
      this.activeJob = null;
      this.paused = false;
      this.rateLimitRetries = 0;
      this.clearTimers();
      controller?.abort();
    }
    resetCounters() {
      this.completedCount = 0;
    }
    clearTimers() {
      for (const key of ["gapTimer", "retryTimer", "tickTimer"]) {
        const id = this[key];
        if (id !== null) {
          clearTimeout(id);
          clearInterval(id);
          this[key] = null;
        }
      }
    }
    pump() {
      if (this.active || this.paused || this.gapTimer !== null || !this.jobs.length) return;
      const job = this.jobs.shift();
      this.active = true;
      this.activeJob = job;
      this.controller = new AbortController();
      const started = Date.now();
      fetchJson(job.url, this.controller.signal).then(
        (data) => {
          if (this.activeJob !== job) {
            job.resolve(data);
            return;
          }
          this.rateLimitRetries = 0;
          this.finish(job, started, true, void 0);
          job.resolve(data);
        },
        (err) => {
          if (err instanceof DOMException && err.name === "AbortError") {
            if (this.activeJob === job) {
              this.activeJob = null;
              this.active = false;
              this.controller = null;
              job.reject(new QueueAbortedError());
              this.pump();
            } else {
              job.reject(new QueueAbortedError());
            }
            return;
          }
          if (this.activeJob !== job) {
            job.reject(err);
            return;
          }
          const status = err instanceof ApiError ? err.status : void 0;
          if (status === 429 && this.rateLimitRetries < this.maxRateLimitRetries) {
            this.rateLimitRetries++;
            this.jobs.unshift(job);
            this.active = false;
            this.activeJob = null;
            this.controller = null;
            this.emit("request", { url: job.url, ok: false, status, durationMs: Date.now() - started });
            this.pauseForRateLimit(status);
            return;
          }
          this.finish(job, started, false, status);
          job.reject(err);
        }
      );
    }
    finish(job, started, ok, status) {
      this.active = false;
      this.activeJob = null;
      this.controller = null;
      this.completedCount++;
      this.emit("request", { url: job.url, ok, status, durationMs: Date.now() - started });
      if (!this.jobs.length) {
        this.emit("idle", void 0);
        return;
      }
      this.gapTimer = window.setTimeout(() => {
        this.gapTimer = null;
        this.pump();
      }, this.gapMs);
    }
    pauseForRateLimit(status) {
      this.paused = true;
      const retryInMs = this.retryAfterMs;
      const until = Date.now() + retryInMs;
      this.emit("rateLimited", { status, retryInMs });
      this.tickTimer = window.setInterval(() => {
        this.emit("retryTick", { remainingMs: Math.max(0, until - Date.now()) });
      }, 1e3);
      this.retryTimer = window.setTimeout(() => {
        this.clearTimers();
        this.paused = false;
        this.pump();
      }, retryInMs);
    }
  };
  var queue = new RequestQueue();

  // src/popular/filter.ts
  function checkWork(item, options) {
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

  // src/popular/crawler.ts
  var PRIORITY_BUCKET = 0;
  var PRIORITY_POPULAR = 1;
  var PRIORITY_RECOMMEND = 2;
  var PAGE_SIZE = 60;
  function freshProgress() {
    return {
      phase: "idle",
      bucketsTotal: 0,
      bucketsDone: 0,
      currentBucket: null,
      found: 0,
      filtered: 0,
      requests: 0,
      perSection: {},
      error: null,
      errorStatus: null,
      retryInMs: null
    };
  }
  var PopularCrawler = class extends Emitter {
    progress = freshProgress();
    availability = "unknown";
    generation = 0;
    seen = /* @__PURE__ */ new Set();
    settings = null;
    filterOptions = null;
    constructor() {
      super();
      queue.on("request", () => {
        if (this.progress.phase === "buckets" || this.progress.phase === "alt" || this.progress.phase === "paused") {
          this.progress.requests++;
          this.emitProgress();
        }
      });
      queue.on("rateLimited", ({ status, retryInMs }) => {
        if (!this.isRunning()) return;
        this.progress.phase = "paused";
        this.progress.retryInMs = retryInMs;
        log.warning(`Pixiv returned ${status}; waiting ${Math.round(retryInMs / 1e3)}s before retrying`, "ratelimit");
        this.emitProgress();
      });
      queue.on("retryTick", ({ remainingMs }) => {
        if (this.progress.phase !== "paused") return;
        this.progress.retryInMs = remainingMs;
        this.emitProgress();
      });
    }
    get results() {
      return this.seen.size;
    }
    isRunning() {
      return this.progress.phase === "buckets" || this.progress.phase === "alt" || this.progress.phase === "paused";
    }
    /** Forget everything (page changed). Aborts any running work. */
    reset() {
      this.generation++;
      queue.clear();
      queue.resetCounters();
      this.seen.clear();
      this.settings = null;
      this.filterOptions = null;
      this.progress = freshProgress();
      this.availability = "unknown";
      this.emit("reset", void 0);
      this.emit("availability", this.availability);
      this.emitProgress();
    }
    /** Stop the current crawl but keep the results. */
    stop() {
      if (!this.isRunning()) return;
      this.generation++;
      queue.clear();
      this.progress.phase = "stopped";
      this.progress.retryInMs = null;
      log.info(`Stopped with ${this.seen.size} works`);
      this.emitProgress();
    }
    /**
     * One cheap request tells us whether any "<N>users入り" work exists for the
     * query (partial tag match on "users入り" hits every bucket at once). A
     * second one checks Pixiv's own popular list. Sets `availability`.
     */
    async probe(page, settings2) {
      if (this.isRunning()) return this.availability;
      const generation = ++this.generation;
      this.settings = settings2;
      this.setAvailability("probing");
      this.applyQueueSettings(settings2);
      try {
        const bucketData = await queue.enqueue(
          searchUrl({ ...this.searchBase(page, settings2), word: `${page.word} ${SUFFIX}`, page: 1 }),
          PRIORITY_BUCKET
        );
        if (generation !== this.generation) return this.availability;
        const hasBuckets = readWorkList(bucketData).some((item) => highestBucket(item.tags || []) !== null);
        if (hasBuckets) {
          this.setAvailability("orange");
          return "orange";
        }
        if (settings2.altMode === "off") {
          this.setAvailability("grey");
          return "grey";
        }
        const popularData = await queue.enqueue(
          searchUrl({ ...this.searchBase(page, settings2), page: 1 }),
          PRIORITY_POPULAR
        );
        if (generation !== this.generation) return this.availability;
        const popular = readPopular(popularData);
        const available = popular.permanent.length + popular.recent.length > 0 ? "blue" : "grey";
        this.setAvailability(available);
        return available;
      } catch (err) {
        if (generation !== this.generation || err instanceof QueueAbortedError) return this.availability;
        this.reportError(err, "probe");
        this.setAvailability("unknown");
        return "unknown";
      }
    }
    /** Run the full crawl for `page`. Resolves when finished, stopped or failed. */
    async start(page, settings2) {
      if (this.isRunning()) this.stop();
      const generation = ++this.generation;
      const alive = () => generation === this.generation;
      if (this.availability === "probing") this.setAvailability("unknown");
      this.settings = settings2;
      this.seen.clear();
      this.filterOptions = {
        tab: page.tab,
        hideR18: settings2.hideR18,
        hideR18G: settings2.hideR18G,
        hideAI: settings2.hideAI,
        hideUgoira: settings2.hideUgoira,
        excludeTags: parseTagList(settings2.excludeTags),
        minPageCount: settings2.minPageCount,
        dateFrom: settings2.dateFrom,
        dateTo: settings2.dateTo
      };
      this.applyQueueSettings(settings2);
      queue.resetCounters();
      const probeSaysNoBuckets = this.availability === "blue" || this.availability === "grey";
      const buckets = probeSaysNoBuckets ? [] : bucketsFrom(settings2.minBucket);
      this.progress = { ...freshProgress(), phase: "buckets", bucketsTotal: buckets.length };
      this.emitProgress();
      if (buckets.length) {
        log.info(`Popular mode: "${page.word}" (${page.tab}), buckets ${buckets[0]} → ${buckets[buckets.length - 1]}`);
      } else {
        log.info(`Popular mode: "${page.word}" (${page.tab}), no users入り works — using Pixiv's popular list`);
      }
      try {
        let bucketFound = 0;
        for (const bucket of buckets) {
          if (!alive() || this.limitReached()) break;
          this.progress.currentBucket = bucket;
          this.emitProgress();
          bucketFound += await this.crawlBucket(page, settings2, bucket, alive);
          if (!alive()) return;
          this.progress.bucketsDone++;
          this.emitProgress();
        }
        if (!alive()) return;
        const wantAlt = settings2.altMode === "always" || settings2.altMode === "auto" && bucketFound < settings2.altThreshold;
        if (wantAlt && !this.limitReached()) {
          this.progress.phase = "alt";
          this.progress.currentBucket = null;
          this.emitProgress();
          await this.crawlAlt(page, settings2, alive);
          if (!alive()) return;
        }
        this.progress.phase = "done";
        this.progress.currentBucket = null;
        this.progress.retryInMs = null;
        log.success(`Done: ${this.seen.size} works (${this.progress.filtered} hidden by filters, ${this.progress.requests} requests)`);
        this.emitProgress();
      } catch (err) {
        if (!alive() || err instanceof QueueAbortedError) return;
        this.reportError(err, "crawl");
        this.progress.phase = "error";
        this.progress.retryInMs = null;
        this.emitProgress();
      }
    }
    // ---- phases ------------------------------------------------------------
    async crawlBucket(page, settings2, bucket, alive) {
      let found = 0;
      for (let p = 1; p <= settings2.maxPagesPerBucket; p++) {
        if (!alive() || this.limitReached()) break;
        const data = await queue.enqueue(
          searchUrl({ ...this.searchBase(page, settings2), word: `${page.word} ${bucket}${SUFFIX}`, page: p }),
          PRIORITY_BUCKET
        );
        if (!alive()) break;
        const list = readWorkList(data);
        for (const item of list) {
          if (this.admit(item, bucket)) found++;
        }
        log.info(`${bucket}${SUFFIX} page ${p}: ${list.length} works, ${this.seen.size} total`, `bucket-${bucket}`);
        if (list.length < PAGE_SIZE) break;
      }
      return found;
    }
    async crawlAlt(page, settings2, alive) {
      const data = await queue.enqueue(
        searchUrl({ ...this.searchBase(page, settings2), page: 1 }),
        PRIORITY_POPULAR
      );
      if (!alive()) return;
      const popular = readPopular(data);
      const seeds = [];
      for (const item of [...popular.permanent, ...popular.recent]) {
        if (this.admit(item, "alt")) seeds.push(item.id);
      }
      log.info(`Pixiv popular list: ${popular.permanent.length + popular.recent.length} works, ${seeds.length} new`);
      if (settings2.recoDepth <= 0) return;
      const word = page.word.toLowerCase();
      const pending = seeds.map((id) => ({ id, depth: 1 }));
      const visited = /* @__PURE__ */ new Set();
      const recoLimit = 60;
      let recoRequests = 0;
      while (pending.length && alive() && !this.limitReached() && recoRequests < recoLimit) {
        const { id, depth } = pending.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        recoRequests++;
        const reco = await queue.enqueue(recommendUrl(id), PRIORITY_RECOMMEND);
        if (!alive()) return;
        for (const item of readRecommended(reco)) {
          if (!Array.isArray(item.tags) || !item.tags.some((tag) => tag.toLowerCase() === word)) continue;
          if (this.admit(item, "alt") && depth < settings2.recoDepth) {
            pending.push({ id: item.id, depth: depth + 1 });
          }
        }
        log.info(`Recommendations: ${recoRequests} requests, ${this.seen.size} works total`, "reco");
      }
    }
    // ---- helpers -----------------------------------------------------------
    /** Filter + dedupe. Emits `work` when admitted. */
    admit(item, fallback) {
      if (!this.filterOptions || this.limitReached()) return false;
      const reason = checkWork(item, this.filterOptions);
      if (reason) {
        if (reason !== "invalid" && reason !== "ad") this.progress.filtered++;
        return false;
      }
      if (this.seen.has(item.id)) return false;
      this.seen.add(item.id);
      const tagged = highestBucket(item.tags);
      let section = fallback;
      if (tagged && (fallback === "alt" || bucketValue(tagged) > bucketValue(fallback))) section = tagged;
      if (section !== "alt" && this.settings && bucketValue(section) < bucketValue(this.settings.minBucket)) {
        section = fallback;
      }
      this.progress.found = this.seen.size;
      this.progress.perSection[section] = (this.progress.perSection[section] || 0) + 1;
      this.emit("work", { item, section });
      return true;
    }
    limitReached() {
      return !!this.settings && this.seen.size >= this.settings.resultLimit;
    }
    searchBase(page, settings2) {
      const extra = settings2.inheritPageFilters ? { ...page.pageFilters } : {};
      if (settings2.dateFrom) extra.scd = settings2.dateFrom;
      if (settings2.dateTo) extra.ecd = settings2.dateTo;
      if (settings2.hideAI) extra.ai_type = "1";
      return {
        word: page.word,
        apiPath: page.apiPath,
        type: page.type,
        order: settings2.orderInBucket,
        extra
      };
    }
    applyQueueSettings(settings2) {
      queue.gapMs = settings2.requestGapMs;
      queue.retryAfterMs = settings2.retryAfter429Seconds * 1e3;
    }
    setAvailability(value) {
      this.availability = value;
      this.emit("availability", value);
    }
    reportError(err, where) {
      if (err instanceof ApiError) {
        this.progress.error = err.message;
        this.progress.errorStatus = err.status;
        log.error(`${where}: HTTP ${err.status} for ${err.url.replace(/^https:\/\/www\.pixiv\.net/, "")}`);
      } else {
        this.progress.error = err instanceof Error ? err.message : String(err);
        this.progress.errorStatus = null;
        log.error(`${where}: ${this.progress.error}`);
      }
    }
    emitProgress() {
      this.emit("progress", { ...this.progress, perSection: { ...this.progress.perSection } });
    }
  };
  var SECTION_ORDER = [...BUCKETS, "alt"];
  var crawler = new PopularCrawler();

  // src/panel/controls.ts
  function rowText({ label, help }) {
    return h(
      "span",
      { class: "mashiro-row-text" },
      h("span", { class: "mashiro-row-label" }, label),
      help ? h("span", { class: "mashiro-row-help" }, help) : null
    );
  }
  function toggleRow(text, value, onChange) {
    const input = h("input", { type: "checkbox", checked: value, class: "mashiro-switch-input" });
    input.addEventListener("change", () => onChange(input.checked));
    const el = h(
      "label",
      { class: "mashiro-row mashiro-row-toggle" },
      rowText(text),
      h("span", { class: "mashiro-switch" }, input, h("span", { class: "mashiro-switch-track" }))
    );
    return { el, set: (v) => {
      input.checked = v;
    } };
  }
  function numberRow(text, value, range, onChange) {
    const input = h("input", {
      type: "number",
      class: "mashiro-input mashiro-input-number",
      min: String(range.min),
      max: String(range.max),
      step: String(range.step || 1),
      value: String(value)
    });
    const commit = () => {
      const n = Number(input.value);
      if (Number.isFinite(n)) onChange(n);
    };
    input.addEventListener("change", commit);
    const el = h("label", { class: "mashiro-row" }, rowText(text), input);
    return { el, set: (v) => {
      input.value = String(v);
    } };
  }
  function selectRow(text, value, options, onChange) {
    const select = h(
      "select",
      { class: "mashiro-input mashiro-input-select" },
      ...options.map((opt) => h("option", { value: opt.value, selected: opt.value === value }, opt.label))
    );
    select.addEventListener("change", () => onChange(select.value));
    const el = h("label", { class: "mashiro-row" }, rowText(text), select);
    return { el, set: (v) => {
      select.value = v;
    } };
  }
  function textRow(text, value, onChange, type = "text", placeholder = "") {
    const input = h("input", { type, class: "mashiro-input mashiro-input-text", value, placeholder });
    input.addEventListener("change", () => onChange(input.value));
    const el = h("label", { class: "mashiro-row" }, rowText(text), input);
    return { el, set: (v) => {
      input.value = v;
    } };
  }
  function textareaRow(text, value, onChange, placeholder = "") {
    const input = h("textarea", { class: "mashiro-input mashiro-input-textarea", value, placeholder, rows: 3 });
    input.addEventListener("change", () => onChange(input.value));
    const el = h("label", { class: "mashiro-row mashiro-row-stacked" }, rowText(text), input);
    return { el, set: (v) => {
      input.value = v;
    } };
  }
  function button(label, onClick, variant = "outline", iconEl) {
    return h("button", { type: "button", class: `mashiro-button mashiro-button-${variant}`, on: { click: onClick } }, iconEl || null, label);
  }
  function card(title, iconEl, ...children) {
    return h(
      "section",
      { class: "mashiro-card-box" },
      h("header", { class: "mashiro-card-head" }, h("span", { class: "mashiro-card-icon" }, iconEl), h("h3", null, title)),
      h("div", { class: "mashiro-card-body" }, ...children)
    );
  }

  // src/panel/panel.ts
  var PANEL_ID = "mashiro-panel";
  var SettingsPanel = class {
    constructor(host) {
      this.host = host;
    }
    root = null;
    content = null;
    navButtons = /* @__PURE__ */ new Map();
    view = "home";
    controls = /* @__PURE__ */ new Map();
    unsubscribe = [];
    // Home view live elements
    stateBadge = null;
    searchLine = null;
    availLine = null;
    progressBar = null;
    progressLabel = null;
    statFound = null;
    statFiltered = null;
    statRequests = null;
    perSection = null;
    logList = null;
    startButton = null;
    stopButton = null;
    onKeydown = (ev) => {
      if (ev.key === "Escape") this.close();
    };
    get isOpen() {
      return !!this.root?.isConnected;
    }
    open(view = this.view) {
      if (!this.root) this.build();
      document.body.appendChild(this.root);
      this.show(view);
      document.addEventListener("keydown", this.onKeydown);
      this.refreshHome();
    }
    close() {
      this.root?.remove();
      document.removeEventListener("keydown", this.onKeydown);
    }
    toggle() {
      if (this.isOpen) this.close();
      else this.open();
    }
    /** Throw the DOM away (e.g. after a language change); reopen if it was open. */
    rebuild() {
      const wasOpen = this.isOpen;
      this.close();
      for (const off of this.unsubscribe) off();
      this.unsubscribe = [];
      this.controls.clear();
      this.root = null;
      if (wasOpen) this.open(this.view);
    }
    /** Called by the controller whenever page/availability/progress changes. */
    refreshHome() {
      if (!this.isOpen) return;
      const page = this.host.getPage();
      const progress = this.host.crawler.progress;
      const availability = this.host.crawler.availability;
      if (this.searchLine) {
        clear(this.searchLine);
        if (page.kind === "search") {
          this.searchLine.append(h("strong", null, `#${page.word}`), ` · ${page.tab}`);
        } else {
          this.searchLine.textContent = t("notSearchPage");
        }
      }
      if (this.availLine) {
        clear(this.availLine);
        this.availLine.append(h("span", { class: `mashiro-dot is-${availability}` }), this.availabilityText(availability));
      }
      if (this.stateBadge) {
        this.stateBadge.className = `mashiro-state is-${progress.phase}`;
        this.stateBadge.textContent = this.stateText(progress, availability);
      }
      const running = this.host.crawler.isRunning();
      if (this.startButton) this.startButton.disabled = running || page.kind !== "search";
      if (this.stopButton) this.stopButton.disabled = !running;
      const ratio = progress.phase === "done" ? 1 : progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
      if (this.progressBar) this.progressBar.style.width = `${Math.round(ratio * 100)}%`;
      if (this.progressLabel) {
        this.progressLabel.textContent = progress.bucketsTotal ? `${Math.min(progress.bucketsDone, progress.bucketsTotal)} / ${progress.bucketsTotal}` : "—";
      }
      if (this.statFound) this.statFound.textContent = String(progress.found);
      if (this.statFiltered) this.statFiltered.textContent = String(progress.filtered);
      if (this.statRequests) this.statRequests.textContent = String(progress.requests);
      if (this.perSection) {
        clear(this.perSection);
        for (const section of SECTION_ORDER) {
          const n = progress.perSection[section];
          if (!n) continue;
          this.perSection.append(h(
            "span",
            { class: `mashiro-bucket-pill ${section === "alt" ? "is-alt" : ""}` },
            section === "alt" ? "★" : bucketLabel(section),
            h("b", null, String(n))
          ));
        }
      }
    }
    // ---- building ----------------------------------------------------------
    build() {
      const nav = h("nav", { class: "mashiro-panel-nav" });
      const items = [
        ["home", ICONS.home, t("navHome")],
        ["crawl", ICONS.search, t("navCrawl")],
        ["filters", ICONS.filter, t("navFilters")],
        ["display", ICONS.display, t("navDisplay")],
        ["general", ICONS.general, t("navGeneral")],
        ["help", ICONS.help, t("navHelp")]
      ];
      for (const [view, iconPath, label] of items) {
        const btn = h("button", { type: "button", class: "mashiro-nav-item", dataset: { view }, on: { click: () => this.show(view) } }, icon(iconPath, 20), h("span", null, label));
        this.navButtons.set(view, btn);
        nav.appendChild(btn);
      }
      nav.appendChild(h("div", { class: "mashiro-panel-nav-foot" }, `v${this.host.version}`));
      this.content = h("div", { class: "mashiro-panel-content" });
      const logoSrc = assetUrl("images/mashiro.png");
      const windowEl = h(
        "div",
        { class: "mashiro-panel-window", attrs: { role: "dialog", "aria-modal": "true", "aria-label": t("panelTitle") } },
        h(
          "header",
          { class: "mashiro-panel-head" },
          logoSrc ? h("img", { class: "mashiro-panel-logo", src: logoSrc, alt: "" }) : icon(ICONS.flame, 28, "mashiro-panel-logo"),
          h(
            "div",
            { class: "mashiro-panel-titles" },
            h("h2", null, t("panelTitle")),
            h("p", null, t("panelSubtitle"))
          ),
          h("a", { class: "mashiro-icon-button", href: this.host.repoUrl, target: "_blank", rel: "noopener", title: t("helpProject") }, icon(ICONS.external, 18)),
          h("button", { type: "button", class: "mashiro-icon-button mashiro-panel-close", title: t("close"), attrs: { "aria-label": t("close") }, on: { click: () => this.close() } }, icon(ICONS.close, 20))
        ),
        h("div", { class: "mashiro-panel-body" }, nav, this.content)
      );
      this.root = h(
        "div",
        { id: PANEL_ID, class: "mashiro-root mashiro-panel" },
        h("div", { class: "mashiro-panel-scrim", on: { click: () => this.close() } }),
        windowEl
      );
      this.unsubscribe.push(
        this.host.settings.on("change", ({ key, value }) => {
          const control = this.controls.get(key);
          control?.set(value);
        }),
        this.host.crawler.on("progress", () => this.refreshHome()),
        this.host.crawler.on("availability", () => this.refreshHome()),
        log.on("entry", (entry) => this.renderLogEntry(entry)),
        log.on("clear", () => this.logList && clear(this.logList))
      );
    }
    show(view) {
      this.view = view;
      for (const [name, btn] of this.navButtons) btn.classList.toggle("is-active", name === view);
      if (!this.content) return;
      clear(this.content);
      switch (view) {
        case "home":
          this.content.appendChild(this.homeView());
          this.refreshHome();
          break;
        case "crawl":
          this.content.appendChild(this.crawlView());
          break;
        case "filters":
          this.content.appendChild(this.filtersView());
          break;
        case "display":
          this.content.appendChild(this.displayView());
          break;
        case "general":
          this.content.appendChild(this.generalView());
          break;
        case "help":
          this.content.appendChild(this.helpView());
          break;
      }
      this.content.scrollTop = 0;
    }
    // ---- views -------------------------------------------------------------
    homeView() {
      this.stateBadge = h("span", { class: "mashiro-state" });
      this.searchLine = h("span", { class: "mashiro-kv-value" });
      this.availLine = h("span", { class: "mashiro-kv-value" });
      this.startButton = button(t("startCrawl"), () => this.host.start(), "primary", icon(ICONS.play));
      this.stopButton = button(t("stopCrawl"), () => this.host.stop(), "danger", icon(ICONS.stop));
      const clearButton = button(t("clearResults"), () => this.host.clearResults(), "outline", icon(ICONS.trash));
      this.progressBar = h("span", { class: "mashiro-progress-fill" });
      this.progressLabel = h("span", { class: "mashiro-progress-label" });
      this.statFound = h("b", null, "0");
      this.statFiltered = h("b", null, "0");
      this.statRequests = h("b", null, "0");
      this.perSection = h("div", { class: "mashiro-pills" });
      this.logList = h("ul", { class: "mashiro-log" });
      for (const entry of log.entries) this.renderLogEntry(entry);
      return h(
        "div",
        { class: "mashiro-view" },
        h("div", { class: "mashiro-tip" }, h("span", { class: "mashiro-card-icon" }, icon(ICONS.bulb, 18)), h("p", null, t("tipSafe"))),
        card(
          t("statusTitle"),
          icon(ICONS.flame, 18),
          h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("statusTitle")), this.stateBadge),
          h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("currentSearch")), this.searchLine),
          h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("availability")), this.availLine),
          h("div", { class: "mashiro-button-row" }, this.startButton, this.stopButton, clearButton)
        ),
        card(
          t("progress"),
          icon(ICONS.download, 18),
          h("div", { class: "mashiro-progress" }, h("span", { class: "mashiro-progress-track" }, this.progressBar), this.progressLabel),
          h(
            "div",
            { class: "mashiro-stats" },
            h("span", null, t("found"), " ", this.statFound),
            h("span", null, t("filteredOut", { n: "" }).replace(/^\s*/, ""), " ", this.statFiltered),
            h("span", null, t("requests"), " ", this.statRequests)
          ),
          h("div", { class: "mashiro-kv" }, h("span", { class: "mashiro-kv-key" }, t("perBucket")), this.perSection)
        ),
        card(
          t("logTitle"),
          icon(ICONS.general, 18),
          this.logList,
          h("div", { class: "mashiro-button-row" }, button(t("clearLog"), () => log.clear(), "ghost", icon(ICONS.trash)))
        )
      );
    }
    crawlView() {
      const s = this.host.settings;
      return h(
        "div",
        { class: "mashiro-view" },
        card(
          t("secCrawl"),
          icon(ICONS.search, 18),
          this.bind("minBucket", selectRow(
            { label: t("minBucket"), help: t("minBucketHelp") },
            s.get("minBucket"),
            BUCKETS.map((b) => ({ value: b, label: `${b} users入り` })),
            (v) => s.set("minBucket", v)
          )),
          this.bind("resultLimit", numberRow({ label: t("resultLimit") }, s.get("resultLimit"), { min: 50, max: 5e3, step: 50 }, (v) => s.set("resultLimit", v))),
          this.bind("maxPagesPerBucket", numberRow({ label: t("maxPages") }, s.get("maxPagesPerBucket"), { min: 1, max: 20 }, (v) => s.set("maxPagesPerBucket", v))),
          this.bind("orderInBucket", selectRow(
            { label: t("orderInBucket") },
            s.get("orderInBucket"),
            [{ value: "date_d", label: t("newestFirst") }, { value: "date", label: t("oldestFirst") }],
            (v) => s.set("orderInBucket", v)
          )),
          this.bind("inheritPageFilters", toggleRow({ label: t("inheritPageFilters") }, s.get("inheritPageFilters"), (v) => s.set("inheritPageFilters", v))),
          this.bind("probeOnLoad", toggleRow({ label: t("probeOnLoad"), help: t("probeOnLoadHelp") }, s.get("probeOnLoad"), (v) => s.set("probeOnLoad", v)))
        ),
        card(
          t("altMode"),
          icon(ICONS.pixiv, 18),
          this.bind("altMode", selectRow(
            { label: t("altMode") },
            s.get("altMode"),
            [{ value: "auto", label: t("altAuto") }, { value: "always", label: t("altAlways") }, { value: "off", label: t("altOff") }],
            (v) => s.set("altMode", v)
          )),
          this.bind("altThreshold", numberRow({ label: t("altThreshold") }, s.get("altThreshold"), { min: 0, max: 1e3, step: 5 }, (v) => s.set("altThreshold", v))),
          this.bind("recoDepth", numberRow({ label: t("recoDepth") }, s.get("recoDepth"), { min: 0, max: 2 }, (v) => s.set("recoDepth", v)))
        ),
        card(
          t("requests"),
          icon(ICONS.refresh, 18),
          this.bind("requestGapMs", numberRow({ label: t("requestGap") }, s.get("requestGapMs"), { min: 200, max: 5e3, step: 50 }, (v) => s.set("requestGapMs", v))),
          this.bind("retryAfter429Seconds", numberRow({ label: t("retryAfter429") }, s.get("retryAfter429Seconds"), { min: 10, max: 600, step: 5 }, (v) => s.set("retryAfter429Seconds", v)))
        )
      );
    }
    filtersView() {
      const s = this.host.settings;
      return h(
        "div",
        { class: "mashiro-view" },
        card(
          t("secFilters"),
          icon(ICONS.filter, 18),
          this.bind("hideR18", toggleRow({ label: t("hideR18") }, s.get("hideR18"), (v) => s.set("hideR18", v))),
          this.bind("hideR18G", toggleRow({ label: t("hideR18G") }, s.get("hideR18G"), (v) => s.set("hideR18G", v))),
          this.bind("hideAI", toggleRow({ label: t("hideAI") }, s.get("hideAI"), (v) => s.set("hideAI", v))),
          this.bind("hideUgoira", toggleRow({ label: t("hideUgoira") }, s.get("hideUgoira"), (v) => s.set("hideUgoira", v))),
          this.bind("minPageCount", numberRow({ label: t("minPageCount") }, s.get("minPageCount"), { min: 0, max: 200 }, (v) => s.set("minPageCount", v))),
          this.bind("dateFrom", textRow({ label: t("dateFrom") }, s.get("dateFrom"), (v) => s.set("dateFrom", v), "date")),
          this.bind("dateTo", textRow({ label: t("dateTo") }, s.get("dateTo"), (v) => s.set("dateTo", v), "date")),
          this.bind("excludeTags", textareaRow({ label: t("excludeTags"), help: t("excludeTagsHelp") }, s.get("excludeTags"), (v) => s.set("excludeTags", v), "R-18G, 腐向け, …"))
        )
      );
    }
    displayView() {
      const s = this.host.settings;
      return h(
        "div",
        { class: "mashiro-view" },
        card(
          t("secDisplay"),
          icon(ICONS.display, 18),
          this.bind("cardSize", selectRow(
            { label: t("cardSize") },
            s.get("cardSize"),
            [{ value: "compact", label: t("sizeCompact") }, { value: "regular", label: t("sizeRegular") }, { value: "large", label: t("sizeLarge") }],
            (v) => s.set("cardSize", v)
          )),
          this.bind("showBucketHeaders", toggleRow({ label: t("showBucketHeaders") }, s.get("showBucketHeaders"), (v) => s.set("showBucketHeaders", v))),
          this.bind("showBucketBadge", toggleRow({ label: t("showBucketBadge") }, s.get("showBucketBadge"), (v) => s.set("showBucketBadge", v))),
          this.bind("showAuthor", toggleRow({ label: t("showAuthor") }, s.get("showAuthor"), (v) => s.set("showAuthor", v))),
          this.bind("openInNewTab", toggleRow({ label: t("openInNewTab") }, s.get("openInNewTab"), (v) => s.set("openInNewTab", v))),
          this.bind("autoStart", toggleRow({ label: t("autoStart") }, s.get("autoStart"), (v) => s.set("autoStart", v))),
          this.bind("showPanelButton", toggleRow({ label: t("showPanelButton") }, s.get("showPanelButton"), (v) => s.set("showPanelButton", v)))
        )
      );
    }
    generalView() {
      const s = this.host.settings;
      const fileInput = h("input", { type: "file", accept: "application/json,.json", hidden: true });
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        fileInput.value = "";
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          const known = Object.keys(DEFAULT_SETTINGS).filter((key) => key in parsed);
          if (!parsed || typeof parsed !== "object" || !known.length) throw new Error("not a settings file");
          await s.replace(parsed);
          toast(t("importDone"), "success");
        } catch {
          toast(t("importFailed"), "error");
        }
      });
      return h(
        "div",
        { class: "mashiro-view" },
        card(
          t("secGeneral"),
          icon(ICONS.general, 18),
          this.bind("language", selectRow(
            { label: t("language") },
            s.get("language"),
            [{ value: "auto", label: t("followPixiv") }, { value: "en", label: "English" }, { value: "ja", label: "日本語" }, { value: "zh-CN", label: "简体中文" }],
            (v) => s.set("language", v)
          )),
          this.bind("theme", selectRow(
            { label: t("theme") },
            s.get("theme"),
            [{ value: "auto", label: t("followPixiv") }, { value: "light", label: t("themeLight") }, { value: "dark", label: t("themeDark") }],
            (v) => s.set("theme", v)
          ))
        ),
        card(
          t("exportSettings"),
          icon(ICONS.download, 18),
          h(
            "div",
            { class: "mashiro-button-row" },
            button(t("exportSettings"), () => this.exportSettings(), "outline", icon(ICONS.download)),
            button(t("importSettings"), () => fileInput.click(), "outline", icon(ICONS.upload)),
            button(t("resetSettings"), async () => {
              if (!confirm(t("resetConfirm"))) return;
              await s.reset();
              toast(t("settingsReset"), "success");
            }, "danger", icon(ICONS.trash)),
            fileInput
          )
        )
      );
    }
    helpView() {
      return h(
        "div",
        { class: "mashiro-view" },
        card(t("helpHowTitle"), icon(ICONS.help, 18), h("p", { class: "mashiro-prose" }, t("helpHow"))),
        card(
          t("helpColorsTitle"),
          icon(ICONS.flame, 18),
          h(
            "p",
            { class: "mashiro-prose" },
            h("span", { class: "mashiro-dot is-orange" }),
            " ",
            h("span", { class: "mashiro-dot is-blue" }),
            " ",
            h("span", { class: "mashiro-dot is-grey" }),
            " ",
            t("helpColors")
          )
        ),
        card(t("helpTipsTitle"), icon(ICONS.bulb, 18), h("p", { class: "mashiro-prose" }, t("helpTips"))),
        card(
          t("secHelp"),
          icon(ICONS.external, 18),
          h(
            "p",
            { class: "mashiro-prose" },
            t("helpVersion", { v: this.host.version }),
            " · ",
            h("a", { href: this.host.repoUrl, target: "_blank", rel: "noopener" }, t("helpProject"))
          ),
          h("p", { class: "mashiro-prose mashiro-muted" }, t("helpCredits"))
        )
      );
    }
    // ---- helpers -----------------------------------------------------------
    bind(key, control) {
      this.controls.set(key, control);
      control.el.dataset.setting = key;
      return control.el;
    }
    renderLogEntry(entry) {
      if (!this.logList) return;
      const time = new Date(entry.time).toLocaleTimeString();
      const escape = (value) => typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, "\\$&");
      let li = entry.key ? this.logList.querySelector(`li[data-key="${escape(entry.key)}"]`) : null;
      if (!li) {
        li = h("li", entry.key ? { dataset: { key: entry.key } } : null);
        this.logList.appendChild(li);
        while (this.logList.childElementCount > 200) this.logList.firstElementChild?.remove();
      }
      li.className = `is-${entry.level}`;
      clear(li);
      li.append(h("time", null, time), " ", entry.text);
      this.logList.scrollTop = this.logList.scrollHeight;
    }
    exportSettings() {
      const blob = new Blob([this.host.settings.export()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = h("a", { href: url, download: `mashiro-settings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json` });
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
    }
    availabilityText(availability) {
      switch (availability) {
        case "orange":
          return t("availOrange");
        case "blue":
          return t("availBlue");
        case "grey":
          return t("availGrey");
        case "probing":
          return t("stateProbing");
        default:
          return t("availUnknown");
      }
    }
    stateText(progress, availability) {
      switch (progress.phase) {
        case "buckets":
        case "alt":
          return t("stateRunning");
        case "paused":
          return t("statePaused");
        case "done":
          return t("stateDone");
        case "stopped":
          return t("stateStopped");
        case "error":
          return t("stateError");
        default:
          return availability === "probing" ? t("stateProbing") : t("stateIdle");
      }
    }
  };

  // src/popular/button.ts
  var BUTTON_ID = "mashiro-popular";
  var PANEL_BUTTON_ID = "mashiro-panel-button";
  var WRAPPER_ID = "mashiro-toolbar";
  var SORT_CHIP_SELECTORS = [
    '[data-ga4-label="order_filter_chip"]',
    'button[aria-label*="sort" i]',
    'button[aria-label*="並び"]',
    'button[aria-label*="排序"]'
  ];
  var PopularButton = class {
    constructor(callbacks) {
      this.callbacks = callbacks;
    }
    wrapper = null;
    button = null;
    badge = null;
    gear = null;
    availability = "unknown";
    active = false;
    busy = false;
    isTopTab = false;
    /** Insert or re-attach. Returns false when there is nowhere to put it yet. */
    ensure(showGear) {
      if (!document.body) return false;
      if (!this.wrapper) this.build();
      const wrapper = this.wrapper;
      if (this.gear) this.gear.hidden = !showGear;
      const chip = firstMatch(SORT_CHIP_SELECTORS);
      if (chip && !chip.closest(".mashiro-root")) {
        if (chip.nextElementSibling !== wrapper) chip.insertAdjacentElement("afterend", wrapper);
        wrapper.classList.remove("is-floating");
        return true;
      }
      if (!wrapper.isConnected || !wrapper.classList.contains("is-floating")) {
        wrapper.classList.add("is-floating");
        document.body.appendChild(wrapper);
      }
      return true;
    }
    remove() {
      this.wrapper?.remove();
    }
    setAvailability(value) {
      this.availability = value;
      this.render();
    }
    setActive(active) {
      this.active = active;
      this.render();
    }
    setBusy(busy) {
      this.busy = busy;
      this.render();
    }
    setTopTab(isTop) {
      this.isTopTab = isTop;
      this.render();
    }
    setCount(count) {
      if (this.badge) this.badge.textContent = count ? String(count) : "";
    }
    retranslate() {
      if (this.button) this.button.firstChild.textContent = t("popular");
      this.gear?.setAttribute("title", t("openSettings"));
      this.gear?.setAttribute("aria-label", t("openSettings"));
      this.render();
    }
    build() {
      this.badge = h("span", { class: "mashiro-popular-count" });
      this.button = h("button", {
        type: "button",
        id: BUTTON_ID,
        class: "mashiro-chip mashiro-popular",
        on: {
          click: (ev) => {
            ev.preventDefault();
            this.callbacks.onPopular();
          }
        }
      }, t("popular"), this.badge, h("span", { class: "mashiro-spinner", attrs: { "aria-hidden": "true" } }));
      this.gear = h("button", {
        type: "button",
        id: PANEL_BUTTON_ID,
        class: "mashiro-chip mashiro-gear",
        title: t("openSettings"),
        attrs: { "aria-label": t("openSettings") },
        on: {
          click: (ev) => {
            ev.preventDefault();
            this.callbacks.onSettings();
          }
        }
      }, icon(ICONS.gear, 18));
      this.wrapper = h("span", { id: WRAPPER_ID, class: "mashiro-root mashiro-toolbar" }, this.button, this.gear);
      this.render();
    }
    render() {
      const button2 = this.button;
      if (!button2) return;
      button2.classList.toggle("is-orange", this.availability === "orange");
      button2.classList.toggle("is-blue", this.availability === "blue");
      button2.classList.toggle("is-grey", this.availability === "grey");
      button2.classList.toggle("is-probing", this.availability === "probing");
      button2.classList.toggle("is-top", this.isTopTab);
      button2.classList.toggle("is-active", this.active);
      button2.classList.toggle("is-busy", this.busy);
      button2.setAttribute("aria-pressed", this.active ? "true" : "false");
      button2.setAttribute("aria-disabled", this.availability === "grey" && !this.isTopTab ? "true" : "false");
      let title;
      if (this.isTopTab) title = t("popularTitleTop");
      else if (this.active) title = t("popularTitleActive");
      else if (this.availability === "orange") title = t("popularTitleOrange");
      else if (this.availability === "blue") title = t("popularTitleBlue");
      else if (this.availability === "grey") title = t("popularTitleGrey");
      else if (this.availability === "probing") title = t("popularTitleProbing");
      else title = t("popularTitleIdle");
      button2.title = title;
    }
  };

  // src/popular/grid.ts
  var ROOT_ID = "mashiro-results";
  var ACTIVE_BODY_CLASS = "mashiro-active";
  var NATIVE_PAGER_CLASS = "mashiro-native-pagination";
  var WORKS_CONTENT_SELECTORS = ['[data-ga4-label="works_content"]', 'section ul[role="list"]', 'ul[role="list"]'];
  var ResultsGrid = class {
    constructor(callbacks) {
      this.callbacks = callbacks;
    }
    root = null;
    sectionsHost = null;
    statusText = null;
    statusBar = null;
    countEl = null;
    stopButton = null;
    refreshButton = null;
    emptyEl = null;
    sections = /* @__PURE__ */ new Map();
    page = null;
    settings = null;
    cards = 0;
    get count() {
      return this.cards;
    }
    /** Create (or re-attach) the container next to Pixiv's works list. */
    mount(page, settings2) {
      this.page = page;
      this.settings = settings2;
      if (!this.root) this.build();
      this.applyDisplaySettings(settings2);
      this.place();
      this.markNativePagination();
    }
    /** Pixiv re-rendered? Make sure our root is still in the document. */
    ensurePlaced() {
      if (this.root && !this.root.isConnected) this.place();
      this.markNativePagination();
    }
    setActive(active) {
      document.body.classList.toggle(ACTIVE_BODY_CLASS, active);
      this.root?.classList.toggle("is-active", active);
      if (active) this.root?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    }
    isActive() {
      return document.body.classList.contains(ACTIVE_BODY_CLASS);
    }
    clear() {
      if (this.sectionsHost) clear(this.sectionsHost);
      this.sections.clear();
      this.cards = 0;
      this.updateCount();
      this.setStatusText("");
      if (this.statusBar) this.statusBar.style.width = "0%";
      this.emptyEl?.classList.remove("is-visible");
    }
    applyDisplaySettings(settings2) {
      this.settings = settings2;
      if (!this.root) return;
      this.root.dataset.cardSize = settings2.cardSize;
      this.root.classList.toggle("hide-author", !settings2.showAuthor);
      this.root.classList.toggle("hide-badge", !settings2.showBucketBadge);
      this.root.classList.toggle("hide-headers", !settings2.showBucketHeaders);
    }
    addWork(item, section) {
      if (!this.page || !this.settings) return;
      const target = this.section(section);
      target.grid.appendChild(this.card(item, section));
      this.cards++;
      target.count.textContent = String(target.grid.childElementCount);
      this.updateCount();
    }
    setProgress(progress) {
      if (!this.root) return;
      const running = progress.phase === "buckets" || progress.phase === "alt" || progress.phase === "paused";
      this.root.classList.toggle("is-running", running);
      if (this.stopButton) this.stopButton.hidden = !running;
      if (this.refreshButton) this.refreshButton.hidden = running;
      let text = "";
      let ratio = 0;
      switch (progress.phase) {
        case "buckets":
          text = t("statusFetchingBucket", {
            bucket: progress.currentBucket || "",
            done: progress.bucketsDone + 1,
            total: progress.bucketsTotal,
            found: progress.found
          });
          ratio = progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
          break;
        case "alt":
          text = t("statusFetchingAlt", { found: progress.found });
          ratio = 0.9;
          break;
        case "paused":
          text = t("statusRateLimited", { s: Math.ceil((progress.retryInMs || 0) / 1e3) });
          ratio = progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
          break;
        case "done":
          text = progress.found ? t("statusDone", { found: progress.found }) : t("statusEmpty");
          ratio = 1;
          break;
        case "stopped":
          text = t("statusStopped", { found: progress.found });
          ratio = progress.bucketsTotal ? progress.bucketsDone / progress.bucketsTotal : 0;
          break;
        case "error":
          text = progress.errorStatus === 403 ? t("statusForbidden") : progress.errorStatus === null ? t("statusNetworkError") : progress.error || t("stateError");
          ratio = 0;
          break;
        default:
          text = "";
      }
      if (progress.filtered && progress.phase !== "error") {
        text += ` · ${t("filteredOut", { n: progress.filtered })}`;
      }
      this.setStatusText(text);
      if (this.statusBar) this.statusBar.style.width = `${Math.round(ratio * 100)}%`;
      this.root.classList.toggle("is-error", progress.phase === "error");
      this.emptyEl?.classList.toggle("is-visible", progress.phase === "done" && progress.found === 0);
    }
    /** Re-translate static texts after a language change. */
    retranslate() {
      if (!this.root) return;
      this.root.querySelector(".mashiro-results-title").textContent = t("popular");
      this.stopButton?.setAttribute("title", t("stop"));
      this.refreshButton?.setAttribute("title", t("refresh"));
      this.root.querySelector(".mashiro-results-close")?.setAttribute("title", t("close"));
      if (this.emptyEl) this.emptyEl.textContent = t("statusEmpty");
      for (const [section, entry] of this.sections) {
        entry.wrapper.querySelector(".mashiro-section-title").textContent = this.sectionTitle(section);
      }
    }
    // ---- building ----------------------------------------------------------
    build() {
      this.statusText = h("span", { class: "mashiro-results-status" });
      this.statusBar = h("span", { class: "mashiro-results-bar" });
      this.countEl = h("span", { class: "mashiro-results-count" });
      this.stopButton = h("button", {
        type: "button",
        class: "mashiro-icon-button",
        title: t("stop"),
        hidden: true,
        on: { click: () => this.callbacks.onStop() }
      }, icon(ICONS.stop));
      this.refreshButton = h("button", {
        type: "button",
        class: "mashiro-icon-button",
        title: t("refresh"),
        on: { click: () => this.callbacks.onRefresh() }
      }, icon(ICONS.refresh));
      const closeButton = h("button", {
        type: "button",
        class: "mashiro-icon-button mashiro-results-close",
        title: t("close"),
        on: { click: () => this.callbacks.onClose() }
      }, icon(ICONS.close));
      this.emptyEl = h("p", { class: "mashiro-results-empty" }, t("statusEmpty"));
      this.sectionsHost = h("div", { class: "mashiro-sections" });
      this.root = h(
        "div",
        { id: ROOT_ID, class: "mashiro-root mashiro-results" },
        h(
          "div",
          { class: "mashiro-results-head" },
          h(
            "div",
            { class: "mashiro-results-headline" },
            icon(ICONS.flame, 18, "mashiro-results-icon"),
            h("span", { class: "mashiro-results-title" }, t("popular")),
            this.countEl
          ),
          this.statusText,
          h("div", { class: "mashiro-results-actions" }, this.stopButton, this.refreshButton, closeButton),
          h("div", { class: "mashiro-results-track" }, this.statusBar)
        ),
        this.emptyEl,
        this.sectionsHost
      );
    }
    place() {
      if (!this.root) return;
      const works = firstMatch(WORKS_CONTENT_SELECTORS);
      if (works?.parentNode) {
        if (works.nextElementSibling !== this.root) works.parentNode.insertBefore(this.root, works.nextSibling);
        if (works.getAttribute("data-ga4-label") !== "works_content") works.classList.add("mashiro-native-grid");
        return;
      }
      const main = document.querySelector("main") || document.body;
      if (main && this.root.parentNode !== main) main.appendChild(this.root);
    }
    markNativePagination() {
      if (document.querySelector(`nav.${NATIVE_PAGER_CLASS}`)) return;
      for (const nav of document.querySelectorAll("nav")) {
        if (nav.closest(".mashiro-root")) continue;
        let pageLinks = 0;
        for (const link of nav.querySelectorAll("a[href]")) {
          try {
            const url = new URL(link.href, location.href);
            if (url.origin === location.origin && url.pathname === location.pathname && /^\d+$/.test(url.searchParams.get("p") || "")) {
              pageLinks++;
            }
          } catch {
          }
        }
        if (pageLinks >= 2) {
          nav.classList.add(NATIVE_PAGER_CLASS);
          return;
        }
      }
    }
    section(key) {
      const existing = this.sections.get(key);
      if (existing) return existing;
      const count = h("span", { class: "mashiro-section-count" }, "0");
      const grid = h("div", { class: "mashiro-grid" });
      const wrapper = h(
        "section",
        { class: "mashiro-section", dataset: { section: key } },
        h(
          "h3",
          { class: "mashiro-section-head" },
          h("span", { class: `mashiro-bucket-pill ${key === "alt" ? "is-alt" : ""}` }, key === "alt" ? "★" : bucketLabel(key)),
          h("span", { class: "mashiro-section-title" }, this.sectionTitle(key)),
          count
        ),
        grid
      );
      const order = SECTION_ORDER.indexOf(key);
      let before = null;
      for (const child of this.sectionsHost.children) {
        const childKey = child.dataset.section;
        if (SECTION_ORDER.indexOf(childKey) > order) {
          before = child;
          break;
        }
      }
      this.sectionsHost.insertBefore(wrapper, before);
      const entry = { wrapper, grid, count };
      this.sections.set(key, entry);
      return entry;
    }
    sectionTitle(key) {
      return key === "alt" ? t("bucketHeaderAlt") : t("bucketHeader", { label: key });
    }
    card(item, section) {
      const page = this.page;
      const settings2 = this.settings;
      const href = artworkHref(page, item.id);
      const target = settings2.openInNewTab ? "_blank" : "_self";
      const rel = settings2.openInNewTab ? "noopener" : "";
      const large = settings2.cardSize === "large";
      const img = h("img", {
        class: "mashiro-card-img",
        src: large ? thumbnailAt(item.url, 540) : item.url,
        alt: item.alt || item.title || "",
        loading: "lazy",
        decoding: "async"
      });
      if (img.src !== item.url) {
        img.addEventListener("error", () => {
          img.src = item.url;
        }, { once: true });
      }
      const thumb = h(
        "a",
        { class: "mashiro-card-thumb", href, target, rel, dataset: { mashiroId: item.id } },
        img,
        item.xRestrict >= 1 ? h("span", { class: "mashiro-card-r18" }, item.xRestrict === 2 ? "R-18G" : "R-18") : null,
        item.illustType === 2 ? h("span", { class: "mashiro-card-ugoira" }, "▶") : null,
        (item.pageCount || 1) > 1 ? h("span", { class: "mashiro-card-pages", title: t("pages", { n: item.pageCount }) }, String(item.pageCount)) : null,
        section !== "alt" ? h("span", { class: "mashiro-card-bucket" }, bucketLabel(section)) : null,
        item.aiType === 2 ? h("span", { class: "mashiro-card-ai" }, "AI") : null
      );
      const title = h("a", { class: "mashiro-card-title", href, target, rel, title: item.title || "" }, item.title || "");
      const author = h(
        "a",
        { class: "mashiro-card-author", href: userHref(page, item.userId || ""), target, rel },
        item.profileImageUrl ? h("img", { class: "mashiro-card-avatar", src: item.profileImageUrl, alt: "", loading: "lazy" }) : null,
        h("span", null, item.userName || "")
      );
      return h("article", { class: "mashiro-card", dataset: { mashiroId: item.id, illustType: String(item.illustType) } }, thumb, title, author);
    }
    updateCount() {
      if (this.countEl) this.countEl.textContent = this.cards ? String(this.cards) : "";
    }
    setStatusText(text) {
      if (this.statusText) this.statusText.textContent = text;
    }
  };

  // src/popular/controller.ts
  var VERSION = true ? "1.0.0" : "0.0.0";
  var REPO_URL = "https://github.com/freeforall1932-design/secret-mashiro-fork";
  var AUTOSTART_HASH = "#mashiro-start";
  var PageController = class {
    page = { kind: "other", key: "" };
    button;
    grid;
    panel;
    uiObserver = null;
    uiTimer = null;
    autoStartedKey = "";
    constructor() {
      this.button = new PopularButton({
        onPopular: () => this.onPopularClick(),
        onSettings: () => this.panel.toggle()
      });
      this.grid = new ResultsGrid({
        onStop: () => crawler.stop(),
        onRefresh: () => this.start(true),
        onClose: () => this.showPixivList()
      });
      this.panel = new SettingsPanel({
        settings,
        crawler,
        version: VERSION,
        repoUrl: REPO_URL,
        getPage: () => this.page,
        start: () => this.start(true),
        stop: () => crawler.stop(),
        clearResults: () => this.clearResults()
      });
    }
    async boot() {
      await settings.load();
      setLanguage(settings.get("language"));
      theme.start(settings.get("theme"));
      settings.on("change", (change) => this.onSettingChange(change));
      crawler.on("work", ({ item, section }) => {
        this.grid.addWork(item, section);
        this.button.setCount(this.grid.count);
      });
      crawler.on("progress", (progress) => {
        this.grid.setProgress(progress);
        this.button.setBusy(crawler.isRunning());
        if (progress.phase === "error" && progress.errorStatus === 403) toast(progress.error || "403", "error", 6e3);
      });
      crawler.on("availability", (availability) => this.button.setAvailability(availability));
      pageSwitch.on("switch", () => this.onNavigate());
      pageSwitch.start();
      ext()?.runtime?.onMessage?.addListener((message) => {
        if (message?.type === "mashiro:togglePanel") this.panel.toggle();
      });
      this.watchUi();
      this.onNavigate();
    }
    // ---- page lifecycle ----------------------------------------------------
    onNavigate() {
      const next = parsePage();
      const changed = next.key !== this.page.key;
      this.page = next;
      if (!changed) {
        this.ensureUi();
        return;
      }
      crawler.reset();
      this.grid.clear();
      this.grid.setActive(false);
      this.button.setCount(0);
      this.button.setActive(false);
      this.button.setTopTab(next.kind === "search" && next.tab === "top");
      this.panel.refreshHome();
      if (next.kind !== "search") {
        this.button.remove();
        return;
      }
      this.ensureUi();
      const wantsAutoStart = location.hash === AUTOSTART_HASH || settings.get("autoStart");
      if (next.tab === "top") return;
      if (settings.get("probeOnLoad") || wantsAutoStart) {
        void crawler.probe(next, settings.value).then((availability) => {
          if (this.page.key !== next.key) return;
          if (wantsAutoStart && availability !== "grey" && this.autoStartedKey !== next.key) {
            this.autoStartedKey = next.key;
            if (location.hash === AUTOSTART_HASH) history.replaceState(history.state, "", location.pathname + location.search);
            void this.start(false);
          }
        });
      }
    }
    ensureUi() {
      if (this.page.kind !== "search") return;
      this.button.ensure(settings.get("showPanelButton"));
      this.grid.mount(this.page, settings.value);
    }
    /** Pixiv re-renders its toolbar on filter changes; keep our nodes attached. */
    watchUi() {
      this.uiObserver = new MutationObserver(() => {
        if (this.uiTimer !== null) return;
        this.uiTimer = window.setTimeout(() => {
          this.uiTimer = null;
          if (this.page.kind === "search") {
            this.button.ensure(settings.get("showPanelButton"));
            this.grid.ensurePlaced();
          }
        }, 150);
      });
      this.uiObserver.observe(document.body, { childList: true, subtree: true });
    }
    // ---- actions -----------------------------------------------------------
    onPopularClick() {
      if (this.page.kind !== "search") return;
      if (this.page.tab === "top") {
        location.assign(illustrationsTabHref(this.page) + AUTOSTART_HASH);
        return;
      }
      if (this.grid.isActive()) {
        this.showPixivList();
        return;
      }
      if (this.grid.count > 0 && !crawler.isRunning()) {
        this.showMashiroList();
        return;
      }
      void this.start(false);
    }
    async start(force) {
      if (this.page.kind !== "search") {
        toast(this.panelHint(), "warning");
        return;
      }
      if (this.page.tab === "top") {
        location.assign(illustrationsTabHref(this.page) + AUTOSTART_HASH);
        return;
      }
      if (crawler.isRunning() && !force) return;
      const page = this.page;
      this.grid.clear();
      this.grid.mount(page, settings.value);
      this.showMashiroList();
      await crawler.start(page, settings.value);
    }
    showMashiroList() {
      this.grid.setActive(true);
      this.button.setActive(true);
    }
    showPixivList() {
      this.grid.setActive(false);
      this.button.setActive(false);
    }
    clearResults() {
      crawler.stop();
      this.grid.clear();
      this.showPixivList();
      this.button.setCount(0);
      if (this.page.kind === "search") crawler.reset();
      this.panel.refreshHome();
      if (this.page.kind === "search" && settings.get("probeOnLoad")) void crawler.probe(this.page, settings.value);
    }
    panelHint() {
      return "Mashiro: open a Pixiv tag search first";
    }
    // ---- settings ----------------------------------------------------------
    onSettingChange({ key, settings: next }) {
      switch (key) {
        case "language":
          setLanguage(next.language);
          this.button.retranslate();
          this.grid.retranslate();
          this.panel.rebuild();
          break;
        case "theme":
          theme.setSetting(next.theme);
          break;
        case "cardSize":
        case "showBucketHeaders":
        case "showBucketBadge":
        case "showAuthor":
          this.grid.applyDisplaySettings(next);
          break;
        case "showPanelButton":
          this.ensureUi();
          break;
        case "probeOnLoad":
          if (next.probeOnLoad && this.page.kind === "search" && this.page.tab !== "top" && crawler.availability === "unknown") {
            void crawler.probe(this.page, settings.value);
          }
          break;
        default:
          break;
      }
      log.info(`Setting changed: ${key}`, "setting");
    }
  };

  // src/content.ts
  (() => {
    if (window.__mashiro) return;
    window.__mashiro = { version: VERSION };
    const boot = () => {
      new PageController().boot().catch((err) => console.error("Mashiro: failed to start", err));
    };
    if (document.body) boot();
    else document.addEventListener("DOMContentLoaded", boot, { once: true });
  })();
})();
