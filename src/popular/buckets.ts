// Pixiv users tag works that pass bookmark milestones with "<N>users入り".
// Mashiro searches those tags, highest first, to approximate Premium's
// "sort by popularity". Pure helpers only — no DOM, no network.
// (v0.4 crawled 9 buckets; 3000 and 300 are common milestones too.)

export const BUCKETS = ["100000", "50000", "30000", "10000", "5000", "3000", "1000", "500", "300", "100", "50"] as const;
export type Bucket = (typeof BUCKETS)[number];

export const SUFFIX = "users入り";

/** Pixiv's "fake users入り tag" marker; works carrying it are spam. */
export const FAKE_TAG = "虚偽users入りタグ";

const BUCKET_RE = /^(\d+)users入り$/;

export function bucketValue(bucket: Bucket | string): number {
    return parseInt(bucket, 10);
}

export function isBucket(value: string): value is Bucket {
    return (BUCKETS as readonly string[]).includes(value);
}

/** "1000users入り" -> "1000"; anything else -> null. */
export function bucketOfTag(tag: string): Bucket | null {
    const match = BUCKET_RE.exec(tag.trim());
    if (!match) return null;
    return isBucket(match[1]) ? match[1] : null;
}

/** Highest bucket among a work's tags, or null when it has none. */
export function highestBucket(tags: readonly string[]): Bucket | null {
    let best: Bucket | null = null;
    for (const tag of tags) {
        const bucket = bucketOfTag(tag);
        if (bucket && (!best || bucketValue(bucket) > bucketValue(best))) best = bucket;
    }
    return best;
}

/** Buckets to crawl, highest first, down to and including `min`. */
export function bucketsFrom(min: Bucket): Bucket[] {
    const floor = bucketValue(min);
    return BUCKETS.filter((bucket) => bucketValue(bucket) >= floor);
}

/** Remove a trailing "<N>users入り" keyword from a search query. */
export function stripBucketKeyword(query: string): string {
    return query.replace(/\s*\d+users入り\s*$/, "").trim();
}

/** Human label: "10000" -> "10k+", "500" -> "500+". */
export function bucketLabel(bucket: Bucket): string {
    const value = bucketValue(bucket);
    return (value >= 1000 ? `${value / 1000}k` : String(value)) + "+";
}
