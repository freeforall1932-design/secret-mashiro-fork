// In-memory log shown on the panel's Home tab (and mirrored to the console).
// Entries with the same `key` replace each other, so progress lines do not
// flood the log — the same trick PixivBatchDownloader's Log uses.

import { Emitter } from "./events";

export type LogLevel = "info" | "success" | "warning" | "error";

export interface LogEntry {
    id: number;
    level: LogLevel;
    text: string;
    key?: string;
    time: number;
}

const MAX_ENTRIES = 200;

class Log extends Emitter<{ entry: LogEntry; clear: undefined }> {
    entries: LogEntry[] = [];
    private nextId = 1;

    private push(level: LogLevel, text: string, key?: string): void {
        const entry: LogEntry = { id: this.nextId++, level, text, key, time: Date.now() };
        if (key) {
            const index = this.entries.findIndex((e) => e.key === key);
            if (index !== -1) {
                entry.id = this.entries[index].id;
                this.entries[index] = entry;
                this.emit("entry", entry);
                return;
            }
        }
        this.entries.push(entry);
        if (this.entries.length > MAX_ENTRIES) this.entries.shift();
        this.emit("entry", entry);
    }

    info(text: string, key?: string): void {
        this.push("info", text, key);
    }

    success(text: string, key?: string): void {
        this.push("success", text, key);
    }

    warning(text: string, key?: string): void {
        console.warn("Mashiro:", text);
        this.push("warning", text, key);
    }

    error(text: string, key?: string): void {
        console.error("Mashiro:", text);
        this.push("error", text, key);
    }

    clear(): void {
        this.entries = [];
        this.emit("clear", undefined);
    }
}

export const log = new Log();
