import { describe, it, expect } from 'vitest';
import { geoAlbers, geoArea, geoContains, geoOrthographic, geoPath } from 'd3-geo';
import { randomLcg } from 'd3-random';
import type { BinShape } from '../../Bin/Bin.shared.svelte.js';
import { sphereBinning, sphereGrid } from './GeoBin.sphere.js';

const shapes: BinShape[] = ['hexagon', 'square', 'triangle'];

describe('sphereGrid', () => {
  const counts = { hexagon: 10 * 6 * 6 + 2, triangle: 20 * 6 * 6, square: 2 * 6 * 6 };

  describe.each(shapes)('%s', (shape) => {
    const grid = sphereGrid(shape, 6);
    const polygons = Array.from({ length: grid.count }, (_, i) => grid.polygon(i));
    const areas = polygons.map((ring) => geoArea({ type: 'Polygon', coordinates: [ring] }));

    it('tiles the whole sphere', () => {
      expect(polygons).toHaveLength(counts[shape]);
      // A ring wound the wrong way would cover the rest of the sphere instead
      expect(areas.reduce((a, b) => a + b, 0)).toBeCloseTo(4 * Math.PI, 6);
    });

    if (shape === 'square') {
      it('lines up with a graticule', () => {
        // `k = 6`: 30° apart, so every corner sits on a meridian and parallel of a 30° graticule —
        // but for the poles, which the cells around them stop a hair short of
        const onGraticule = (v: number) =>
          Math.abs(v - Math.round(v)) < 0.01 && Math.round(v) % 30 === 0;
        for (const ring of polygons) {
          const [lons, lats] = [0, 1].map((c) => ring.map((p) => p[c]));
          expect([Math.min(...lons), Math.max(...lons)].every(onGraticule)).toBe(true);
          expect([Math.min(...lats), Math.max(...lats)].every(onGraticule)).toBe(true);
        }
      });
    } else {
      it('has cells of near-equal area', () => {
        expect(Math.min(...areas) / Math.max(...areas)).toBeGreaterThan(0.6);
      });
    }

    it('draws no cell inside out on a globe facing the equator', () => {
      // Its poles and the meridians 90° either side lie exactly on the horizon it's clipped at
      const path = geoPath(geoOrthographic().scale(100).translate([0, 0]));
      for (const ring of polygons) {
        const [[x0, y0], [x1, y1]] = path.bounds({ type: 'Polygon', coordinates: [ring] });
        // A 30° cell spans at most half the globe's radius; one inside out spans all of it
        expect(Math.max(x1 - x0, y1 - y0) || 0).toBeLessThan(100);
      }
    });

    it('finds the cell containing each point', () => {
      const random = randomLcg(7);
      for (let i = 0; i < 2000; i++) {
        const p: [number, number] = [
          random() * 360 - 180,
          (Math.asin(random() * 2 - 1) * 180) / Math.PI,
        ];
        const ring = grid.polygon(grid.find(p));
        expect(geoContains({ type: 'Polygon', coordinates: [ring] }, p)).toBe(true);
      }
    });
  });

  it("makes a fine graticule's cells only as they're asked for", () => {
    // 0.25°: over a million cells, too many to make up front
    const grid = sphereGrid('square', 720);
    expect(grid.count).toBe(720 * 1440);
    const i = grid.find([0.1, 0.1]);
    expect(grid.center(i)).toEqual([0.125, 0.125]);
    expect(geoContains({ type: 'Polygon', coordinates: [grid.polygon(i)] }, [0.1, 0.1])).toBe(true);
  });

  it('counts every cell of a flat map as facing the viewer', () => {
    const grid = sphereGrid('square', 36);
    // Unclipped, a flat projection's `clipAngle()` is `0`, not a globe's 90°
    const facing = sphereBinning.facing(geoAlbers(), grid);
    expect([0, 1000, grid.count - 1].every((i) => facing(grid.center(i)))).toBe(true);
    const globe = sphereBinning.facing(geoOrthographic(), grid);
    expect(globe([0, 0])).toBe(true);
    expect(globe([180, 0])).toBe(false);
  });

  it('spaces cells `step` degrees apart', () => {
    // 0.25° squares: 720 rows from pole to pole, whatever the projection's scale
    expect(sphereBinning.grid('square', 1, 1, 0.25).count).toBe(720 * 1440);
    // 3° between hexagon centers: the icosahedron's 63.4° edges divided 21 times
    expect(sphereBinning.grid('hexagon', 1, 1, 3).count).toBe(10 * 21 * 21 + 2);
  });

  it("sums a weight into each sphere cell's count", () => {
    const grid = sphereGrid('square', 18);
    const cells = sphereBinning.bin(
      [
        [1, 1, 100],
        [2, 2, 50],
        [100, 1, 7],
      ] as [number, number, number][],
      (d) => [d[0], d[1]],
      grid,
      (d) => d[2]
    );
    expect(cells.map((cell) => cell.count).sort((a, b) => a - b)).toEqual([7, 150]);
  });

  it('bins rows into the cells on the sphere', () => {
    const grid = sphereGrid('hexagon', 4);
    const rows = [
      [0, 0],
      [0.1, 0.1],
      [180, 0],
    ] as [number, number][];
    const cells = sphereBinning.bin(rows, (d) => d, grid);
    expect(cells.map((cell) => cell.count).sort()).toEqual([1, 2]);
    expect(cells.every((cell) => cell.center && Number.isNaN(cell.x))).toBe(true);
    // Each cell's ground, as a fraction of the sphere's 4π
    const centers = Array.from({ length: grid.count }, (_, i) => grid.center(i));
    const all = sphereBinning.bin(centers, (d) => d, grid);
    expect(all.reduce((sum, cell) => sum + cell.area, 0)).toBeCloseTo(4 * Math.PI, 6);
  });
});
