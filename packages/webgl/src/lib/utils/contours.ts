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
  height: (value: number) => number,
  options: ContourLevelOptions = {}
): number[] {
  return contourLevels(grid, extent, thresholds, height, options).flatMap(
    (level) => level.segments
  );
}

export type ContourLevelOptions = {
  /** Interpolate where lines cross each cell, else run them along the cells' corners */
  smooth?: boolean;
  /**
   * Keep where the rings close along the grid's edges, and count `thresholds` from the values'
   * nice extent, as the core `Contour` draws its bands' outlines
   */
  edges?: boolean;
};

/**
 * Each threshold's contour lines through a grid (see `contourSegments`), with its value: ex. to
 * color each level's lines by it
 */
export function contourLevels(
  grid: Grid,
  extent: [number, number],
  thresholds: number | number[],
  height: (value: number) => number,
  { smooth = true, edges = false }: ContourLevelOptions = {}
): { value: number; segments: number[] }[] {
  const { values, columns, rows } = grid;
  // A count as the core `Contour`'s (d3's, from a nice extent), else evenly spaced over `extent`
  const levels =
    Array.isArray(thresholds) || edges ? thresholds : ticks(extent[0], extent[1], thresholds);
  // Holes close around themselves rather than leaving lines open
  const field = Array.from(values, (v) => (Number.isFinite(v) ? v : -Infinity));
  const generator = d3Contours().size([columns, rows]).smooth(smooth);
  if (typeof levels === 'number') generator.thresholds(levels);
  else generator.thresholds(levels);
  const onEdge = (x: number, y: number) => x <= 0 || y <= 0 || x >= columns || y >= rows;

  return generator(field).map((contour) => {
    const z = height(contour.value);
    const segments: number[] = [];
    for (const polygon of contour.coordinates) {
      for (const ring of polygon) {
        for (let k = 0; k < ring.length - 1; k++) {
          const [x0, y0] = ring[k];
          const [x1, y1] = ring[k + 1];
          // The rings close along the grid's edges, which aren't contour lines
          if (!edges && onEdge(x0, y0) && onEdge(x1, y1)) continue;
          // A contour's `(x, y)` is in cells, value `(i, j)` sitting at `(i + 0.5, j + 0.5)`
          const [ax, ay] = cellCenter(grid, x0 - 0.5, y0 - 0.5);
          const [bx, by] = cellCenter(grid, x1 - 0.5, y1 - 0.5);
          segments.push(ax, z, ay, bx, z, by);
        }
      }
    }
    return { value: contour.value, segments };
  });
}
