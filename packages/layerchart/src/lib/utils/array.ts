import type { Numeric } from 'd3-array';
import { extent as d3extent } from 'd3-array';

/**
 * Wrapper around d3-array's `extent()` but remove [undefined, undefined] return type
 */
export function extent<T extends Numeric>(iterable: Parameters<typeof d3extent<T>>[0]) {
  return d3extent(iterable) as [T, T];
}

/**
 * Determine whether two arrays equal one another, order not important.
 * This uses includes instead of converting to a set because this is only
 * used internally on a small array size and it's not worth the cost
 * of making a set
 */
export function arraysEqual(arr1: unknown[], arr2: unknown[]) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((k) => {
    return arr2.includes(k);
  });
}
