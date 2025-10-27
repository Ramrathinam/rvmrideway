// /lib/cache.ts
const store = new Map<string, { value: any; exp: number }>();

export function cacheGet(key: string) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function cacheSet(key: string, value: any, ttlMs = 60_000) {
  store.set(key, { value, exp: Date.now() + ttlMs });
}
