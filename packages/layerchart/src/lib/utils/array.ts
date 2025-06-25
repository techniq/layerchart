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

/**
 * Add `lanes` property to each element in the data array support densely packing.
 * This is useful for visualizing overlapping events in a timeline / Gantt chart.
 */
export function applyLanes<T extends Record<string, any>>(
  data: T[],
  options: { start: keyof T; end: keyof T } = { start: 'start' as keyof T, end: 'end' as keyof T }
) {
  const result: (T & { lane: number })[] = [];
  let stack: T[] = [];

  for (const d of data) {
    let lane = stack.findIndex(
      (s) => s[options.end] <= d[options.start] && s[options.start] < d[options.start]
    );
    if (lane === -1) {
      lane = stack.length;
    }

    result.push({ ...d, lane });
    stack[lane] = d;
  }

  return result;
}
