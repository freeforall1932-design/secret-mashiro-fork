# ![icon](images/mashiro.png) Mashiro — maintained fork

> **Fork of [kokseen1/Mashiro](https://github.com/kokseen1/Mashiro)** — the original was
> abandoned (last upstream commit: July 2024). This fork keeps it working and is the
> actively maintained continuation.

Mashiro is a Chrome extension that sorts illustrations and manga by popularity on Pixiv.

It works by looking for the tag with the suffix `users入り` that is automatically applied
on posts that surpass a certain amount of likes. This extension does not enable the
official `Sort by popularity` mode, and thus will not have 100% accurate results.

## What changed vs. the abandoned original

The upstream extension broke as Pixiv updated its markup (hashed `sc-*` CSS classes
change with every deploy). Cloning Pixiv's own thumbnail nodes then failed the same
way — the Popular button and result counter moved, but the posts themselves stayed
blank ([kokseen1/Mashiro#23](https://github.com/kokseen1/Mashiro/issues/23)).

This fork no longer depends on Pixiv's React tree for rendering:

- **Self-built cards** — Mashiro draws its own thumbnail, title, and author cells.
  Pixiv class-name churn cannot empty the grid.
- **Own results container** — injected as a *sibling* of Pixiv's works area
  (`[data-ga4-label="works_content"]`). React-managed subtrees are not rewritten.
- **2026 Pixiv anchors** — the Popular button attaches to
  `[data-ga4-label="order_filter_chip"]` and the charcoal search field, with
  semantic fallbacks. If the toolbar chip is missing, a floating Popular button
  still appears.
- **SPA-aware injection** — Pixiv tag switches do not require a full reload.
  In-flight requests abort on navigation so they cannot 403-cascade.
- **Throttled, sequential fetches** — popularity buckets are requested one at a
  time with a short gap, instead of firing nine recursive searches at once.
- **Null-safe API handling** — JSON envelopes and nested lists are checked
  before use; 403/429 stops the run instead of retry-storming.
- **CI validation** — every push/PR checks that `manifest.json` is Manifest V3,
  every root `*.js` file parses, and the extension files are present.

## Demo

![demo](images/demo.gif)

## Installation

1. Clone this repository (the repo root **is** the extension)
2. Visit `chrome://extensions` in Chrome
3. Turn on Developer mode
4. Click `Load unpacked`
5. Select this repository's root folder

## How to update

1. `git pull` the latest `main` (or download the newest release zip)
2. Open `chrome://extensions`
3. Click **Reload** on Mashiro

If Popular stops appearing or the grid is empty after a Pixiv redesign, the
selectors at the top of `foreground.js` (`SORT_CHIP_SELECTORS`,
`WORKS_CONTENT_SELECTORS`, `SEARCHBOX_SELECTOR`) are the first thing to extend.
Keep the self-built cards — do not go back to cloning Pixiv DOM nodes.

## Guide

- Button turns **orange** if results from normal (`users入り`) search are available
- Otherwise, button turns **blue** if only alternative results are available
- **Grey** button means no results are available
- The number next to Popular is how many posts Mashiro has placed in the grid

## Usage Notes

- Works best with official Pixiv series tags used by artists. (orange + blue mode)
  - Examples:
    - `エヴァ` instead of `エヴァンゲリオン`
    - `SAO` instead of `ソードアート・オンライン`
- Most character tags are supported! (blue mode)
  - Examples:
    - `歳納京子`
    - `御坂美琴`
- Works well with popular generic tags.
  - Examples:
    - `オリジナル`
    - `風景`
- Only Illustrations and Manga are currently supported.

## Changelog

### 0.4.0

- Render popular results with Mashiro-owned cards and CSS (fixes blank-grid
  breakage after Pixiv markup changes).
- Attach to current `data-ga4-label` / charcoal search UI; float Popular if
  the toolbar chip is gone.
- Follow Pixiv SPA navigations; abort outstanding ajax on route change.
- Serialize and throttle Pixiv ajax to avoid 403/429 cascades.
- Space-separate the `users入り` term so custom keyword searches AND correctly.
- Remove the previous global `[class*="sc-"]` style rule, which could distort
  Pixiv's own layout.

### 0.3.0

- Flatten the extension to the repository root so Chrome can load it unpacked.
- First hardening pass (semantic selector fallbacks, null-safe DOM/API access).
- CI workflow that validates the unpacked extension.

## Roadmap

- Optional result-limit / date-range controls
- Novel search support
- A packaged Chrome Web Store / GitHub Release zip

## License

Released into the public domain under [The Unlicense](LICENSE). Upstream credit:
[kokseen1/Mashiro](https://github.com/kokseen1/Mashiro) (abandoned).

2026 Pixiv selector and “don't clone React nodes” approach was informed by the
also-Unlicensed [annoft/Mashiro](https://github.com/annoft/Mashiro) personal fork.
