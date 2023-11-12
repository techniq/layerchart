import { range, type ThresholdNumberArrayGenerator } from 'd3-array';
import { scaleTime } from 'd3-scale';

/**
 * Useful threshold function when using Dates
 * https://observablehq.com/@d3/d3-bin-time-thresholds
 */
export function thresholdTime(n: number): ThresholdNumberArrayGenerator<number> {
  // TODO: Unable to satifiy `ThresholdNumberArrayGenerator<Value extends number>` with `Date`
  return (data, min, max) => {
    return scaleTime().domain([min, max]).ticks(n);
  };
}

/**
 * Explicit threshold chunks without nicing (not recommended)
 * see: https://observablehq.com/@d3/d3-bin#bin26
 */
export function thresholdChunks(chunks: number) {
  return (data: number[], min: number, max: number) =>
    range(chunks).map((t) => min + (t / chunks) * (max - min));
}
