import { describe, it, expect } from 'vitest';
import { polygonArea, polygonContains } from 'd3-polygon';
import { randomLcg } from 'd3-random';
import { binCells, binGrid, binGridPath, type BinShape } from './Bin.shared.svelte.js';

const shapes: BinShape[] = ['hexagon', 'square', 'triangle'];

/** Points spread over `[-50, 350] × [-50, 250]`, so some fall left of and above the origin */
function randomPoints(n: number) {
  const random = randomLcg(42);
  return Array.from({ length: n }, () => [random() * 400 - 50, random() * 300 - 50] as const);
}

describe('binCells', () => {
  describe.each(shapes)('%s', (shape) => {
    const size = 17;
    const points = randomPoints(5000);
    const cells = binCells(points, (d) => [d[0], d[1]], { shape, size });

    it('puts every row in the cell containing it', () => {
      for (const cell of cells) {
        for (const [x, y] of cell.data) {
          // Grown a hair, for points exactly on an edge
          const grown = cell.polygon.map(
            ([px, py]) =>
              [cell.x + (px - cell.x) * 1.0001, cell.y + (py - cell.y) * 1.0001] as [number, number]
          );
          expect(polygonContains(grown, [x, y])).toBe(true);
        }
      }
    });

    it('counts every row once', () => {
      expect(cells.reduce((sum, cell) => sum + cell.count, 0)).toBe(points.length);
      for (const cell of cells) expect(cell.count).toBe(cell.data.length);
    });

    it('tiles the plane with cells `size` wide', () => {
      const area = Math.abs(polygonArea(cells[0].polygon));
      const expected = {
        hexagon: (size * size * Math.sqrt(3)) / 2,
        square: size * size,
        triangle: (size * size * Math.sqrt(3)) / 4,
      }[shape];
      expect(area).toBeCloseTo(expected, 6);
      expect(cells[0].area).toBeCloseTo(expected, 6);
      const xs = cells[0].polygon.map((p) => p[0]);
      expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(size, 6);
    });

    it('outlines a grid covering the whole plot', () => {
      const width = 300;
      const height = 200;
      const grid = binGrid(shape, size);
      const covered = new Set(grid.cover(width, height).map((c) => c.key));
      // Every point in the plot lands in a cell the grid outlines
      for (const [x, y] of points) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          expect(covered.has(grid.locate(x, y).key)).toBe(true);
        }
      }
      // One subpath per cell
      expect(binGridPath(shape, size, width, height).match(/M/g)).toHaveLength(covered.size);
    });
  });

  it('bins against the grid scaled down, its cells scaled back up', () => {
    const points = randomPoints(500);
    const flat = binCells(points, ([x, y]) => [x / 3, y / 3], { shape: 'hexagon', size: 10 });
    const scaled = binCells(points, ([x, y]) => [x, y], { shape: 'hexagon', size: 10, scale: 3 });
    expect(scaled.map((c) => c.count)).toEqual(flat.map((c) => c.count));
    expect(scaled[0].x).toBeCloseTo(flat[0].x * 3, 9);
    expect(scaled[0].area).toBeCloseTo(flat[0].area * 9, 6);
    expect(scaled[0].polygon[0][1]).toBeCloseTo(flat[0].polygon[0][1] * 3, 9);
  });

  it("sums a weight into each cell's count", () => {
    const rows = [
      { at: [5, 5], people: 120 },
      { at: [6, 6], people: 30 },
      { at: [25, 5], people: Number.NaN },
    ];
    const cells = binCells(rows, (d) => d.at as [number, number], {
      shape: 'square',
      size: 10,
      weight: (d) => d.people,
    });
    // A weight that isn't a number counts for nothing
    expect(cells.map((cell) => [cell.data.length, cell.count])).toEqual([
      [2, 150],
      [1, 0],
    ]);
  });

  it('skips rows without a position', () => {
    const cells = binCells([1, 2, 3], (d) => (d === 2 ? null : d === 3 ? [NaN, 0] : [5, 5]), {
      shape: 'square',
      size: 10,
    });
    expect(cells).toHaveLength(1);
    expect(cells[0]).toMatchObject({ x: 5, y: 5, count: 1, data: [1] });
  });
});
