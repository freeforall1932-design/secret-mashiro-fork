# ![icon](src/static/images/mashiro.png) Mashiro — Popular mode for Pixiv search

> Maintained fork of [kokseen1/Mashiro](https://github.com/kokseen1/Mashiro) (abandoned
> July 2024). Version 1.0.0 is a ground-up rewrite that borrows the architecture of
> [PixivBatchDownloader](https://github.com/xuejianxianzun/PixivBatchDownloader) — the
> only Pixiv extension that has kept working through every redesign — while keeping
> Mashiro's own idea and its public-domain licence.

Mashiro adds a **Popular** button to Pixiv tag searches. Clicking it replaces Pixiv's
date-ordered list with the works that bookmarkers tagged `100000users入り`, `50000users入り`,
… `50users入り` — highest first. That approximates Premium's *sort by popularity* without
Premium. It is not 100 % accurate (it depends on community tags), and it never touches
Pixiv's official popular sort.

| Button | Meaning |
|---|---|
| **Orange** | `users入り` works exist for this search. Click → Popular grid. |
| **Blue** | None tagged, but Pixiv's own *popular* strip and its recommendations are available. |
| **Grey** | Nothing to show. |
| Pulsing | Still checking. |

Clicking **Popular** again returns to Pixiv's own list; nothing is destroyed.

## Install (Chrome / Chromium / Edge / Brave, Manifest V3)

The extension is the **`dist/`** folder (it is committed, no build needed):

1. Download/clone this repository, or grab `mashiro-<version>.zip` from the CI artifacts / Releases.
2. Open `chrome://extensions`, enable **Developer mode**.
3. **Load unpacked** → choose the **`dist/`** folder (or unzip the archive and choose that).
4. Open any Pixiv tag search, e.g. <https://www.pixiv.net/tags/オリジナル/illustrations>.

Update: `git pull`, then **Reload** on `chrome://extensions`.

Requires Chrome 111+ (for `"world": "MAIN"` content scripts). Firefox is not supported in 1.0.

## Features

- **Works on every search tab** — `/tags/X` (Top), `/tags/X/artworks`, `/illustrations`,
  `/manga`, locale-prefixed URLs (`/en/tags/…`) and the legacy `/search?q=…`.
  On the Top tab the button opens the Illustrations tab in Popular mode.
- **Follows Pixiv's SPA navigation** — a tiny main-world hook mirrors `history.pushState`;
  switching tags re-probes instantly and aborts in-flight requests.
- **Polite, prioritised request queue** — one request at a time, a configurable gap,
  buckets before Pixiv's popular list before recommendations. HTTP 429 pauses with a
  countdown and retries; 403 stops with a clear message. (v0.4 fired nine recursive
  searches at once and starved itself with recommendation requests.)
- **Settings panel** — gear button next to Popular, or click the toolbar icon. Floating
  panel in the PixivBatchDownloader style with Home (status, progress, live log,
  Start/Stop/Clear), Search, Filters, Display, General and Help. Settings sync via
  `chrome.storage.sync`.
- **Filters** — hide R-18 / R-18G / AI-generated / ugoira, exclude tags, minimum page
  count, date range. Page filters from Pixiv's own URL (`mode`, `scd`/`ecd`, `ratio`,
  `ai_type`, …) are forwarded to the bucket searches.
- **Self-built result cards** — thumbnail, pages/ugoira/R-18/AI badges, bucket badge,
  title, author with avatar. Compact / regular / large. Follows Pixiv's light/dark theme.
- **i18n** — English, 日本語, 简体中文, auto-detected from Pixiv's `<html lang>`.
- Zero dependencies at runtime (no jQuery); only the `storage` permission.

## Settings

| Section | Setting | Default |
|---|---|---|
| Search | Lowest bucket to include (`50` = everything) | `50` |
| | Max works | `1000` |
| | Pages per bucket (60 works each) | `3` |
| | Gap between requests | `500 ms` |
| | Order inside a bucket | newest first |
| | Check availability on page load (the probe request) | on |
| | Pixiv popular list + recommendations: auto / always / off | auto (when buckets yield < 30 works) |
| | Recommendation depth | `1` |
| | Inherit filters from the page URL | on |
| | Wait after HTTP 429 | `60 s` |
| Filters | Hide R-18 / R-18G / AI / ugoira, exclude tags, min pages, date range | all off |
| Display | Card size, bucket headers, bucket badge, author, open in new tab | regular / on / on / on / off |
| General | Auto-start Popular mode on search pages, show gear button, language, theme | off / on / auto / auto |

## How it works

```
src/
  manifest.json        MV3 manifest (version is stamped from package.json at build time)
  pageHook.ts          main-world: wraps pushState/replaceState → "mashiro:navigate" events
  content.ts           isolated world entry → PageController
  background.ts        service worker: toolbar icon toggles the panel
  lib/                 api (fetch + URL builders), requestQueue (priority, pacing, 429),
                       pageType (URL → search/tab/apiPath), settings (chrome.storage),
                       i18n + langText, theme, dom helpers, toast, log, events
  popular/             buckets (users入り helpers), filter, crawler (phases),
                       grid (results), button (toolbar chip), controller (page lifecycle)
  panel/               settings panel + form controls
  styles/              content.css (+ panel.css)
dist/                  built extension — load this folder
demo/                  mock Pixiv server + harness that runs the real dist/ bundle
test/                  unit tests (node:test) + jsdom smoke tests against demo/
```

Flow: `PageController` parses the URL → mounts the Popular chip next to Pixiv's sort chip
(`[data-ga4-label="order_filter_chip"]`, floating fallback) → `crawler.probe()` sends one
search for `"<word> users入り"` (partial match hits every bucket) → colour. On click
`crawler.start()` walks buckets highest-first through the `RequestQueue`, each work goes
through `checkWork()` and into the `ResultsGrid` as it arrives; if buckets yield little,
Pixiv's `popular.permanent/recent` and `/ajax/illust/:id/recommend/init` fill in.

Pixiv API endpoints used (same as Pixiv's own frontend, same-origin cookies):
`GET /ajax/search/{artworks|illustrations|manga}/{word}?word=…&order=date_d&mode=all&p=…&s_mode=s_tag&type=…`
and `GET /ajax/illust/{id}/recommend/init?limit=18`.

## Development

```sh
npm install
npm run build     # esbuild → dist/   (npm run watch for rebuild on change)
npm run check     # tsc --noEmit
npm test          # unit tests + jsdom smoke tests (needs a fresh build)
npm run demo      # mock Pixiv at http://localhost:3000 running the real dist/ bundle
npm run zip       # mashiro-<version>.zip
```

Commit `dist/` together with `src/` — CI fails if it is stale. TypeScript 5, esbuild, no
framework. Code style: 4 spaces, double quotes, semicolons.

### Previewing without Pixiv

`demo/` is a mock Pixiv search page plus fake `/ajax/...` endpoints. It loads the real
`dist/js/pageHook.js`, `dist/js/content.js` and `dist/style/content.css`, so what you
see is the extension. Scenarios: orange (`ゆるゆり`), blue (`御坂美琴`), grey
(`zzz_no_results`), a 429 once (`ratelimit_test`), slow Pixiv (`slow_pixiv`), Top tab,
missing sort chip, dark theme. See [`demo/README.md`](demo/README.md).

### If Pixiv changes its markup

Everything that touches Pixiv's DOM is in `src/popular/button.ts` (where the chip is
mounted) and `src/popular/grid.ts` (where the results container goes, next to
`[data-ga4-label="works_content"]`). Cards are self-built, so class-name churn cannot
blank the grid; worst case the button floats at the top-right.

## Credits & licence

Original idea and name: [kokseen1/Mashiro](https://github.com/kokseen1/Mashiro).
Architecture patterns (fetch layer, SPA hook, page-type detection, theme following,
floating settings panel) are re-implemented from
[PixivBatchDownloader](https://github.com/xuejianxianzun/PixivBatchDownloader); no code was
copied, so this repository stays under [The Unlicense](LICENSE).
