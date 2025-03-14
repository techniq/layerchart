import type { AnyScale } from './scales.js';

export function getRange(scale: AnyScale) {
  if (typeof scale === 'function') {
    if (typeof scale.range === 'function') {
      return scale.range();
    }
    console.error("[LayerCake] Your scale doesn't have a `.range` method?");
  }
  return null;
}
