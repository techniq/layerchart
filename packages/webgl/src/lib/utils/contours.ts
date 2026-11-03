import { contours as d3Contours } from 'd3-contour';
import { ticks } from 'd3-array';

import type { Grid } from './grid.js';

/** Cell `(i, j)`'s center in chart pixels, for fractional cells as well */
export function cellCenter(grid: Grid, i: number, j: number): [number, number] {
  return [
    grid.left + ((i + 0.5) * (grid.right - grid.left)) / grid.columns,
    grid.top + ((j + 0.5) * (grid.bottom - grid.top)) / grid.rows,
  ];
}

/**
 * Contour lines through a grid as line segments in the scene's axes (`x`, height, `y`), each at
 * `height(threshold)`.  `thresholds` is a count of evenly spaced values, or the values.
 */
export function contourSegments(
  grid: Grid,
  extent: [number, number],
  thresholds: number | number[],
  height: (value: number) => number
): number[] {
  const { values, columns, rows } = grid;
  const levels = Array.isArray(thresholds) ? thresholds : ticks(extent[0], extent[1], thresholds);
  // Holes close around themselves rather than leaving lines open
  const field = Array.from(values, (v) => (Number.isFinite(v) ? v : -Infinity));
  const generator = d3Contours().size([columns, rows]).thresholds(levels);
  const onEdge = (x: number, y: number) => x <= 0 || y <= 0 || x >= columns || y >= rows;

  const segments: number[] = [];
  for (const contour of generator(field)) {
    const z = height(contour.value);
    for (const polygon of contour.coordinates) {
      for (const ring of polygon) {
        for (let k = 0; k < ring.length - 1; k++) {
          const [x0, y0] = ring[k];
          const [x1, y1] = ring[k + 1];
          // The rings close along the grid's edges, which aren't contour lines
          if (onEdge(x0, y0) && onEdge(x1, y1)) continue;
          // A contour's `(x, y)` is in cells, value `(i, j)` sitting at `(i + 0.5, j + 0.5)`
          const [ax, ay] = cellCenter(grid, x0 - 0.5, y0 - 0.5);
          const [bx, by] = cellCenter(grid, x1 - 0.5, y1 - 0.5);
          segments.push(ax, z, ay, bx, z, by);
        }
      }
    }
  }
  return segments;
}
