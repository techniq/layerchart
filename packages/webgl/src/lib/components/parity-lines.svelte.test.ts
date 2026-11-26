import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { geoIdentity } from 'd3-geo';
import type { Object3D } from 'three';
import type { ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import Lines from './__fixtures__/Lines.svelte';

type Props = Omit<Parameters<typeof render<typeof Lines>>[1], 'onScene'>;

let chart: ChartState<any> | undefined;

/** Render, and wait for the marks to add their objects to the scene */
async function renderLines(props: Props) {
  let scene: SceneState | undefined;
  const result = render(Lines, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return {
    scene: scene!,
    rerender: (next: Props) => result.rerender({ ...(next as any), onScene: () => {} }),
  };
}

/** Each mark's own group of objects, in the order they're declared */
const layers = (scene: SceneState) => scene.root.children.filter((o) => o.userData.layer);
/** A layer's outlines, and its filled mesh */
const linesOf = (layer: Object3D | undefined) =>
  layer?.children.find((o) => (o as any).isLineSegments2) as any;
const meshOf = (layer: Object3D | undefined) =>
  layer?.children.find((o) => (o as any).isMesh && !(o as any).isLineSegments2) as any;

/** A layer's outline segments, as `[x, y]` pairs across and down the plot */
const segments = (layer: Object3D | undefined): [number, number][][] => {
  const lines = linesOf(layer);
  if (!lines?.visible) return [];
  const start = lines.geometry.attributes.instanceStart;
  const end = lines.geometry.attributes.instanceEnd;
  return Array.from({ length: start?.count ?? 0 }, (_, i) => [
    [start.getX(i), start.getZ(i)],
    [end.getX(i), end.getZ(i)],
  ]);
};

/** The extent of a layer's filled mesh along an axis (`0` across, `2` down the plot) */
const extent = (layer: Object3D | undefined, axis: number): [number, number] => {
  const array = meshOf(layer)?.geometry.attributes.position?.array as Float32Array | undefined;
  const values = Array.from(array ?? []).filter((_, i) => i % 3 === axis);
  return values.length ? [Math.min(...values), Math.max(...values)] : [NaN, NaN];
};

const tween = { type: 'tween' as const, duration: 400 };

describe('Line, as the core `Line`', () => {
  const across = { x1: 100, y1: 50, x2: 200, y2: 50 };

  it('eases from `initialX1` with `motion`', async () => {
    const { scene } = await renderLines({
      mark: 'line',
      line: { ...across, initialX1: 0, motion: tween },
    });
    const startX = () => segments(layers(scene)[0])[0]?.[0][0] ?? NaN;
    // On its way from its initial start...
    await expect.poll(() => startX() > 1 && startX() < 99).toBe(true);
    // ...to where it's asked to be
    await expect.poll(startX).toBeCloseTo(100);
  });

  it('eases a row to its new place by its `key`, appearing where it is', async () => {
    const props = (x: number): Props => ({
      mark: 'line',
      chart: { xDomain: [0, 10], yDomain: [0, 10] },
      line: {
        data: [{ id: 'a', x }],
        key: (d: any) => d.id,
        x1: 'x',
        y1: 10,
        x2: 'x',
        y2: 100,
        initialX1: 0,
        motion: tween,
      },
    });
    const { scene, rerender } = await renderLines(props(2));
    const startX = () => segments(layers(scene)[0])[0]?.[0][0] ?? NaN;
    // At once where it's first asked to be (its `initial` ends are for pixel mode)
    await expect.poll(startX).toBeCloseTo(chart!.xScale(2));
    await rerender(props(8));
    const [from, to] = [chart!.xScale(2), chart!.xScale(8)];
    await expect.poll(() => startX() > from + 1 && startX() < to - 1).toBe(true);
    await expect.poll(startX).toBeCloseTo(to);
  });

  it('dashes with `dashArray`, solid without', async () => {
    const plain = await renderLines({ mark: 'line', line: across });
    await expect.poll(() => segments(layers(plain.scene)[0]).length).toBe(1);
    expect(linesOf(layers(plain.scene)[0]).material.dashed).toBe(false);

    const { scene } = await renderLines({ mark: 'line', line: { ...across, dashArray: '4 2' } });
    const material = () => linesOf(layers(scene)[0])?.material;
    await expect.poll(() => material()?.dashed).toBe(true);
    expect(material().dashSize).toBeCloseTo(4 * scene.unit);
    expect(material().gapSize).toBeCloseTo(2 * scene.unit);
  });

  it('dims its stroke by `strokeOpacity`', async () => {
    const { scene } = await renderLines({
      mark: 'line',
      line: { ...across, strokeOpacity: 0.5, opacity: 0.5 },
    });
    await expect.poll(() => linesOf(layers(scene)[0])?.material.opacity).toBeCloseTo(0.25);
  });

  it('adds nothing without a marker', async () => {
    const { scene } = await renderLines({ mark: 'line', line: across });
    await expect.poll(() => segments(layers(scene)[0]).length).toBe(1);
    expect(layers(scene)).toHaveLength(1);
  });

  it('draws a `markerEnd` triangle with its tip at the end, pointing along the line', async () => {
    const { scene } = await renderLines({
      mark: 'line',
      line: { ...across, markerEnd: 'triangle' },
    });
    await expect.poll(() => layers(scene).length).toBe(2);
    const marker = () => layers(scene)[1];
    await expect.poll(() => meshOf(marker())?.geometry.attributes.position?.count ?? 0).toBe(3);
    // As the core `Marker`: 10px, its tip a pixel past the end (`refX` 9)
    expect(extent(marker(), 0)[0]).toBeCloseTo(191);
    expect(extent(marker(), 0)[1]).toBeCloseTo(201);
    expect(extent(marker(), 2)[0]).toBeCloseTo(45);
    expect(extent(marker(), 2)[1]).toBeCloseTo(55);
  });

  it('turns a `markerStart` back from the line (`auto-start-reverse`)', async () => {
    const { scene } = await renderLines({
      mark: 'line',
      line: { ...across, markerStart: 'triangle' },
    });
    await expect
      .poll(() => meshOf(layers(scene)[1])?.geometry.attributes.position?.count ?? 0)
      .toBe(3);
    expect(extent(layers(scene)[1], 0)[0]).toBeCloseTo(99);
    expect(extent(layers(scene)[1], 0)[1]).toBeCloseTo(109);
  });

  it('draws an `arrow` marker as lines, and `marker` at both ends', async () => {
    const { scene } = await renderLines({
      mark: 'line',
      line: { ...across, marker: { type: 'arrow', size: 20 } },
    });
    // Its start's and its end's (a straight line has no mid points)
    await expect.poll(() => layers(scene).length).toBe(4);
    const end = layers(scene)[3];
    await expect.poll(() => segments(end).length).toBe(2);
    // 20px: from 18px back of the end to 2px past it
    const xs = segments(end)
      .flat()
      .map(([x]) => x);
    expect(Math.min(...xs)).toBeCloseTo(182);
    expect(Math.max(...xs)).toBeCloseTo(202);
    expect(segments(layers(scene)[2])).toEqual([]);
  });
});

describe('Path, as the core `Path`', () => {
  it('dims its outline by `strokeOpacity`, not its fill', async () => {
    const { scene } = await renderLines({
      mark: 'path',
      path: { pathData: 'M0,0L100,0L100,100Z', fill: 'red', stroke: 'black', strokeOpacity: 0.5 },
    });
    await expect.poll(() => linesOf(layers(scene)[0])?.material.opacity).toBeCloseTo(0.5);
    expect(meshOf(layers(scene)[0]).material.opacity).toBeCloseTo(1);
  });

  it('draws a `markerMid` at each vertex between its ends', async () => {
    const { scene } = await renderLines({
      mark: 'path',
      path: { pathData: 'M0,0L50,0L50,50L100,50', markerMid: 'dot' },
    });
    await expect.poll(() => layers(scene).length).toBe(2);
    const mid = layers(scene)[1];
    // Two dots, a circle 10px across about each corner
    await expect.poll(() => extent(mid, 0)[0]).toBeCloseTo(45);
    expect(extent(mid, 0)[1]).toBeCloseTo(55);
    expect(extent(mid, 2)[0]).toBeCloseTo(-5);
    expect(extent(mid, 2)[1]).toBeCloseTo(55);
  });

  it('draws only where its commands end on a curve, not its every piece', async () => {
    const { scene } = await renderLines({
      mark: 'path',
      path: { pathData: 'M0,0C30,0 30,50 60,50L120,50', markerMid: 'dot' },
    });
    await expect
      .poll(() => meshOf(layers(scene)[1])?.geometry.attributes.position?.count ?? 0)
      .toBeGreaterThan(0);
    // One dot, at the curve's end
    expect(extent(layers(scene)[1], 0)).toEqual([expect.closeTo(55, 1), expect.closeTo(65, 1)]);
  });

  it('draws its outline from its start with `draw`', async () => {
    const { scene } = await renderLines({
      mark: 'path',
      path: { pathData: 'M0,0L200,0', draw: { duration: 400 } },
    });
    const reach = () =>
      Math.max(
        ...segments(layers(scene)[0])
          .flat()
          .map(([x]) => x),
        0
      );
    await expect.poll(() => reach() > 10 && reach() < 190).toBe(true);
    await expect.poll(reach).toBeCloseTo(200);
  });

  it('gives `startContent` / `endContent` its first and last points', async () => {
    const seen: Record<string, { point: DOMPoint; value: any }> = {};
    await renderLines({
      mark: 'path',
      chart: { xDomain: [0, 10], yDomain: [0, 10] },
      path: { pathData: 'M10,20L200,40' },
      onContent: (at: string, props: { point: DOMPoint; value: any }) => (seen[at] = props),
    });
    await expect.poll(() => seen.end?.point.x).toBeCloseTo(200);
    expect(seen.end.point.y).toBeCloseTo(40);
    expect([seen.start.point.x, seen.start.point.y]).toEqual([10, 20]);
    expect(seen.end.value.x).toBeCloseTo((chart!.xScale as any).invert(200));
  });
});

describe('Link, as the core `Link`', () => {
  it('draws a `sankey` link from its source’s right edge to its target’s left', async () => {
    const { scene } = await renderLines({
      mark: 'link',
      link: {
        sankey: true,
        type: 'straight',
        data: { source: { x0: 0, x1: 10 }, target: { x0: 100, x1: 110 }, y0: 20, y1: 60 },
      },
    });
    await expect.poll(() => segments(layers(scene)[0]).length).toBe(1);
    expect(segments(layers(scene)[0])[0]).toEqual([
      [expect.closeTo(10), expect.closeTo(20)],
      [expect.closeTo(100), expect.closeTo(60)],
    ]);
  });

  it('lays a `radial` link out by angle and radius about the origin', async () => {
    const { scene } = await renderLines({
      mark: 'link',
      link: {
        radial: true,
        type: 'straight',
        data: { source: { x: 0, y: 0 }, target: { x: Math.PI / 2, y: 50 } },
      },
    });
    await expect.poll(() => segments(layers(scene)[0]).length).toBe(1);
    // A quarter turn clockwise from up: straight across
    expect(segments(layers(scene)[0])[0][1]).toEqual([expect.closeTo(50), expect.closeTo(0)]);
  });

  it('marks each link’s end with `markerEnd`, and a `square` link’s corners with `markerMid`', async () => {
    const { scene } = await renderLines({
      mark: 'link',
      link: {
        type: 'square',
        data: [{ source: { x: 0, y: 0 }, target: { x: 100, y: 100 } }],
        markerMid: 'square',
        markerEnd: 'triangle',
      },
    });
    await expect.poll(() => layers(scene).length).toBe(3);
    await expect
      .poll(() => meshOf(layers(scene)[1])?.geometry.attributes.position?.count ?? 0)
      .toBeGreaterThan(0);
    await expect
      .poll(() => meshOf(layers(scene)[2])?.geometry.attributes.position?.count ?? 0)
      .toBe(3);
    // The triangle's tip at the target, a pixel past it
    expect(extent(layers(scene)[2], 2)[1]).toBeCloseTo(101);
  });
});

describe('Polygon and Vector, as the core marks', () => {
  it('eases a `Polygon` from `initialCx` with `motion`', async () => {
    const { scene } = await renderLines({
      mark: 'polygon',
      polygon: { cx: 200, initialCx: 0, cy: 100, r: 20, motion: tween },
    });
    const center = () => {
      const [a, b] = extent(layers(scene)[0], 0);
      return (a + b) / 2;
    };
    await expect.poll(() => center() > 5 && center() < 195).toBe(true);
    await expect.poll(center).toBeCloseTo(200);
  });

  it('eases a `Vector`’s length from `initialLength` with `motion`', async () => {
    const { scene } = await renderLines({
      mark: 'vector',
      vector: { x: 100, y: 100, length: 80, initialLength: 0, rotate: 90, motion: tween },
    });
    /** Its stem's length */
    const length = () => {
      const [[from, to] = [[0], [0]]] = segments(layers(scene)[0]);
      return Math.abs(to[0] - from[0]);
    };
    await expect.poll(() => length() > 2 && length() < 78).toBe(true);
    await expect.poll(length).toBeCloseTo(80);
  });
});

describe('Graticule, as the core `Graticule`', () => {
  it('draws its own `geojson` in place of the graticule’s', async () => {
    const { scene } = await renderLines({
      mark: 'graticule',
      chart: { geo: { projection: geoIdentity } },
      graticule: {
        geojson: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [50, 0],
          ],
        },
      },
    });
    await expect.poll(() => segments(layers(scene)[0]).length).toBe(1);
  });
});
