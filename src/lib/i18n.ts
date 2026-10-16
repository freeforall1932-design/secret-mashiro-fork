// Tiny i18n: picks a column from LANG_TEXT. Language follows Pixiv's
// <html lang> unless the user overrides it in settings.

import { LANG_TEXT, type TextKey } from "./langText";
import type { Language } from "./settings";

export type ResolvedLanguage = Exclude<Language, "auto">;

const COLUMN: Record<ResolvedLanguage, 0 | 1 | 2> = { en: 0, ja: 1, "zh-CN": 2 };

let current: ResolvedLanguage = "en";

export function detectPixivLanguage(): ResolvedLanguage {
    const lang = (document.documentElement.lang || navigator.language || "en").toLowerCase();
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("zh")) return "zh-CN";
    return "en";
}

export function setLanguage(setting: Language): ResolvedLanguage {
    current = setting === "auto" ? detectPixivLanguage() : setting;
    return current;
}

export function t(key: TextKey, vars?: Record<string, string | number>): string {
    const row = LANG_TEXT[key] as readonly [string, string, string] | undefined;
    let text = row ? row[COLUMN[current]] || row[0] : key;
    if (vars) {
        for (const [name, value] of Object.entries(vars)) {
            text = text.split(`{${name}}`).join(String(value));
        }
    }
    return text;
}
