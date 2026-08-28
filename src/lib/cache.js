/**
 * Simple in-memory TTL cache.
 * Entries expire after `ttlMs` milliseconds (default 5 minutes).
 * Call `invalidate(key)` or `invalidateAll()` after writes.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const store = new Map();    // key → { value, expiresAt }
const inflight = new Map(); // key → Promise  — deduplicates concurrent fetches

export function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Run `fn` and cache the result under `key`.
 * If a valid cached value exists it is returned without calling `fn`.
 * Concurrent calls with the same key share a single in-flight request.
 */
export async function getOrFetch(key, fn, ttlMs = DEFAULT_TTL_MS) {
  const cached = get(key);
  if (cached !== undefined) return cached;

  if (inflight.has(key)) return inflight.get(key);

  const promise = fn().then(value => {
    set(key, value, ttlMs);
    inflight.delete(key);
    return value;
  }).catch(err => {
    inflight.delete(key);
    throw err;
  });

  inflight.set(key, promise);
  return promise;
}

export function invalidate(key) {
  store.delete(key);
  inflight.delete(key);
}

export function invalidateAll() {
  store.clear();
  inflight.clear();
}
