#!/usr/bin/env node
// Build the extension into dist/ (Chrome) and dist-firefox/ (Firefox).
//
//   node scripts/build.mjs            one-off build
//   node scripts/build.mjs --watch    rebuild on change
//   node scripts/build.mjs --test     also bundle test/unit.test.ts for `node --test`
//   node scripts/build.mjs --zip      build, then write mashiro-<version>-{chrome,firefox}.zip
//
// Layout mirrors PixivBatchDownloader: TypeScript in src/, compiled output in
// dist/ (js/, style/, images/, manifest.json). The bundles are identical for
// both browsers; only manifest.json differs (see firefoxManifest()).

import { build, context } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const distFirefox = path.join(root, "dist-firefox");
const args = new Set(process.argv.slice(2));
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

const banner = `/* Mashiro ${pkg.version} — https://github.com/freeforall1932-design/secret-mashiro-fork — The Unlicense */`;

/** @type {import('esbuild').BuildOptions} */
const scriptOptions = {
    absWorkingDir: root,
    entryPoints: {
        "js/content": "src/content.ts",
        "js/background": "src/background.ts",
        "js/pageHook": "src/pageHook.ts"
    },
    outdir: dist,
    bundle: true,
    format: "iife",
    target: ["chrome111"],
    platform: "browser",
    sourcemap: false,
    minify: false,
    charset: "utf8",
    legalComments: "none",
    banner: { js: banner },
    define: { __MASHIRO_VERSION__: JSON.stringify(pkg.version) },
    logLevel: "info"
};

/** @type {import('esbuild').BuildOptions} */
const styleOptions = {
    absWorkingDir: root,
    entryPoints: { "style/content": "src/styles/content.css" },
    outdir: dist,
    bundle: true,
    minify: false,
    charset: "utf8",
    legalComments: "none",
    banner: { css: banner },
    logLevel: "info"
};

function chromeManifest() {
    const manifest = JSON.parse(readFileSync(path.join(root, "src/manifest.json"), "utf8"));
    manifest.version = pkg.version;
    return manifest;
}

/**
 * Firefox (140+) differences from the Chrome manifest:
 *  - no service workers: the same background bundle runs as an event page
 *  - an add-on ID is mandatory for MV3 signing and for storage.sync
 *  - data_collection_permissions is required by addons.mozilla.org
 *  - minimum_chrome_version means nothing there
 * Everything else (content_scripts incl. world: MAIN, action, storage,
 * web_accessible_resources) is supported as is.
 */
function firefoxManifest() {
    const manifest = chromeManifest();
    delete manifest.minimum_chrome_version;
    manifest.background = { scripts: ["js/background.js"] };
    manifest.browser_specific_settings = {
        gecko: {
            id: "mashiro@freeforall1932-design.github.io",
            // 140 = first desktop Firefox that understands data_collection_permissions (AMO requires it).
            strict_min_version: "140.0",
            data_collection_permissions: { required: ["none"] }
        },
        // Android got the same key in 142; the toolbar-icon flow is desktop-only anyway.
        gecko_android: { strict_min_version: "142.0" }
    };
    return manifest;
}

function copyStatic() {
    mkdirSync(dist, { recursive: true });
    writeFileSync(path.join(dist, "manifest.json"), JSON.stringify(chromeManifest(), null, 2) + "\n");
    cpSync(path.join(root, "src/static"), dist, { recursive: true });
    cpSync(path.join(root, "LICENSE"), path.join(dist, "LICENSE"));
}

/** dist-firefox/ = dist/ with the Firefox manifest. Built after the bundles exist. */
function writeFirefoxDist() {
    rmSync(distFirefox, { recursive: true, force: true });
    cpSync(dist, distFirefox, { recursive: true });
    writeFileSync(path.join(distFirefox, "manifest.json"), JSON.stringify(firefoxManifest(), null, 2) + "\n");
}

async function buildOnce() {
    rmSync(dist, { recursive: true, force: true });
    copyStatic();
    await Promise.all([build(scriptOptions), build(styleOptions)]);
    writeFirefoxDist();
}

async function buildTests() {
    await build({
        absWorkingDir: root,
        entryPoints: { "unit.test": "test/unit.test.ts" },
        outdir: path.join(root, "test/build"),
        outExtension: { ".js": ".mjs" },
        bundle: true,
        format: "esm",
        platform: "node",
        target: ["node20"],
        packages: "external",
        define: { __MASHIRO_VERSION__: JSON.stringify(pkg.version) },
        logLevel: "info"
    });
}

function zipDist() {
    for (const [dir, suffix] of [[dist, "chrome"], [distFirefox, "firefox"]]) {
        const name = `mashiro-${pkg.version}-${suffix}.zip`;
        const out = path.join(root, name);
        if (existsSync(out)) rmSync(out);
        execFileSync("zip", ["-qr", out, "."], { cwd: dir, stdio: "inherit" });
        console.log(`wrote ${name}`);
    }
}

if (args.has("--watch")) {
    copyStatic();
    const [scripts, styles] = await Promise.all([context(scriptOptions), context(styleOptions)]);
    await Promise.all([scripts.watch(), styles.watch()]);
    console.log("watching src/ → dist/ … (static files and dist-firefox/ are written by a full build; re-run for manifest changes)");
} else {
    await buildOnce();
    if (args.has("--test")) await buildTests();
    if (args.has("--zip")) zipDist();
}
