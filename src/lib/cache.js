/**
 * Simple in-memory TTL cache.
 * Entries expire after `ttlMs` milliseconds (default 5 minutes).
 * Call `invalidate(key)` or `invalidateAll()` after writes.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const store = new Map(); // key → { value, expiresAt }

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
 */
export async function getOrFetch(key, fn, ttlMs = DEFAULT_TTL_MS) {
  const cached = get(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  set(key, value, ttlMs);
  return value;
}

export function invalidate(key) {
  store.delete(key);
}

export function invalidateAll() {
  store.clear();
}
