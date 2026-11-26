import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { geoIdentity } from 'd3-geo';
import { curveMonotoneX } from 'd3-shape';
import type { Object3D } from 'three';
import type { ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import Paths from './__fixtures__/Paths.svelte';

type Props = Omit<Parameters<typeof render<typeof Paths>>[1], 'onScene'>;

let chart: ChartState<any> | undefined;

/** Render, and wait for the marks to add their objects to the scene */
async function renderPaths(props: Props) {
  let scene: SceneState | undefined;
  render(Paths, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

/** Each mark's own group of objects, in the order they're declared */
const layers = (scene: SceneState) => scene.root.children.filter((o) => o.userData.layer);
/** A layer's outlines, and its filled mesh */
const linesOf = (layer: Object3D | undefined) =>
  layer?.children.find((o) => (o as any).isLineSegments2) as any;
const meshOf = (layer: Object3D | undefined) =>
  layer?.children.find((o) => (o as any).isMesh && !(o as any).isLineSegments2) as any;
/** A `Spline`'s lines (shown ones) */
const splines = (scene: SceneState) =>
  layers(scene)
    .flatMap((layer) => layer.children)
    .filter((o) => (o as any).isLine2 && o.visible) as any[];

/** Line segments' ends, as `[x, y]` pairs across and down the plot (with their height) */
const segmentsOf = (lines: any): [number, number, number][][] => {
  if (!lines?.visible) return [];
  const start = lines.geometry.attributes.instanceStart;
  const end = lines.geometry.attributes.instanceEnd;
  return Array.from({ length: start?.count ?? 0 }, (_, i) => [
    [start.getX(i), start.getZ(i), start.getY(i)],
    [end.getX(i), end.getZ(i), end.getY(i)],
  ]);
};
const segments = (layer: Object3D | undefined) => segmentsOf(linesOf(layer));
/** The farthest across a set of segments reaches */
const reach = (segs: [number, number, number][][]) => Math.max(...segs.flat().map(([x]) => x), 0);

/** The extent of a layer's filled mesh along an axis (`0` across, `2` down the plot) */
const extent = (layer: Object3D | undefined, axis: number): [number, number] => {
  const array = meshOf(layer)?.geometry.attributes.position?.array as Float32Array | undefined;
  const values = Array.from(array ?? []).filter((_, i) => i % 3 === axis);
  return values.length ? [Math.min(...values), Math.max(...values)] : [NaN, NaN];
};
const meshCount = (layer: Object3D | undefined) =>
  meshOf(layer)?.geometry.attributes.position?.count ?? 0;

/** What a `startContent` / `endContent` is given */
type Content = { point: DOMPoint; value: any };

const domain = { xDomain: [0, 10], yDomain: [0, 10] };
/** Five rows across the plot, the middle one missing its `y` */
const gapped = [0, 1, 2, 3, 4].map((x) => ({ x, y: x === 2 ? null : 5 }));

describe('Spline, as the core `Spline`', () => {
  const flat = {
    ...domain,
    data: [
      { x: 0, y: 5 },
      { x: 10, y: 5 },
    ],
    x: 'x',
    y: 'y',
  };

  it('draws its own `pathData` in place of its rows’ line', async () => {
    const scene = await renderPaths({
      mark: 'spline',
      chart: flat,
      spline: { pathData: 'M10,20L200,20', stroke: 'red' },
    });
    await expect
      .poll(() => layers(scene).flatMap((layer) => segments(layer)))
      .toEqual([
        [
          [expect.closeTo(10), expect.closeTo(20), expect.anything()],
          [expect.closeTo(200), expect.closeTo(20), expect.anything()],
        ],
      ]);
    expect(splines(scene)).toHaveLength(0);
  });

  it('draws its line from its start with `draw`', async () => {
    const scene = await renderPaths({
      mark: 'spline',
      chart: flat,
      spline: { draw: { duration: 1000 } },
    });
    const end = chart!.xScale(10);
    const drawn = () => reach(splines(scene).flatMap(segmentsOf));
    await expect.poll(() => drawn() > 10 && drawn() < end - 10).toBe(true);
    await expect.poll(drawn).toBeCloseTo(end);
  });

  it('dims its line by `strokeOpacity`', async () => {
    const scene = await renderPaths({
      mark: 'spline',
      chart: flat,
      spline: { strokeOpacity: 0.5, opacity: 0.5 },
    });
    await expect.poll(() => splines(scene)[0]?.material.opacity).toBeCloseTo(0.25);
  });

  it('adds nothing without a marker or content', async () => {
    const scene = await renderPaths({ mark: 'spline', chart: flat });
    await expect.poll(() => splines(scene).length).toBe(1);
    expect(layers(scene)).toHaveLength(1);
  });

  it('draws a `markerEnd` triangle with its tip at the line’s end', async () => {
    const scene = await renderPaths({
      mark: 'spline',
      chart: flat,
      spline: { markerEnd: 'triangle' },
    });
    await expect.poll(() => meshCount(layers(scene)[1])).toBe(3);
    // A pixel past the end, along the line (`refX` 9 of 10)
    expect(extent(layers(scene)[1], 0)[1]).toBeCloseTo(chart!.xScale(10) + 1);
    expect(extent(layers(scene)[1], 2)[0]).toBeCloseTo(chart!.yScale(5) - 5);
  });

  it('draws a `markerMid` at each row between its ends, a gap’s ends too', async () => {
    const scene = await renderPaths({
      mark: 'spline',
      chart: { xDomain: [0, 4], yDomain: [0, 10], data: gapped, x: 'x', y: 'y' },
      spline: { markerMid: 'dot' },
    });
    await expect.poll(() => meshCount(layers(scene)[1])).toBeGreaterThan(0);
    // Dots at rows 1 and 3, not the line's ends (rows 0 and 4)
    expect(extent(layers(scene)[1], 0)).toEqual([
      expect.closeTo(chart!.xScale(1) - 5),
      expect.closeTo(chart!.xScale(3) + 5),
    ]);
  });

  it('draws a `markerMid` only where a `curve`’s commands end', async () => {
    const scene = await renderPaths({
      mark: 'spline',
      chart: {
        ...domain,
        data: [
          { x: 0, y: 2 },
          { x: 5, y: 8 },
          { x: 10, y: 2 },
        ],
        x: 'x',
        y: 'y',
      },
      spline: { curve: curveMonotoneX, markerMid: 'dot' },
    });
    await expect.poll(() => meshCount(layers(scene)[1])).toBeGreaterThan(0);
    // One dot, at the middle row
    expect(extent(layers(scene)[1], 0)).toEqual([
      expect.closeTo(chart!.xScale(5) - 5),
      expect.closeTo(chart!.xScale(5) + 5),
    ]);
  });

  it('gives each line’s `startContent` / `endContent` its first and last points', async () => {
    const seen: { at: string; point: DOMPoint; value: any }[] = [];
    await renderPaths({
      mark: 'spline',
      chart: {
        ...domain,
        data: [
          { k: 'a', x: 1, y: 2 },
          { k: 'a', x: 9, y: 2 },
          { k: 'b', x: 1, y: 6 },
          { k: 'b', x: 9, y: 6 },
        ],
        x: 'x',
        y: 'y',
      },
      spline: { g: 'k' },
      onContent: (at: string, props: Content) => seen.push({ at, ...props }),
    });
    await expect.poll(() => seen.filter((s) => s.at === 'end').length).toBeGreaterThanOrEqual(2);
    const ends = seen.filter((s) => s.at === 'end').map((s) => s.value.y);
    expect(ends).toEqual(expect.arrayContaining([expect.closeTo(2), expect.closeTo(6)]));
    const start = seen.find((s) => s.at === 'start')!;
    expect(start.point.x).toBeCloseTo(chart!.xScale(1));
    expect(start.value.x).toBeCloseTo(1);
  });
});

describe('Area, as the core `Area`', () => {
  const band = {
    ...domain,
    data: [
      { x: 0, y: 5 },
      { x: 10, y: 5 },
    ],
    x: 'x',
    y: 'y',
  };

  it('dims its outline by `strokeOpacity`, not its fill or its line', async () => {
    const scene = await renderPaths({
      mark: 'area',
      chart: band,
      area: { stroke: 'black', strokeOpacity: 0.5, line: true },
    });
    await expect.poll(() => linesOf(layers(scene)[1])?.material.opacity).toBeCloseTo(0.5);
    expect(meshOf(layers(scene)[0]).material.opacity).toBeCloseTo(1);
    expect(linesOf(layers(scene)[0]).material.opacity).toBeCloseTo(1);
  });

  it('draws its outline from its start with `draw`', async () => {
    const scene = await renderPaths({
      mark: 'area',
      chart: band,
      area: { stroke: 'black', draw: { duration: 1000 } },
    });
    const outline = () => segments(layers(scene)[1]);
    // Along its top first...
    await expect
      .poll(() => outline().length > 0 && reach(outline()) < chart!.xScale(10) - 1)
      .toBe(true);
    // ...then around it, closed
    await expect.poll(() => outline().length).toBe(4);
  });

  it('marks its outline’s start with `markerStart`, and puts `endContent` where it closes', async () => {
    const seen: Record<string, { point: DOMPoint }> = {};
    const scene = await renderPaths({
      mark: 'area',
      chart: band,
      area: { stroke: 'black', markerStart: 'dot' },
      onContent: (at: string, props: Content) => (seen[at] = props),
    });
    await expect.poll(() => meshCount(layers(scene)[2])).toBeGreaterThan(0);
    const [x0, y5] = [chart!.xScale(0), chart!.yScale(5)];
    expect(extent(layers(scene)[2], 0)).toEqual([expect.closeTo(x0 - 5), expect.closeTo(x0 + 5)]);
    expect(extent(layers(scene)[2], 2)).toEqual([expect.closeTo(y5 - 5), expect.closeTo(y5 + 5)]);
    await expect.poll(() => seen.end?.point.x).toBeCloseTo(x0);
    expect(seen.end.point.y).toBeCloseTo(y5);
  });
});

describe('Link, as the core `Link`', () => {
  const one = { source: { x: 0, y: 0 }, target: { x: 100, y: 100 } };

  it('draws its own `pathData` in place of the path between its ends', async () => {
    const scene = await renderPaths({
      mark: 'link',
      link: { data: one, pathData: 'M10,20L200,20' },
    });
    await expect.poll(() => segments(layers(scene)[0]).length).toBeGreaterThan(0);
    const xs = segments(layers(scene)[0])
      .flat()
      .map(([x]) => x);
    expect([Math.min(...xs), Math.max(...xs)]).toEqual([expect.closeTo(10), expect.closeTo(200)]);
  });

  it('draws each link from its start with `draw`', async () => {
    const scene = await renderPaths({
      mark: 'link',
      link: { data: one, type: 'straight', draw: { duration: 1000 } },
    });
    const drawn = () => reach(segments(layers(scene)[0]));
    await expect.poll(() => drawn() > 5 && drawn() < 95).toBe(true);
    await expect.poll(drawn).toBeCloseTo(100);
  });

  it('raises each link by `z`', async () => {
    const scene = await renderPaths({
      mark: 'link',
      link: { data: one, type: 'straight', z: 30 },
    });
    await expect.poll(() => segments(layers(scene)[0]).length).toBe(1);
    // A little over it, as a link on the floor is
    expect(segments(layers(scene)[0])[0][0][2]).toBeCloseTo(30);
  });

  it('fills a flat link with `fill`, and nothing without one', async () => {
    const plain = await renderPaths({ mark: 'link', link: { data: one } });
    await expect.poll(() => segments(layers(plain)[0]).length).toBeGreaterThan(0);
    expect(meshCount(layers(plain)[0])).toBe(0);

    const scene = await renderPaths({
      mark: 'link',
      link: { data: one, type: 'square', fill: 'red', fillOpacity: 0.5 },
    });
    await expect.poll(() => meshCount(layers(scene)[0])).toBeGreaterThan(0);
    expect(meshOf(layers(scene)[0]).material.opacity).toBeCloseTo(0.5);
  });

  it('gives each link’s `startContent` / `endContent` its ends', async () => {
    const seen: { at: string; point: DOMPoint }[] = [];
    await renderPaths({
      mark: 'link',
      link: { data: [one, { source: { x: 0, y: 50 }, target: { x: 200, y: 50 } }] },
      onContent: (at: string, props: Content) => seen.push({ at, ...props }),
    });
    await expect.poll(() => seen.filter((s) => s.at === 'end').length).toBeGreaterThanOrEqual(2);
    const ends = seen.filter((s) => s.at === 'end').map((s) => s.point.x);
    expect(ends).toEqual(expect.arrayContaining([expect.closeTo(100), expect.closeTo(200)]));
  });
});

describe('GeoPath and Graticule, as the core marks', () => {
  const geo = { geo: { projection: geoIdentity } };
  /** Where the chart's projection puts a point */
  const at = (point: [number, number]) => (chart as any).geo.projection(point) as [number, number];
  const across = {
    type: 'LineString' as const,
    coordinates: [
      [0, 0],
      [50, 0],
      [50, 50],
    ],
  };

  it('draws its outlines from their start with `draw`', async () => {
    const scene = await renderPaths({
      mark: 'geoPath',
      chart: geo,
      geoPath: { geojson: across, draw: { duration: 1000 } },
    });
    const drawn = () => segments(layers(scene)[0]).length;
    // Along its first side before it turns...
    await expect
      .poll(() => {
        const segs = segments(layers(scene)[0]);
        const [[x0], [x1]] = [at([0, 0]), at([50, 0])];
        return segs.length === 1 && reach(segs) > x0 + 2 && reach(segs) < x1 - 2;
      })
      .toBe(true);
    // ...then all of it
    await expect.poll(drawn).toBe(2);
  });

  it('marks its line with `markerEnd` and `markerMid`, and gives `endContent` its end', async () => {
    const seen: Record<string, { point: DOMPoint }> = {};
    const scene = await renderPaths({
      mark: 'geoPath',
      chart: geo,
      geoPath: { geojson: across, markerMid: 'dot', markerEnd: 'triangle' },
      onContent: (at: string, props: Content) => (seen[at] = props),
    });
    await expect.poll(() => meshCount(layers(scene)[2])).toBe(3);
    const [corner, end, start] = [at([50, 0]), at([50, 50]), at([0, 0])];
    // The corner's dot, and the triangle's tip a pixel past the end, along the last side
    expect(extent(layers(scene)[1], 0)).toEqual([
      expect.closeTo(corner[0] - 5),
      expect.closeTo(corner[0] + 5),
    ]);
    const tip = extent(layers(scene)[2], 2);
    expect(end[1] > corner[1] ? tip[1] : tip[0]).toBeCloseTo(
      end[1] + Math.sign(end[1] - corner[1])
    );
    await expect.poll(() => seen.end?.point.y).toBeCloseTo(end[1]);
    expect(seen.start.point.x).toBeCloseTo(start[0]);
    expect(seen.start.point.y).toBeCloseTo(start[1]);
  });

  it('passes `markerEnd` to a `Graticule`’s lines', async () => {
    const scene = await renderPaths({
      mark: 'graticule',
      chart: geo,
      graticule: { geojson: across, markerEnd: 'triangle' },
    });
    await expect.poll(() => meshCount(layers(scene)[1])).toBe(3);
  });
});
