import { describe, it, expect } from 'vitest';
import { geoArea, geoContains, geoOrthographic, geoPath } from 'd3-geo';
import { randomLcg } from 'd3-random';
import type { BinShape } from '../../Bin/Bin.shared.svelte.js';
import { sphereBinning, sphereGrid } from './GeoBin.sphere.js';

const shapes: BinShape[] = ['hexagon', 'square', 'triangle'];

describe('sphereGrid', () => {
  const counts = { hexagon: 10 * 6 * 6 + 2, triangle: 20 * 6 * 6, square: 2 * 6 * 6 };

  describe.each(shapes)('%s', (shape) => {
    const grid = sphereGrid(shape, 6);
    const areas = grid.polygons.map((ring) => geoArea({ type: 'Polygon', coordinates: [ring] }));

    it('tiles the whole sphere', () => {
      expect(grid.polygons).toHaveLength(counts[shape]);
      // A ring wound the wrong way would cover the rest of the sphere instead
      expect(areas.reduce((a, b) => a + b, 0)).toBeCloseTo(4 * Math.PI, 6);
    });

    if (shape === 'square') {
      it('lines up with a graticule', () => {
        // `k = 6`: 30° apart, so every corner sits on a meridian and parallel of a 30° graticule —
        // but for the poles, which the cells around them stop a hair short of
        const onGraticule = (v: number) =>
          Math.abs(v - Math.round(v)) < 0.01 && Math.round(v) % 30 === 0;
        for (const ring of grid.polygons) {
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
      for (const ring of grid.polygons) {
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
        const ring = grid.polygons[grid.find(p)];
        expect(geoContains({ type: 'Polygon', coordinates: [ring] }, p)).toBe(true);
      }
    });
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
  });
});
