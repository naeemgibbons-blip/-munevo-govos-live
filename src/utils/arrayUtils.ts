/**
 * Safe Array Normalization Utility
 * Ensures that any API response or data shape passed to .map() or rendering code is strictly an Array.
 * Prevents runtime "TypeError: s.map is not a function" crashes.
 */
export function ensureArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) {
    return val;
  }
  if (val && typeof val === 'object') {
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.items)) return val.items;
    if (Array.isArray(val.results)) return val.results;
    if (Array.isArray(val.records)) return val.records;
  }
  return [];
}

/**
 * Safely maps over an array with an explicit array contract.
 */
export function safeMap<T = any, R = any>(
  collection: any,
  fn: (item: T, index: number, array: T[]) => R
): R[] {
  const safeList = ensureArray<T>(collection);
  return safeList.map(fn);
}
