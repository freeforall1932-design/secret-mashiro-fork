// Serialized, paced, prioritized request queue.
//
// Pixiv answers 403/429 when a client fires many ajax searches at once. One
// request in flight plus a gap between requests keeps Mashiro invisible.
// Priorities make sure the users入り bucket chain is never starved by the
// recommendation fan-out (the v0.4 FIFO queue had that problem).

import { ApiError, fetchJson } from "./api";
import { Emitter } from "./events";

export interface QueueEvents {
    /** Pixiv rate-limited us; the queue paused and will retry in `retryInMs`. */
    rateLimited: { status: number; retryInMs: number };
    /** Countdown tick while paused for a rate limit. */
    retryTick: { remainingMs: number };
    /** A request finished (success or failure). */
    request: { url: string; ok: boolean; status?: number; durationMs: number };
    idle: undefined;
}

interface Job<T> {
    url: string;
    priority: number;
    seq: number;
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
}

export class QueueAbortedError extends Error {
    constructor() {
        super("Mashiro queue was cleared");
        this.name = "QueueAbortedError";
    }
}

export class RequestQueue extends Emitter<QueueEvents> {
    gapMs = 500;
    retryAfterMs = 60_000;
    maxRateLimitRetries = 3;

    private jobs: Job<unknown>[] = [];
    private seq = 0;
    private active = false;
    private activeJob: Job<unknown> | null = null;
    private paused = false;
    private gapTimer: number | null = null;
    private retryTimer: number | null = null;
    private tickTimer: number | null = null;
    private controller: AbortController | null = null;
    private rateLimitRetries = 0;
    private completedCount = 0;

    get pending(): number {
        return this.jobs.length + (this.active ? 1 : 0);
    }

    get completed(): number {
        return this.completedCount;
    }

    get isPaused(): boolean {
        return this.paused;
    }

    /** Lower `priority` runs first; FIFO within a priority. */
    enqueue<T extends { error?: boolean; message?: string }>(url: string, priority = 0): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const job: Job<T> = { url, priority, seq: this.seq++, resolve, reject };
            const index = this.jobs.findIndex((other) => other.priority > priority);
            if (index === -1) this.jobs.push(job as Job<unknown>);
            else this.jobs.splice(index, 0, job as Job<unknown>);
            this.pump();
        });
    }

    /** Drop queued jobs, abort the in-flight request, cancel timers. */
    clear(): void {
        const dropped = this.jobs;
        this.jobs = [];
        for (const job of dropped) job.reject(new QueueAbortedError());
        // Release the in-flight slot *before* aborting: the aborted fetch only
        // rejects on a later microtask, and a job enqueued in the meantime
        // (Stop → Start, navigation → probe) must be able to run immediately.
        // The stale fetch handlers recognise their job via `activeJob` and
        // leave the new job's state alone.
        const controller = this.controller;
        this.controller = null;
        this.active = false;
        this.activeJob = null;
        this.paused = false;
        this.rateLimitRetries = 0;
        this.clearTimers();
        controller?.abort();
    }

    resetCounters(): void {
        this.completedCount = 0;
    }

    private clearTimers(): void {
        for (const key of ["gapTimer", "retryTimer", "tickTimer"] as const) {
            const id = this[key];
            if (id !== null) {
                clearTimeout(id);
                clearInterval(id);
                this[key] = null;
            }
        }
    }

    private pump(): void {
        if (this.active || this.paused || this.gapTimer !== null || !this.jobs.length) return;
        const job = this.jobs.shift()!;
        this.active = true;
        this.activeJob = job;
        this.controller = new AbortController();
        const started = Date.now();

        fetchJson(job.url, this.controller.signal).then(
            (data) => {
                // Superseded by clear(): settle the promise but do not touch
                // the state of whatever job replaced this one.
                if (this.activeJob !== job) {
                    job.resolve(data);
                    return;
                }
                this.rateLimitRetries = 0;
                this.finish(job, started, true, undefined);
                job.resolve(data);
            },
            (err: unknown) => {
                if (err instanceof DOMException && err.name === "AbortError") {
                    if (this.activeJob === job) {
                        this.activeJob = null;
                        this.active = false;
                        this.controller = null;
                        job.reject(new QueueAbortedError());
                        this.pump();
                    } else {
                        job.reject(new QueueAbortedError());
                    }
                    return;
                }
                if (this.activeJob !== job) {
                    job.reject(err);
                    return;
                }
                const status = err instanceof ApiError ? err.status : undefined;
                if (status === 429 && this.rateLimitRetries < this.maxRateLimitRetries) {
                    // Put it back at the front and wait it out.
                    this.rateLimitRetries++;
                    this.jobs.unshift(job);
                    this.active = false;
                    this.activeJob = null;
                    this.controller = null;
                    this.emit("request", { url: job.url, ok: false, status, durationMs: Date.now() - started });
                    this.pauseForRateLimit(status);
                    return;
                }
                this.finish(job, started, false, status);
                job.reject(err);
            }
        );
    }

    private finish(job: Job<unknown>, started: number, ok: boolean, status: number | undefined): void {
        this.active = false;
        this.activeJob = null;
        this.controller = null;
        this.completedCount++;
        this.emit("request", { url: job.url, ok, status, durationMs: Date.now() - started });
        if (!this.jobs.length) {
            this.emit("idle", undefined);
            return;
        }
        this.gapTimer = window.setTimeout(() => {
            this.gapTimer = null;
            this.pump();
        }, this.gapMs);
    }

    private pauseForRateLimit(status: number): void {
        this.paused = true;
        const retryInMs = this.retryAfterMs;
        const until = Date.now() + retryInMs;
        this.emit("rateLimited", { status, retryInMs });
        this.tickTimer = window.setInterval(() => {
            this.emit("retryTick", { remainingMs: Math.max(0, until - Date.now()) });
        }, 1000);
        this.retryTimer = window.setTimeout(() => {
            this.clearTimers();
            this.paused = false;
            this.pump();
        }, retryInMs);
    }
}

export const queue = new RequestQueue();
