// Transient notifications (PixivBatchDownloader has the same "Toast" idea).

import { h } from "./dom";

type ToastKind = "info" | "success" | "warning" | "error";

const CONTAINER_ID = "mashiro-toasts";

function container(): HTMLElement {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
        el = h("div", { id: CONTAINER_ID, class: "mashiro-root", attrs: { role: "status", "aria-live": "polite" } });
        document.body.appendChild(el);
    }
    return el;
}

export function toast(message: string, kind: ToastKind = "info", durationMs = 3200): void {
    const el = h("div", { class: `mashiro-toast mashiro-toast-${kind}` }, message);
    container().appendChild(el);
    requestAnimationFrame(() => el.classList.add("mashiro-toast-in"));
    window.setTimeout(() => {
        el.classList.remove("mashiro-toast-in");
        window.setTimeout(() => el.remove(), 250);
    }, durationMs);
}
