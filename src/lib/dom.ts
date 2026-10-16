// Small DOM helpers. `h()` builds elements without innerHTML so Pixiv data
// (titles, user names, tags) is always inserted as text.

type Child = Node | string | number | null | undefined | false;

type Props<K extends keyof HTMLElementTagNameMap> = Partial<{
    [P in keyof HTMLElementTagNameMap[K]]: HTMLElementTagNameMap[K][P];
}> & {
    class?: string;
    dataset?: Record<string, string>;
    style?: Partial<CSSStyleDeclaration>;
    attrs?: Record<string, string>;
    on?: Partial<{ [E in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[E]) => void }>;
};

export function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: Props<K> | null = null,
    ...children: Child[]
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (props) {
        const { class: className, dataset, style, attrs, on, ...rest } = props;
        if (className) el.className = className;
        if (dataset) for (const [k, v] of Object.entries(dataset)) el.dataset[k] = v;
        if (style) Object.assign(el.style, style);
        if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        if (on) {
            for (const [type, handler] of Object.entries(on)) {
                el.addEventListener(type, handler as EventListener);
            }
        }
        Object.assign(el, rest);
    }
    append(el, children);
    return el;
}

export function append(parent: Node, children: Child[]): void {
    for (const child of children) {
        if (child === null || child === undefined || child === false) continue;
        parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
    }
}

export function clear(el: Element): void {
    while (el.firstChild) el.removeChild(el.firstChild);
}

export function firstMatch<T extends Element = Element>(selectors: readonly string[], root: ParentNode = document): T | null {
    for (const selector of selectors) {
        try {
            const el = root.querySelector<T>(selector);
            if (el) return el;
        } catch {
            /* invalid selector in a fallback list — ignore */
        }
    }
    return null;
}

/** Inline SVG icon from a path string (24x24 viewBox). */
export function icon(path: string, size = 16, className = ""): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");
    if (className) svg.setAttribute("class", className);
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("fill", "currentColor");
    p.setAttribute("d", path);
    svg.appendChild(p);
    return svg;
}

export const ICONS = {
    flame: "M13.5 0.7c0.4 3.1-1 5-2.6 6.6C9.2 9 7.5 10.6 7.5 13.5A4.5 4.5 0 0 0 12 18c2.5 0 4.5-2 4.5-4.5 0-1-0.3-1.9-0.8-2.6-0.3 1-1 1.8-1.9 2.1 0.5-1.8 0.2-3.7-0.9-5.2C12.6 9.4 12 11 10.8 12c0.1-2 1.4-3 2.4-4.4C14.4 6 14.8 3.4 13.5 0.7zM12 20a6.5 6.5 0 0 1-6.5-6.5c0-2.8 1.3-4.6 2.8-6.2C9.7 5.8 11 4.6 11.3 2.3c2.3 2.9 2.1 6 0.7 8.5 1.1 0.4 2 1.3 2.4 2.4 1.3 1 2.1 2.6 2.1 4.3A6.5 6.5 0 0 1 12 20z",
    gear: "M19.4 13a7.9 7.9 0 0 0 0-2l2.1-1.6a0.5 0.5 0 0 0 0.1-0.6l-2-3.5a0.5 0.5 0 0 0-0.6-0.2l-2.5 1a7.3 7.3 0 0 0-1.7-1l-0.4-2.6A0.5 0.5 0 0 0 14 2h-4a0.5 0.5 0 0 0-0.5 0.4L9.1 5a7.3 7.3 0 0 0-1.7 1l-2.5-1a0.5 0.5 0 0 0-0.6 0.2l-2 3.5a0.5 0.5 0 0 0 0.1 0.6L4.6 11a7.9 7.9 0 0 0 0 2l-2.1 1.6a0.5 0.5 0 0 0-0.1 0.6l2 3.5c0.1 0.2 0.4 0.3 0.6 0.2l2.5-1a7.3 7.3 0 0 0 1.7 1l0.4 2.6c0 0.3 0.2 0.4 0.5 0.4h4c0.2 0 0.5-0.2 0.5-0.4l0.4-2.6a7.3 7.3 0 0 0 1.7-1l2.5 1c0.2 0.1 0.5 0 0.6-0.2l2-3.5a0.5 0.5 0 0 0-0.1-0.6L19.4 13zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z",
    close: "M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z",
    home: "M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z",
    search: "M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z",
    filter: "M3 5h18l-7 8v6l-4 2v-8L3 5z",
    display: "M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z",
    general: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z",
    help: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-5h2v2h-2zm1-9a3.5 3.5 0 0 0-3.5 3.5h2a1.5 1.5 0 1 1 2.6 1L12 11.6V14h2v-1.6l0.7-0.7A3.5 3.5 0 0 0 12 6z",
    play: "M8 5v14l11-7z",
    stop: "M6 6h12v12H6z",
    trash: "M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 11H7L6 9z",
    refresh: "M17.6 6.4A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.2L13 11h7V4l-2.4 2.4z",
    external: "M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z",
    download: "M12 3v10.6l3.3-3.3 1.4 1.4L12 17.4l-4.7-4.7 1.4-1.4 3.3 3.3V3h2zM4 19h16v2H4z",
    upload: "M12 21V10.4l-3.3 3.3-1.4-1.4L12 7.6l4.7 4.7-1.4 1.4-3.3-3.3V21h-2zM4 3h16v2H4z",
    bulb: "M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zm-3 17h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1z",
    check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z",
    pixiv: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1.2 5c2.8 0 4.8 1.7 4.8 4.3 0 2.5-2 4.3-4.8 4.3h-2.4V18H8.4V7h4.8zm-0.2 2.1h-2.2v4.4h2.2c1.6 0 2.6-0.9 2.6-2.2 0-1.4-1-2.2-2.6-2.2z"
} as const;
