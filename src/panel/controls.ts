// Form rows used by the settings panel. Each returns its element plus a
// `set()` so the panel can reflect settings that changed elsewhere.

import { h } from "../lib/dom";

export interface Control<T> {
    el: HTMLElement;
    set(value: T): void;
}

interface RowText {
    label: string;
    help?: string;
}

function rowText({ label, help }: RowText): HTMLElement {
    return h("span", { class: "mashiro-row-text" },
        h("span", { class: "mashiro-row-label" }, label),
        help ? h("span", { class: "mashiro-row-help" }, help) : null
    );
}

export function toggleRow(text: RowText, value: boolean, onChange: (value: boolean) => void): Control<boolean> {
    const input = h("input", { type: "checkbox", checked: value, class: "mashiro-switch-input" });
    input.addEventListener("change", () => onChange(input.checked));
    const el = h("label", { class: "mashiro-row mashiro-row-toggle" },
        rowText(text),
        h("span", { class: "mashiro-switch" }, input, h("span", { class: "mashiro-switch-track" }))
    );
    return { el, set: (v) => { input.checked = v; } };
}

export function numberRow(
    text: RowText,
    value: number,
    range: { min: number; max: number; step?: number },
    onChange: (value: number) => void
): Control<number> {
    const input = h("input", {
        type: "number",
        class: "mashiro-input mashiro-input-number",
        min: String(range.min),
        max: String(range.max),
        step: String(range.step || 1),
        value: String(value)
    });
    const commit = () => {
        const n = Number(input.value);
        if (Number.isFinite(n)) onChange(n);
    };
    input.addEventListener("change", commit);
    const el = h("label", { class: "mashiro-row" }, rowText(text), input);
    return { el, set: (v) => { input.value = String(v); } };
}

export function selectRow<T extends string>(
    text: RowText,
    value: T,
    options: ReadonlyArray<{ value: T; label: string }>,
    onChange: (value: T) => void
): Control<T> {
    const select = h("select", { class: "mashiro-input mashiro-input-select" },
        ...options.map((opt) => h("option", { value: opt.value, selected: opt.value === value }, opt.label))
    );
    select.addEventListener("change", () => onChange(select.value as T));
    const el = h("label", { class: "mashiro-row" }, rowText(text), select);
    return { el, set: (v) => { select.value = v; } };
}

export function textRow(
    text: RowText,
    value: string,
    onChange: (value: string) => void,
    type: "text" | "date" = "text",
    placeholder = ""
): Control<string> {
    const input = h("input", { type, class: "mashiro-input mashiro-input-text", value, placeholder });
    input.addEventListener("change", () => onChange(input.value));
    const el = h("label", { class: "mashiro-row" }, rowText(text), input);
    return { el, set: (v) => { input.value = v; } };
}

export function textareaRow(text: RowText, value: string, onChange: (value: string) => void, placeholder = ""): Control<string> {
    const input = h("textarea", { class: "mashiro-input mashiro-input-textarea", value, placeholder, rows: 3 });
    input.addEventListener("change", () => onChange(input.value));
    const el = h("label", { class: "mashiro-row mashiro-row-stacked" }, rowText(text), input);
    return { el, set: (v) => { input.value = v; } };
}

export function button(
    label: string,
    onClick: () => void,
    variant: "primary" | "outline" | "success" | "danger" | "ghost" = "outline",
    iconEl?: Node
): HTMLButtonElement {
    return h("button", { type: "button", class: `mashiro-button mashiro-button-${variant}`, on: { click: onClick } }, iconEl || null, label);
}

export function card(title: string, iconEl: Node, ...children: Array<Node | null>): HTMLElement {
    return h("section", { class: "mashiro-card-box" },
        h("header", { class: "mashiro-card-head" }, h("span", { class: "mashiro-card-icon" }, iconEl), h("h3", null, title)),
        h("div", { class: "mashiro-card-body" }, ...children)
    );
}
