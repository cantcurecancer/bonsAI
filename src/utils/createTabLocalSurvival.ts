/**
 * Factory for tab-local UI state that survives Decky modal unmount/remount cycles.
 * Each tab registers a getter; capture stores a snapshot for restore on next mount.
 */
export type TabLocalSurvivalOptions = {
  /** When false, consume leaves pending until finalize() (modal session survival). Default true. */
  consumeClears?: boolean;
};

export function createTabLocalSurvival<T>(options: TabLocalSurvivalOptions = {}) {
  const consumeClears = options.consumeClears !== false;
  let getter: (() => T) | null = null;
  let pendingLocal: T | null = null;

  return {
    registerGetter(fn: () => T): void {
      getter = fn;
    },
    unregisterGetter(): void {
      getter = null;
    },
    captureSnapshot(): T | null {
      const snap = getter?.() ?? null;
      if (snap) pendingLocal = snap;
      return snap;
    },
    captureDirect(snapshot: T): void {
      pendingLocal = snapshot;
    },
    peekPending(): T | null {
      return pendingLocal;
    },
    consumePending(): T | null {
      const snap = pendingLocal;
      if (consumeClears) pendingLocal = null;
      return snap;
    },
    finalize(): void {
      pendingLocal = null;
    },
    clear(): void {
      pendingLocal = null;
      getter = null;
    },
  };
}
