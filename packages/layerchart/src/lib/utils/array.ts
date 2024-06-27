import { extent as d3extent, type Numeric } from 'd3-array';

/**
 * Wrapper around d3-array's `extent()` but remove [undefined, undefined] return type
 */
export function extent<T extends Numeric>(iterable: Parameters<typeof d3extent<T>>[0]) {
  return d3extent(iterable) as [T, T];
}
