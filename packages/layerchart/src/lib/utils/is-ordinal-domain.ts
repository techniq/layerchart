import { arraysEqual } from './array.js';
import type { AnyScale } from './scales.js';

/** Determine whether a scale has an ordinal domain
 * https://svelte.dev/repl/ec6491055208401ca41120c9c8a67737?version=3.49.0
 * @param  scale A D3 scale
 * @returns Whether the scale is an ordinal scale
 */
export function isOrdinalDomain(scale: AnyScale) {
  // scaleBand, scalePoint
  if (typeof scale.bandwidth === 'function') return true;
  // scaleOrdinal
  if (arraysEqual(Object.keys(scale), ['domain', 'range', 'unknown', 'copy'])) {
    return true;
  }
  return false;
}
