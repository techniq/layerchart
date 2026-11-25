import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { geoAlbersUsa, geoEquirectangular } from 'd3-geo';

import VoronoiChart from './__fixtures__/VoronoiChart.svelte';
import type { VoronoiCell } from './Voronoi.shared.svelte.js';
import { shapeLabel } from '$lib/utils/shapeLabel.js';

/** Render, and wait for the cells handed to the `children` snippet */
async function renderCells(props: Record<string, any>) {
  let cells: VoronoiCell[] = [];
  const screen = render(VoronoiChart, {
    props: { ...props, oncells: (c: VoronoiCell[]) => (cells = c) },
  } as any);
  await vi.waitFor(() => expect(cells.length).toBeGreaterThan(0));
  return { cells, container: screen.container };
}

/** Bounds of a path's points (its `M`/`L` commands) */
function pathBounds(path: string) {
  const numbers = path.match(/-?[\d.]+(e-?\d+)?/g)!.map(Number);
  const xs = numbers.filter((_, i) => i % 2 === 0);
  const ys = numbers.filter((_, i) => i % 2 === 1);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

describe('Voronoi `clip`', () => {
  // The left half of the 200px plot
  const leftHalf: [number, number][] = [
    [0, 0],
    [100, 0],
    [100, 200],
    [0, 200],
  ];

  it('cuts each cell to a pixel polygon', async () => {
    // At (50, 100) and (150, 100) px: the left cell is the left half, the right cell is outside it
    const { cells, container } = await renderCells({
      data: [
        { x: 25, y: 50 },
        { x: 75, y: 50 },
      ],
      clip: leftHalf,
    });

    expect(cells[0].area).toBeCloseTo(100 * 200, -1);
    expect(cells[1].path).toBeNull();
    expect(cells[1].area).toBe(0);

    // Only the cell within the clip is drawn (for hovering), and within it
    const paths = [...container.querySelectorAll('path.lc-voronoi-path')];
    expect(paths).toHaveLength(1);
    const bounds = pathBounds(paths[0].getAttribute('d')!);
    expect(bounds.x1).toBeLessThanOrEqual(100.001);
  });

  it("gives each cell's visual center, and the room there", async () => {
    const { cells } = await renderCells({ data: [{ x: 25, y: 50 }], clip: leftHalf });
    // The left half (100 × 200) has the most room along its middle, 50 from its sides
    expect(cells[0].center!.x).toBeCloseTo(50, 0);
    expect(cells[0].center!.distance).toBeCloseTo(50, 0);
  });

  it("gives each cell's pieces, for `shapeLabel()` with other options", async () => {
    const { cells } = await renderCells({ data: [{ x: 25, y: 50 }], clip: leftHalf });
    expect(cells[0].polygons).toHaveLength(1);
    // The left half (100 × 200) fits a 100 × 100 square, and a 1:2 rectangle as big as itself
    expect(shapeLabel(cells[0].polygons, { fit: 'rect' }).distance).toBeCloseTo(50, 0);
    expect(shapeLabel(cells[0].polygons, { fit: 'rect', aspect: 0.5 }).distance).toBeCloseTo(50, 0);
  });

  it('splits a shared location between its points', async () => {
    const { cells } = await renderCells({
      data: [
        { x: 25, y: 50 },
        { x: 25, y: 50 },
      ],
      clip: leftHalf,
    });
    expect(cells[0].area).toBeCloseTo(cells[1].area, -2);
    expect(cells[0].area + cells[1].area).toBeCloseTo(100 * 200, -1);
  });

  it('leaves every cell empty when `clip` has no area', async () => {
    const data = [
      { x: 25, y: 50 },
      { x: 75, y: 50 },
    ];
    for (const clip of [
      [],
      [
        [0, 0],
        [100, 0],
      ],
    ]) {
      const { cells, container } = await renderCells({ data, clip });
      expect(cells.map((c) => [c.path, c.area, c.polygons.length])).toEqual([
        [null, 0, 0],
        [null, 0, 0],
      ]);
      expect(container.querySelectorAll('path.lc-voronoi-path')).toHaveLength(0);
    }
  });

  it('leaves every cell empty when the projection drops `clip`', async () => {
    // A square off `geoAlbersUsa`'s lower 48 and insets (in the Atlantic), around a point in Kansas
    const atlantic = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-40, 30],
          [-40, 40],
          [-30, 40],
          [-30, 30],
          [-40, 30],
        ],
      ],
    };
    const kansas = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-102, 37],
          [-102, 40],
          [-94.6, 40],
          [-94.6, 37],
          [-102, 37],
        ],
      ],
    };
    const { cells } = await renderCells({
      projection: geoAlbersUsa,
      fitGeojson: kansas,
      clip: atlantic,
      data: [{ x: -98, y: 38.5 }],
    });
    expect(cells[0].path).toBeNull();
    expect(cells[0].area).toBe(0);
  });

  it('cuts cells to a GeoJSON feature in a geo chart, measured on screen', async () => {
    const square = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-10, -10],
          [-10, 10],
          [10, 10],
          [10, -10],
          [-10, -10],
        ],
      ],
    };
    const geo = { projection: geoEquirectangular, fitGeojson: square, clip: square };

    // Within 2%, as the square's top and bottom (great circles, not parallels) bulge on screen
    const near = (value: number, expected: number) =>
      expect(Math.abs(value - expected) / expected).toBeLessThan(0.02);

    // One point gets the whole square (on the sphere, a single point's cell has no edges)
    const one = await renderCells({ ...geo, data: [{ x: 0, y: 0 }] });
    near(one.cells[0].area, 200 * 200);

    // Two get a half each
    const two = await renderCells({
      ...geo,
      data: [
        { x: -5, y: 0 },
        { x: 5, y: 0 },
      ],
    });
    near(two.cells[0].area, 100 * 200);
    near(two.cells[1].area, 100 * 200);
  });
});
