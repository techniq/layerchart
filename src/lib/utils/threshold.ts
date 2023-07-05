import { range } from 'd3-array';
import { scaleTime } from 'd3-scale';

/**
 * Useful threshold function when using Date
 * https://observablehq.com/@d3/d3-bin-time-thresholds
 */
function thresholdTime(n: number) {
  return (data: Date[], min: Date, max: Date) => {
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
