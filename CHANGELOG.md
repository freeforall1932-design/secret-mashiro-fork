# Changelog

## 1.0.0 — 2026-10-14

Ground-up rewrite in TypeScript, modelled on PixivBatchDownloader's architecture.
The extension is now the `dist/` folder.

### Added
- Settings panel (gear button next to **Popular**, or click the toolbar icon):
  Home with status / progress / live log / Start-Stop-Clear, Search, Filters,
  Display, General, Help. Settings persist via `chrome.storage.sync`.
- Filters: hide R-18, R-18G, AI-generated, ugoira; exclude tags; minimum page
  count; date range. Pixiv's own URL filters (`mode`, `scd`, `ecd`, `ratio`,
  `ai_type`, …) are forwarded to the bucket searches.
- Support for every search tab: `/tags/X` (Top → opens Illustrations in Popular
  mode), `/artworks`, `/illustrations`, `/manga`, locale prefixes (`/en/tags/…`)
  and the legacy `/search?q=`.
- Buckets `3000users入り` and `300users入り`.
- Bucket headers and per-card bucket badges; compact / regular / large cards;
  pages, ugoira, R-18 and AI badges; author avatar.
- Dark mode following Pixiv's theme (`#gtm-var-theme-kind`) or system preference.
- English / 日本語 / 简体中文 UI, auto-detected.
- HTTP 429 handling: pause, countdown, retry (max 3); 403 stops with a message.
- Toolbar icon action (opens the panel, or a Pixiv search if not on Pixiv).
- Firefox 140+ build (`dist-firefox/`, Android 142+): same bundles, Firefox manifest (event
  page, add-on ID, data-collection declaration). APIs go through a tiny
  `browser ?? chrome` shim, no polyfill.
- Build (`esbuild`), type-check, unit tests (`node:test`) and jsdom smoke tests
  that run the real bundle against a mock Pixiv (`demo/`). CI builds, tests,
  verifies `dist/` is fresh and uploads a zip.

### Changed
- Static `content_scripts` in the manifest instead of `chrome.scripting` injection
  from the service worker; `host_permissions`/`scripting` no longer requested —
  only `storage`.
- SPA navigation detection moved to a main-world hook (`pageHook.ts`); the v0.4
  `history.pushState` patch ran in the isolated world and never fired.
- Request queue is prioritised (buckets → popular list → recommendations) with a
  configurable gap. v0.4's FIFO queue let 18 recommendation requests starve the
  bucket chain when both were available.
- The second click on **Popular** restores Pixiv's list instead of re-crawling.
- Popular/recommended works that carry a `users入り` tag are filed under that bucket.
- Large cards use the 540 px `master1200` thumbnail rebuilt the way
  PixivBatchDownloader does (also covers `custom-thumb` works), with a fallback
  to the list thumbnail.

### Fixed (pre-release audit)
- Request queue deadlock: a job enqueued synchronously after `clear()` (Stop →
  Start, navigation → re-probe) could starve forever, because the aborted
  fetch only released the in-flight slot on a later microtask. The slot is now
  released by `clear()` itself and stale fetch handlers can no longer clobber
  the job that replaced theirs. Regression-tested.
- A probe triggered while a crawl was running (e.g. toggling "check
  availability" mid-crawl) silently invalidated the crawl and left the UI in
  the running state forever; probing now defers to a running crawl.
- Legacy `/search?q=…&type=artwork` was treated as the Illustrations tab, so
  manga were filtered out; `artwork` now maps to the combined tab like
  Pixiv's own URLs intend.
- The locale prefix (`/en/…`) is part of the page identity, so switching
  Pixiv's language resets and re-probes instead of reusing stale results.
- Ugoira and page-count badges overlapped on multi-page ugoira cards (the CSS
  sibling selector could never match the DOM order).
- Docs said "Firefox 128+" while the manifest requires Firefox 140+.

### Removed
- jQuery, `foreground.js`, `background.js` injection, `web_accessible_resources`
  for scripts, the 11 MB `images/demo.gif`.

## 0.4.0 and earlier

See [kokseen1/Mashiro](https://github.com/kokseen1/Mashiro) and this fork's history
before the rewrite (self-built cards, 2026 Pixiv anchors, sequential fetches).
