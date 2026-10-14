#!/usr/bin/env node
// Build the extension into dist/.
//
//   node scripts/build.mjs            one-off build
//   node scripts/build.mjs --watch    rebuild on change
//   node scripts/build.mjs --test     also bundle test/unit.test.ts for `node --test`
//   node scripts/build.mjs --zip      build, then write mashiro-<version>.zip
//
// Layout mirrors PixivBatchDownloader: TypeScript in src/, compiled output in
// dist/ (js/, style/, images/, manifest.json). dist/ is what Chrome loads.

import { build, context } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
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

function copyStatic() {
    mkdirSync(dist, { recursive: true });
    const manifest = JSON.parse(readFileSync(path.join(root, "src/manifest.json"), "utf8"));
    manifest.version = pkg.version;
    writeFileSync(path.join(dist, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    cpSync(path.join(root, "src/static"), dist, { recursive: true });
    cpSync(path.join(root, "LICENSE"), path.join(dist, "LICENSE"));
}

async function buildOnce() {
    rmSync(dist, { recursive: true, force: true });
    copyStatic();
    await Promise.all([build(scriptOptions), build(styleOptions)]);
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
    const name = `mashiro-${pkg.version}.zip`;
    const out = path.join(root, name);
    if (existsSync(out)) rmSync(out);
    execFileSync("zip", ["-qr", out, "."], { cwd: dist, stdio: "inherit" });
    console.log(`wrote ${name}`);
}

if (args.has("--watch")) {
    copyStatic();
    const [scripts, styles] = await Promise.all([context(scriptOptions), context(styleOptions)]);
    await Promise.all([scripts.watch(), styles.watch()]);
    console.log("watching src/ … (static files are copied once; re-run for manifest changes)");
} else {
    await buildOnce();
    if (args.has("--test")) await buildTests();
    if (args.has("--zip")) zipDist();
}
