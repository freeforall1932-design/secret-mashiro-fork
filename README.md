# ![icon](images/mashiro.png) Mashiro — maintained fork

> **Fork of [kokseen1/Mashiro](https://github.com/kokseen1/Mashiro)** — the original was
> abandoned (last upstream commit: July 2024). This fork keeps it working and is the
> actively maintained continuation.

Mashiro is a Chrome extension that sorts illustrations and manga by popularity on Pixiv.

It works by looking for the tag with the suffix `users入り` that is automatically applied
on posts that surpass a certain amount of likes. This extension does not enable the
official `Sort by popularity` mode, and thus will not have 100% accurate results.

## What changed vs. the abandoned original

The upstream extension broke as Pixiv updated its markup (obfuscated `sc-*` CSS classes
change with every deploy). This fork hardens the extension against that:

- **Stable, semantic selectors** — targets `data-*` attributes and semantic elements
  (`input[type="search"]`, `nav[aria-label="Pagination"]`, `ul[role="list"]`,
  `button[aria-label*="sort"]`) with the old `sc-*` classes only as fallbacks.
- **Null-safe DOM handling** — every query result is checked before use, so a missing
  element logs an error instead of crashing the whole content script.
- **Defensive API handling** — JSON responses and their nested structures are validated
  before being read; request failures surface in the console instead of failing silently.
- **Graceful degradation** — if the template thumbnail can't be found yet, Mashiro retries
  instead of giving up; if the Popular button can't be injected, it reports why.
- **CI validation** — the repo runs a CI workflow that validates `manifest.json`, syntax-
  checks every JS file, and verifies the extension structure on every push/PR.

## Demo

![demo](images/demo.gif)

## Installation

1. Clone this repository (the repo root **is** the extension)
2. Visit `chrome://extensions` in Chrome
3. Turn on Developer mode
4. Click `Load unpacked`
5. Select this repository's root folder

## Guide

- Button turns **orange** if results from normal search are available
- Otherwise, button turns **blue** if only alternative results are available
- **Grey** button means no results are available

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

## License

Released into the public domain under [The Unlicense](LICENSE). Upstream credit:
[kokseen1/Mashiro](https://github.com/kokseen1/Mashiro) (abandoned).
