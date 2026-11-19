// One parsed snapshot and one browser listener per store, shared by all consumers.
// No browser APIs are accessed during module initialization or server rendering.
export function createCachedBrowserStore<T>(options: {
  read: () => string;
  parse: (raw: string) => T;
  initial: T;
  keys: string[];
}) {
  const listeners = new Set<() => void>();
  let dirty = true;
  let previousRaw: string | undefined;
  let current = options.initial;

  function getSnapshot() {
    if (dirty) {
      const raw = options.read();
      if (raw !== previousRaw) {
        current = options.parse(raw);
        previousRaw = raw;
      }
      dirty = false;
    }
    return current;
  }
  function getFreshSnapshot() { dirty = true; return getSnapshot(); }
  function refresh() {
    const previous = current;
    const next = getFreshSnapshot();
    if (next !== previous) listeners.forEach(listener => listener());
  }
  function onStorage(event: StorageEvent) {
    if (event.key === null || options.keys.includes(event.key)) refresh();
  }
  function subscribe(listener: () => void) {
    if (!listeners.size) {
      dirty = true;
      window.addEventListener("storage", onStorage);
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (!listeners.size) {
        window.removeEventListener("storage", onStorage);
        dirty = true;
      }
    };
  }
  return { getSnapshot, getFreshSnapshot, getServerSnapshot: () => options.initial, subscribe, refresh };
}
