# Mashiro UI demo harness

A zero-dependency mock of a Pixiv search page that loads the **real** built
extension (`dist/js/pageHook.js`, `dist/js/content.js`, `dist/style/content.css`)
against mock Pixiv ajax endpoints. Use it to preview and click through the
Mashiro UI without Pixiv, a Pixiv account, or Chrome's extension loader. The
same server backs `test/smoke.test.mjs`.

This folder is **not part of the extension** (Chrome loads `dist/`).

## Run

```sh
npm run build                  # the harness serves dist/, rebuild after source changes
node demo/server.js            # http://localhost:3000  (binds 0.0.0.0)
node demo/server.js 8080       # custom port
```

The root URL redirects to `/tags/ゆるゆり/illustrations`.

## What you can try

| URL / control | What it shows |
|---|---|
| `/tags/ゆるゆり/illustrations` | **Orange** Popular button: `users入り` buckets found. Click → self-built grid, 100000 → 50 users入り, with bucket headers and badges. Click again → Pixiv's list is back. |
| `/tags/御坂美琴/illustrations` | **Blue** button: no `users入り` hits; Pixiv's `popular` strip + recommendations are used, buckets are skipped. |
| `/tags/zzz_no_results/illustrations` | **Grey** button: nothing available. |
| `/tags/ratelimit_test/illustrations` | The `30000users入り` request answers **429** once → the queue pauses with a countdown (set *Wait after 429* to 10 s in the panel to speed it up) and retries. |
| `/tags/slow_pixiv/illustrations` | Every response takes 1.5 s — watch the progress bar and the live log. |
| `/tags/forbidden_test/illustrations` | Bucket requests answer **403** → the crawl stops with an error toast. |
| `/tags/ゆるゆり` | **Top** tab: the button opens `/illustrations#mashiro-start`, which auto-starts Popular mode. |
| `/tags/ゆるゆり/manga`, `/tags/ゆるゆり/artworks`, `/search?q=ゆるゆり&type=illust_and_ugoira` | Other tabs / legacy URL — same logic, different API path and work-type filter. |
| `?nochip=1` | Pixiv's sort chip is missing → Mashiro's **floating** fallback toolbar. |
| Gear button (or `Esc` to close) | The settings panel: Home (status, progress, log, Start/Stop/Clear), Search, Filters, Display, General, Help. Changes apply live and persist in the in-memory `chrome.storage` stub. |
| Scenario links in the top strip | Navigate with `history.pushState` (like Pixiv's router) — Mashiro resets and re-probes without a reload. |
| "Pixiv dark theme" checkbox | Flips `#gtm-var-theme-kind` to `dark`, which Mashiro follows (`html.mashiro-dark`). |
| Mock ajax log | Every request the extension makes, in order — shows the paced, prioritised queue. |

## How it works

* `server.js` (ESM, exports `createServer()` / `start(port, host)`) serves the
  page for any `/tags/...` or `/search` URL, `dist/` under `/ext/`, and mock JSON
  for `/ajax/search/{artworks|illustrations|manga}/...` (keys `illustManga` /
  `illust` / `manga` like Pixiv) and `/ajax/illust/:id/recommend/init`.
  Thumbnails and avatars are generated SVGs.
* `harness.js` stubs `chrome.runtime` / `chrome.storage` in memory, rewrites
  `https://www.pixiv.net/...` fetches to the local server (the bundle is loaded
  unmodified), and renders the mock page from the URL.
* The tag picks the scenario: `御坂美琴|blue` → popular only, `zzz|none|grey|gray|nothing`
  → empty, `slow` → 1.5 s delay, `ratelimit|429` → one 429, `forbidden|403` → 403,
  anything else → orange.
