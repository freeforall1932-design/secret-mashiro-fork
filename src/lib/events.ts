// Minimal typed event bus. Modules talk through events instead of importing
// each other, which keeps the page controller, panel and crawler decoupled
// (same idea as PixivBatchDownloader's EVT, but typed).

type Handler<T> = (payload: T) => void;

export class Emitter<Events extends object> {
    private readonly handlers = new Map<keyof Events, Set<Handler<never>>>();

    on<K extends keyof Events>(name: K, handler: Handler<Events[K]>): () => void {
        let set = this.handlers.get(name);
        if (!set) {
            set = new Set();
            this.handlers.set(name, set);
        }
        set.add(handler as Handler<never>);
        return () => this.off(name, handler);
    }

    once<K extends keyof Events>(name: K, handler: Handler<Events[K]>): () => void {
        const off = this.on(name, (payload) => {
            off();
            handler(payload);
        });
        return off;
    }

    off<K extends keyof Events>(name: K, handler: Handler<Events[K]>): void {
        this.handlers.get(name)?.delete(handler as Handler<never>);
    }

    emit<K extends keyof Events>(name: K, payload: Events[K]): void {
        const set = this.handlers.get(name);
        if (!set) return;
        for (const handler of [...set]) {
            try {
                (handler as Handler<Events[K]>)(payload);
            } catch (err) {
                console.error("Mashiro: event handler failed", name, err);
            }
        }
    }
}
