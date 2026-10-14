/* Mashiro 1.0.0 — https://github.com/freeforall1932-design/secret-mashiro-fork — The Unlicense */
"use strict";
(() => {
  // src/pageHook.ts
  (() => {
    const EVENT_NAME = "mashiro:navigate";
    const history = window.history;
    if (history.__mashiroHooked) return;
    history.__mashiroHooked = true;
    for (const type of ["pushState", "replaceState"]) {
      const original = history[type];
      history[type] = function(...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type } }));
        return result;
      };
    }
  })();
})();
