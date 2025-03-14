import type { AxisKey, BaseRange } from './types.js';

function calcBaseRange(
  s: AxisKey,
  width: number,
  height: number,
  reverse: boolean,
  percentRange: boolean
): number[] {
  let min: number;
  let max: number;

  if (percentRange === true) {
    min = 0;
    max = 100;
  } else {
    min = s === 'r' ? 1 : 0;
    max = s === 'y' ? height : s === 'r' ? 25 : width;
  }

  return reverse === true ? [max, min] : [min, max];
}

export function getDefaultRange(
  s: AxisKey,
  width: number,
  height: number,
  reverse: boolean,
  range?: BaseRange,
  percentRange: boolean = false
): number[] | string[] {
  if (!range) {
    return calcBaseRange(s, width, height, reverse, percentRange);
  }

  if (typeof range === 'function') {
    return range({ width, height });
  }

  return range;
}
