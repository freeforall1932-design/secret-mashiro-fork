# Mashiro UI demo harness

A zero-dependency mock of a Pixiv search page that loads the **real** extension
files (`foreground.js`, `foreground_styles.css`, `jquery-3.6.0.min.js`) against
mock Pixiv ajax endpoints. Use it to preview and click through the Mashiro UI
without Pixiv, a Pixiv account, or Chrome's extension loader.

This folder is **not part of the extension**. Chrome ignores it when the repo
root is loaded unpacked, and CI only syntax-checks the root `*.js` files.

## Run

```sh
node demo/server.js            # http://localhost:3000  (binds 0.0.0.0)
node demo/server.js 8080       # custom port
```

The root URL redirects to `/tags/ゆるゆり/illustrations`.

## What you can try

| URL / control | What it shows |
|---|---|
| `/tags/ゆるゆり/illustrations` | **Orange** Popular button: `users入り` buckets found. Click it → self-built grid, ordered 100000 → 50 users入り. |
| `/tags/御坂美琴/illustrations` | **Blue** button: no `users入り` hits, only Pixiv's `popular` list + recommendations. |
| `/tags/zzz_no_results/illustrations` | **Grey** button: nothing available; clicking does nothing. |
| `/tags/ゆるゆり/manga` | Manga tab: the same data, filtered to `illustType === 1`. |
| `?nochip=1` | Pixiv's sort chip is missing → Mashiro's **floating** fallback button. |
| Scenario links in the top strip | Navigate with `history.pushState` (like Pixiv's router) — Mashiro resets and re-probes without a reload. |
| "Pixiv dark theme" checkbox | Cards inherit Pixiv's text colour; nothing in Mashiro is theme-specific. |
| Mock ajax log | Every request the extension makes, in order — shows the serialized 500 ms queue. |

## How it works

* `server.js` serves the page for any `/tags/...` or `/search` URL, the extension
  files under `/ext/`, and mock JSON for `/ajax/search/artworks/...` and
  `/ajax/illust/:id/recommend/init`. Thumbnails/avatars are generated SVGs.
* `harness.js` stubs `chrome.runtime.getManifest()`, rewrites
  `https://www.pixiv.net/ajax/...` requests to the local server (foreground.js
  is loaded unmodified), and renders the mock page from the URL.
* The tag name picks the scenario: anything matching `御坂美琴|blue` is blue-only,
  anything matching `zzz|none|grey|gray|nothing` is empty, everything else is orange.
