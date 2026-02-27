export const memoizeObject = (() => {
  const cache = new Map<string, any>();
  return (obj: any) => {
    const key = JSON.stringify(obj);
    if (cache.has(key)) return cache.get(key);
    cache.set(key, obj);
    return obj;
  };
})();
