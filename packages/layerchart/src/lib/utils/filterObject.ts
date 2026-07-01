/**
 * Remove undefined fields from an object
 * @param obj The object to filter
 * @param comparisonObk An object that, for any key, if the key is not present on that object, the
 * key will be filtered out. Note, this ignores the value on that object
 */
export function filterObject(obj: object, comparisonObj = {}) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      // @ts-expect-error - shh
      return value !== undefined && comparisonObj[key] === undefined;
    })
  );
}
