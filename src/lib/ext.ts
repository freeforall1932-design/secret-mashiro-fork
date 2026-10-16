// Extension-API namespace shim.
//
// Firefox exposes promise-returning APIs on `browser` (its `chrome` alias is
// callback-based); Chrome 121+ returns promises on `chrome`. Picking `browser`
// first gives promises on both without a polyfill. Returns undefined outside
// an extension (unit tests), so callers can degrade gracefully.

type ExtensionApi = typeof chrome;

export function ext(): ExtensionApi | undefined {
    const g = globalThis as unknown as { browser?: ExtensionApi; chrome?: ExtensionApi };
    try {
        return g.browser?.runtime ? g.browser : g.chrome;
    } catch {
        return undefined;
    }
}

/** Absolute URL of a packaged file, or "" when not running as an extension. */
export function assetUrl(path: string): string {
    try {
        return ext()?.runtime?.getURL(path) ?? "";
    } catch {
        return "";
    }
}
